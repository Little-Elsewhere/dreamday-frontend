import { randomUUID } from 'node:crypto'

import { expect, test } from 'playwright/test'

import { completeSignupConfirmation, registerThroughUi } from '../support/auth-flow'
import { deleteLocalAuthUser, findLocalAuthUser } from '../support/local-supabase'

const APP_BASE_URL = 'http://127.0.0.1:4001'
const PASSWORD = process.env.E2E_WORKER_PASSWORD ?? 'Dreamday-E2E-Local-2026!'

test('registers an account and confirms it through the email link', async ({ page }) => {
  const email = `playwright-register-${randomUUID()}@dreamday-e2e.test`

  try {
    const submittedAt = await registerThroughUi(page, APP_BASE_URL, email, PASSWORD)
    await expect(page).toHaveURL(/\/en\/auth\/register\/success$/)
    await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible()

    await completeSignupConfirmation(page, APP_BASE_URL, email, submittedAt)
    await expect(page).toHaveURL(/\/en\/trips$/)

    const user = await findLocalAuthUser(email)
    expect(user?.email_confirmed_at).toBeTruthy()
  } finally {
    await deleteLocalAuthUser(email)
  }
})
