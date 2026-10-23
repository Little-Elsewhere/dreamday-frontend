import { expect, test } from 'playwright/test'

test('shows an email error before sign-in on mobile', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'This check covers the mobile login layout.')

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

  const screenshotPath = testInfo.outputPath('invalid-email.png')
  await page.screenshot({ path: screenshotPath, fullPage: true })
  await testInfo.attach('invalid-email', { path: screenshotPath, contentType: 'image/png' })
})
