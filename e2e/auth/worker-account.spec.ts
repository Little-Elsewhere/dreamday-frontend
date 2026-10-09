import { expect, test } from '../fixtures/authenticated-test'
import { findLocalAuthUser } from '../support/local-supabase'

test('worker account is confirmed and can open the private trips page', async ({
  page,
  workerAccount,
}) => {
  const user = await findLocalAuthUser(workerAccount.email)
  expect(user?.email_confirmed_at).toBeTruthy()

  await page.goto('/en/trips')
  await expect(page).toHaveURL(/\/en\/trips$/)
})

test('worker session remains authenticated after a page reload', async ({ page }) => {
  await page.goto('/en/trips')
  await page.reload()
  await expect(page).toHaveURL(/\/en\/trips$/)
})
