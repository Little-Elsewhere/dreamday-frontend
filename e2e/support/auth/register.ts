import type { Page } from 'playwright/test'

import type { Locale } from '../../../src/constants/locale'

export const registerUser = async (
  page: Page,
  email: string,
  password: string,
  locale: Locale,
): Promise<void> => {
  await page.goto(`/${locale}/auth/register`)
  await page.locator('#register-name').fill('Playwright E2E')
  await page.locator('#register-email').fill(email)
  await page.locator('#register-password').fill(password)
  await page.locator('#confirm-password').fill(password)

  await page.locator('form button[type="submit"]').click()
  await page.waitForURL((url) => url.pathname === `/${locale}/auth/register/success`)
}
