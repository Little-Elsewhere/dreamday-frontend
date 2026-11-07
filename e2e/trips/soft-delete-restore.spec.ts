import { expect, test } from 'playwright/test'

import { isLocaleTripDetailPath, isLocaleTripsPath } from '../constants/patterns'
import { createPublishedTrip } from '../helpers/api'
import { createAuthenticatedSession } from '../helpers/auth'
import { e2eLocalePath } from '../helpers/env'
import { e2eLocales, fillMessage, m } from '../helpers/i18n'
import { requireBackend } from '../helpers/requirements'

for (const locale of e2eLocales) {
  test.describe(`soft delete and restore (${locale})`, () => {
    test.beforeEach(async () => {
      await requireBackend(true)
    })

    test('moves a trip to trash and restores it', async ({ page, context }) => {
      const copy = m(locale)
      const tripName = `Trashable Da Nang ${locale}`
      const user = await createAuthenticatedSession(context, `trip-trash-${locale}`)
      const trip = await createPublishedTrip(user.tokens.access_token, {
        name: tripName,
        destination: 'Da Nang',
      })

      await page.goto(e2eLocalePath(`/trips/${trip.id}`, locale))
      page.once('dialog', (dialog) => dialog.accept())
      await page.getByRole('button', { name: copy.trips.detail.actions.delete }).click()
      await expect(page).toHaveURL(isLocaleTripsPath(locale))

      const trash = page.locator('section').filter({ hasText: copy.trips.list.trash.title })
      await expect(page.getByRole('heading', { name: copy.trips.list.trash.title })).toBeVisible()
      await expect(trash.getByText(tripName)).toBeVisible()
      await trash.getByRole('button', { name: copy.trips.list.trash.restore }).click()
      const openLabel = fillMessage(copy.trips.list.openTrip, { name: tripName })
      await expect(page.getByRole('link', { name: openLabel })).toBeVisible()
      await page.getByRole('link', { name: openLabel }).click()
      await expect(page).toHaveURL(isLocaleTripDetailPath(locale, trip.id))
    })
  })
}
