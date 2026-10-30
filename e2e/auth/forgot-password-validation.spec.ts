import { expect, test } from 'playwright/test'

test('opens forgot-password dialog and validates the email', async ({ page }) => {
  await page.goto('/en/auth/login')

  await page.getByRole('button', { name: 'Forgot password?' }).click()
  await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible()

  const email = page.locator('#reset-email')
  await email.fill('not-an-email')
  await page.getByRole('button', { name: 'Send instructions', exact: true }).click()

  await expect(page.locator('#reset-email-error')).toHaveText('Enter a valid email address.')
  await expect(email).toHaveAttribute('aria-invalid', 'true')
  await expect(page).toHaveURL(/\/en\/auth\/login$/)
})

test('requires an email before sending reset instructions', async ({ page }) => {
  await page.goto('/en/auth/login')
  await page.getByRole('button', { name: 'Forgot password?' }).click()

  await page.locator('#reset-email').fill('')
  await page.getByRole('button', { name: 'Send instructions', exact: true }).click()

  await expect(page.locator('#reset-email-error')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible()
})

test('prefills forgot-password email from the login form', async ({ page }) => {
  await page.goto('/en/auth/login')
  await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com')
  await page.getByRole('button', { name: 'Forgot password?' }).click()

  await expect(page.locator('#reset-email')).toHaveValue('user@example.com')
})
