import type { BrowserContext } from 'playwright/test'
import { expect, test as base } from 'playwright/test'

import { Locale } from '../../src/constants/locale'
import { registerUser } from '../support/auth/register'
import { E2E_BASE_URL } from '../support/constants/urls'
import { deleteUser } from '../support/database/database'
import { confirmEmail } from '../support/mail/mailpit'
import { generateEmail, generatePassword } from '../utils/auth'

type AuthenticatedWorker = {
  storageState: Awaited<ReturnType<BrowserContext['storageState']>>
}

type TestFixtures = {
  storageState: AuthenticatedWorker['storageState']
}

type WorkerFixtures = {
  authenticatedWorker: AuthenticatedWorker
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  authenticatedWorker: [
    async ({ browser }, provideAuthenticatedWorker) => {
      const email = generateEmail('worker')
      const password = generatePassword()
      const context = await browser.newContext({ baseURL: E2E_BASE_URL })

      try {
        const page = await context.newPage()
        await registerUser(page, email, password, Locale.EN)
        await confirmEmail(page, email)

        await provideAuthenticatedWorker({ storageState: await context.storageState() })
      } finally {
        try {
          await context.close()
        } finally {
          await deleteUser(email)
        }
      }
    },
    { scope: 'worker' },
  ],
  storageState: async ({ authenticatedWorker }, provideStorageState) => {
    await provideStorageState(authenticatedWorker.storageState)
  },
})

export { expect }
