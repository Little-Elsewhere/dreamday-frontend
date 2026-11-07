import type { E2eLocale } from './i18n'

/** Host-reachable services used by Playwright (not Docker service names). */
export const E2E_BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:4000'
export const E2E_API_BASE_URL = process.env.E2E_API_BASE_URL ?? 'http://localhost:8000'
export const E2E_MAILPIT_URL = process.env.E2E_MAILPIT_URL ?? 'http://localhost:8025'

export const E2E_DEFAULT_PASSWORD = 'E2ePassword123!'

export const e2eLocalePath = (path: string, locale: E2eLocale | string = 'en') => {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `/${locale}${normalized}`
}
