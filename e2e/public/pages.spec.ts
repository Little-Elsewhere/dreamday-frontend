import { expect, test } from 'playwright/test'

import { isLocaleLoginUrl } from '../constants/patterns'
import { e2eLocalePath } from '../helpers/env'
import { e2eLocales, m } from '../helpers/i18n'

for (const locale of e2eLocales) {
  test.describe(`public pages (${locale})`, () => {
    test('home redirects into the auth login flow', async ({ page }) => {
      await page.goto(e2eLocalePath('/', locale))
      await expect(page).toHaveURL(isLocaleLoginUrl(locale))
    })

    test('maintenance page renders', async ({ page }) => {
      const copy = m(locale)
      await page.goto(e2eLocalePath('/maintenance', locale))
      await expect(
        page.getByRole('heading', { name: copy.maintenance.content.title }),
      ).toBeVisible()
      await expect(page.locator('main')).toBeVisible()
    })

    test('auth error page renders for a failed link', async ({ page }) => {
      const copy = m(locale)
      await page.goto(e2eLocalePath('/auth/error', locale))
      await expect(page.getByRole('heading', { name: copy.auth.error.content.title })).toBeVisible()
      await expect(page.getByRole('link', { name: copy.auth.error.actions.login })).toBeVisible()
    })

    test('offline fallback page is reachable', async ({ page }) => {
      const copy = m(locale)
      await page.goto(e2eLocalePath('/~offline', locale))
      await expect(page.getByRole('heading', { name: copy.offline.title })).toBeVisible()
    })

    test('recovery success page renders', async ({ page }) => {
      await page.goto(e2eLocalePath('/auth/recovery/success', locale))
      await expect(page.getByRole('heading')).toBeVisible()
    })
  })
}
