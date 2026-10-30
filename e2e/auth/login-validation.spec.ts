import { expect, test } from 'playwright/test'

test('shows an email error before sign-in', async ({ page }, testInfo) => {
  const response = await page.goto('/en/auth/login')
  expect(response?.status()).toBe(200)
  await expect(page.getByRole('heading', { name: 'Continue your journey' })).toBeVisible()

  const email = page.getByRole('textbox', { name: 'Email' })
  await email.fill('not-an-email')
  await page.getByLabel('Password', { exact: true }).fill('not-a-real-password')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()

  await expect(page.locator('#login-email-error')).toHaveText('Enter a valid email address.')
  await expect(email).toHaveAttribute('aria-invalid', 'true')
  await expect(page).toHaveURL(/\/en\/auth\/login$/)

  if (testInfo.project.name === 'mobile') {
    const screenshotPath = testInfo.outputPath('invalid-email.png')
    await page.screenshot({ path: screenshotPath, fullPage: true })
    await testInfo.attach('invalid-email', { path: screenshotPath, contentType: 'image/png' })
  }
})

test('shows a required password error before sign-in', async ({ page }) => {
  await page.goto('/en/auth/login')

  await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()

  await expect(page.locator('#login-password-error')).toHaveText('Enter your password.')
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('aria-invalid', 'true')
  await expect(page).toHaveURL(/\/en\/auth\/login$/)
})

test('keeps the user on login when both email and password are empty', async ({ page }) => {
  await page.goto('/en/auth/login')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()

  await expect(page.locator('#login-email-error')).toBeVisible()
  await expect(page.locator('#login-password-error')).toHaveText('Enter your password.')
  await expect(page).toHaveURL(/\/en\/auth\/login$/)
})

test('links to the register page from login', async ({ page }) => {
  await page.goto('/en/auth/login')
  const registerLink = page.getByRole('link', { name: 'Create an account' })
  await expect(registerLink).toHaveAttribute('href', '/en/auth/register')

  await Promise.all([page.waitForURL(/\/en\/auth\/register$/), registerLink.click()])
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
})
