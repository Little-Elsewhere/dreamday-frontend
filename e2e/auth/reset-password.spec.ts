import { expect, test } from 'playwright/test'

test('shows a missing-token state without a reset token', async ({ page }) => {
  const response = await page.goto('/en/auth/reset-password')
  expect(response?.status()).toBe(200)

  await expect(page.getByRole('heading', { name: 'Reset link incomplete' })).toBeVisible()
  await expect(
    page.getByText('Open the password reset link from your email to continue.'),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
    'href',
    '/en/auth/login',
  )
})

test('validates a short new password when a token is present', async ({ page }) => {
  await page.goto('/en/auth/reset-password?token=example-reset-token')

  await expect(page.getByRole('heading', { name: 'Choose a new password' })).toBeVisible()
  await page.getByLabel('New password', { exact: true }).fill('short')
  await page.getByLabel('Confirm new password').fill('short')
  await page.getByRole('button', { name: 'Save new password', exact: true }).click()

  await expect(page.locator('#reset-password-error')).toHaveText(
    'Use at least 12 characters for your password.',
  )
  await expect(page).toHaveURL(/\/en\/auth\/reset-password\?token=example-reset-token$/)
})

test('validates password mismatch on reset', async ({ page }) => {
  await page.goto('/en/auth/reset-password?token=example-reset-token')

  await page.getByLabel('New password', { exact: true }).fill('password-12345')
  await page.getByLabel('Confirm new password').fill('password-54321')
  await page.getByRole('button', { name: 'Save new password', exact: true }).click()

  await expect(page.locator('#reset-confirm-password-error')).toHaveText(
    'The passwords do not match.',
  )
  await expect(page).toHaveURL(/\/en\/auth\/reset-password\?token=example-reset-token$/)
})
