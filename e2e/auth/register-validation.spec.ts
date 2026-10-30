import { expect, test } from 'playwright/test'

test('shows register validation errors before calling the API', async ({ page }) => {
  const response = await page.goto('/en/auth/register')
  expect(response?.status()).toBe(200)
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()

  await page.getByRole('textbox', { name: 'Email' }).fill('not-an-email')
  await page.getByLabel('Password', { exact: true }).fill('short')
  await page.getByLabel('Confirm password').fill('different-pass')
  await page.getByRole('button', { name: 'Create account', exact: true }).click()

  await expect(page.locator('#register-email-error')).toHaveText('Enter a valid email address.')
  await expect(page.locator('#register-password-error')).toHaveText(
    'Use at least 12 characters for your password.',
  )
  await expect(page).toHaveURL(/\/en\/auth\/register$/)
})

test('shows a password mismatch error on register', async ({ page }) => {
  await page.goto('/en/auth/register')

  await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com')
  await page.getByLabel('Password', { exact: true }).fill('password-12345')
  await page.getByLabel('Confirm password').fill('password-54321')
  await page.getByRole('button', { name: 'Create account', exact: true }).click()

  await expect(page.locator('#confirm-password-error')).toHaveText('The passwords do not match.')
  await expect(page.getByLabel('Confirm password')).toHaveAttribute('aria-invalid', 'true')
  await expect(page).toHaveURL(/\/en\/auth\/register$/)
})

test('requires confirm password on register', async ({ page }) => {
  await page.goto('/en/auth/register')

  await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com')
  await page.getByLabel('Password', { exact: true }).fill('password-12345')
  await page.getByRole('button', { name: 'Create account', exact: true }).click()

  await expect(page.locator('#confirm-password-error')).toHaveText('Confirm your password.')
  await expect(page).toHaveURL(/\/en\/auth\/register$/)
})

test('links back to login from register', async ({ page }) => {
  await page.goto('/en/auth/register')
  const loginLink = page.getByRole('link', { name: 'Sign in' })
  await expect(loginLink).toHaveAttribute('href', '/en/auth/login')

  await Promise.all([page.waitForURL(/\/en\/auth\/login$/), loginLink.click()])
  await expect(page.getByRole('heading', { name: 'Continue your journey' })).toBeVisible()
})
