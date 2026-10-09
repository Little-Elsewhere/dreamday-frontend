import { access, mkdir } from 'node:fs/promises'
import path from 'node:path'

import { expect, test as base } from 'playwright/test'

import {
  completeSignupConfirmation,
  registerThroughUi,
  signInThroughUi,
} from '../support/auth-flow'
import { findLocalAuthUser, resendLocalSignupConfirmation } from '../support/local-supabase'

type WorkerAccount = {
  email: string
  password: string
}

type TestFixtures = {
  workerAccount: WorkerAccount
}

type WorkerFixtures = {
  workerStorageState: string
}

const APP_BASE_URL = 'http://127.0.0.1:4001'
const ACCOUNT_PASSWORD = process.env.E2E_WORKER_PASSWORD ?? 'Dreamday-E2E-Local-2026!'

const workerAccountFor = (parallelIndex: number): WorkerAccount => ({
  email: `playwright-worker-${parallelIndex + 1}@dreamday-e2e.test`,
  password: ACCOUNT_PASSWORD,
})

export const test = base.extend<TestFixtures, WorkerFixtures>({
  workerStorageState: [
    async ({ browser }, use, workerInfo) => {
      const account = workerAccountFor(workerInfo.parallelIndex)
      const storageDirectory = path.resolve(process.cwd(), 'test-results/.auth')
      const storageStatePath = path.join(
        storageDirectory,
        `${workerInfo.project.name}-worker-${workerInfo.parallelIndex}.json`,
      )

      await mkdir(storageDirectory, { recursive: true })

      const context = await browser.newContext()
      try {
        const page = await context.newPage()
        const existingUser = await findLocalAuthUser(account.email)

        if (!existingUser) {
          const submittedAt = await registerThroughUi(
            page,
            APP_BASE_URL,
            account.email,
            account.password,
          )
          await expect(page).toHaveURL(/\/en\/auth\/register\/success$/)
          await completeSignupConfirmation(page, APP_BASE_URL, account.email, submittedAt)
        } else if (!existingUser.email_confirmed_at) {
          const resentAt = Date.now()
          await resendLocalSignupConfirmation(account.email)
          await completeSignupConfirmation(page, APP_BASE_URL, account.email, resentAt)
        } else {
          await signInThroughUi(page, APP_BASE_URL, account.email, account.password)
        }

        await context.storageState({ path: storageStatePath })
      } finally {
        await context.close()
      }

      await use(storageStatePath)
    },
    { scope: 'worker' },
  ],
  storageState: async ({ workerStorageState }, use) => {
    await use(workerStorageState)
  },
  workerAccount: async ({ workerStorageState }, use, workerInfo) => {
    await access(workerStorageState)
    await use(workerAccountFor(workerInfo.parallelIndex))
  },
})

export { expect }
