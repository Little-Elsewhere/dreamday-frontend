import type { Page } from 'playwright/test'

import { confirmEmailFromMailpit } from './mailpit'

export const registerThroughUi = async (
  page: Page,
  appBaseUrl: string,
  email: string,
  password: string,
): Promise<number> => {
  await page.goto(new URL('/en/auth/register', appBaseUrl).href)
  await page.locator('#register-name').fill('Playwright Worker')
  await page.locator('#register-email').fill(email)
  await page.locator('#register-password').fill(password)
  await page.locator('#confirm-password').fill(password)

  const submittedAt = Date.now()
  await page.locator('form button[type="submit"]').click()
  await page.waitForURL((url) => url.pathname === '/en/auth/register/success')
  return submittedAt
}

export const completeSignupConfirmation = async (
  page: Page,
  appBaseUrl: string,
  email: string,
  submittedAt: number,
): Promise<void> => confirmEmailFromMailpit(page, email, submittedAt, appBaseUrl)

export const signInThroughUi = async (
  page: Page,
  appBaseUrl: string,
  email: string,
  password: string,
): Promise<void> => {
  await page.goto(new URL('/en/auth/login', appBaseUrl).href)
  await page.locator('#login-email').fill(email)
  await page.locator('#login-password').fill(password)
  await page.locator('form button[type="submit"]').click()
  await page.waitForURL((url) => url.pathname === '/en/trips')
}
