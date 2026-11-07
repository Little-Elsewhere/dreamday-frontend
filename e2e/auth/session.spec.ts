import { expect, test } from 'playwright/test'

import { isLocaleLoginUrl, isLocaleTripsIndex } from '../constants/patterns'
import { createAuthenticatedSession } from '../helpers/auth'
import { e2eLocalePath } from '../helpers/env'
import { e2eLocales, m } from '../helpers/i18n'
import { requireBackend } from '../helpers/requirements'

for (const locale of e2eLocales) {
  test.describe(`authenticated session (${locale})`, () => {
    test.beforeEach(async () => {
      await requireBackend(true)
    })

    test('keeps access to private trips after reload', async ({ page, context }) => {
      const copy = m(locale)
      await createAuthenticatedSession(context, `session-reload-${locale}`)
      await page.goto(e2eLocalePath('/trips', locale))
      await expect(page.getByRole('heading', { name: copy.trips.list.title })).toBeVisible()
      await page.reload()
      await expect(page.getByRole('heading', { name: copy.trips.list.title })).toBeVisible()
      await expect(page).toHaveURL(isLocaleTripsIndex(locale))
    })

    test('redirects anonymous users from private trips to login', async ({ page }) => {
      await page.goto(e2eLocalePath('/trips', locale))
      await expect(page).toHaveURL(isLocaleLoginUrl(locale))
    })
  })
}
