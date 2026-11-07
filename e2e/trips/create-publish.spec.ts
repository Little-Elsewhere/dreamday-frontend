import { expect, test } from 'playwright/test'

import { isLocalePublishedTripPath } from '../constants/patterns'
import { createAuthenticatedSession } from '../helpers/auth'
import { e2eLocalePath } from '../helpers/env'
import { e2eLocales, m } from '../helpers/i18n'
import { requireBackend } from '../helpers/requirements'

for (const locale of e2eLocales) {
  test.describe(`create and publish trip (${locale})`, () => {
    test.beforeEach(async () => {
      await requireBackend(true)
    })

    test('creates a draft from the UI and publishes it', async ({ page, context }) => {
      const copy = m(locale)
      const tripName = `UI Osaka Escape ${locale}`
      await createAuthenticatedSession(context, `trip-create-${locale}`)
      await page.goto(e2eLocalePath('/trips/create', locale))
      await expect(page.getByRole('heading', { name: copy.trips.create.title })).toBeVisible()

      await page.locator('#trip-name').fill(tripName)
      await page.locator('#trip-destination').fill('Osaka')
      await page.locator('#trip-description').fill('Street food and neon nights')
      await page.locator('#trip-start-date').fill('2027-05-10')
      await page.locator('#trip-end-date').fill('2027-05-14')
      await page.locator('label').filter({ hasText: copy.trips.create.paces.balanced }).click()
      await page
        .locator('label')
        .filter({ has: page.getByText(copy.trips.create.visibility.private, { exact: true }) })
        .click()

      await page.getByRole('button', { name: copy.trips.create.actions.continue }).click()
      await expect(
        page.getByRole('heading', { name: copy.trips.create.scheduleTitle }),
      ).toBeVisible()

      await page
        .getByRole('button', { name: copy.trips.create.actions.publish, exact: true })
        .click()
      await expect(page).toHaveURL(isLocalePublishedTripPath(locale))
      await expect(page.getByRole('heading', { name: tripName })).toBeVisible()
      await expect(page.getByText('Osaka').first()).toBeVisible()
    })
  })
}
