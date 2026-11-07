import type { BrowserContext, Page } from 'playwright/test'

import { Locale } from '../../src/constants/locale'
import { AUTH_COOKIE } from '../../src/features/auth/constants/session'
import { isLocalePostAuthLanding } from '../constants/patterns'
import { createVerifiedUser, loginApi, type TokenPair } from './api'
import { E2E_BASE_URL, E2E_DEFAULT_PASSWORD, e2eLocalePath } from './env'
import { type E2eLocale, m } from './i18n'

export const applySessionCookies = async (context: BrowserContext, tokens: TokenPair) => {
  const url = E2E_BASE_URL
  await context.addCookies([
    {
      name: AUTH_COOKIE.ACCESS_TOKEN,
      value: tokens.access_token,
      url,
      httpOnly: true,
      sameSite: 'Lax',
    },
    {
      name: AUTH_COOKIE.REFRESH_TOKEN,
      value: tokens.refresh_token,
      url,
      httpOnly: true,
      sameSite: 'Lax',
    },
  ])
}

export const loginViaUi = async (
  page: Page,
  email: string,
  password = E2E_DEFAULT_PASSWORD,
  locale: E2eLocale = Locale.EN,
) => {
  const copy = m(locale)
  await page.goto(e2eLocalePath('/auth/login', locale))
  await page.getByRole('textbox', { name: copy.auth.common.labels.email }).fill(email)
  await page.getByLabel(copy.auth.common.labels.password, { exact: true }).fill(password)
  await page.getByRole('button', { name: copy.auth.login.actions.submit, exact: true }).click()
  await page.waitForURL(isLocalePostAuthLanding(locale))
}

export const createAuthenticatedSession = async (
  context: BrowserContext,
  label: string,
): Promise<{ email: string; password: string; tokens: TokenPair }> => {
  const user = await createVerifiedUser(label)
  await applySessionCookies(context, user.tokens)
  return user
}

export const refreshSessionCookies = async (
  context: BrowserContext,
  email: string,
  password = E2E_DEFAULT_PASSWORD,
) => {
  const tokens = await loginApi(email, password)
  await applySessionCookies(context, tokens)
  return tokens
}
