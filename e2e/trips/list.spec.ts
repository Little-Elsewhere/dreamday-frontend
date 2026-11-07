import { expect, test } from 'playwright/test'

import { isLocaleTripDetailPath } from '../constants/patterns'
import { createPublishedTrip } from '../helpers/api'
import { createAuthenticatedSession } from '../helpers/auth'
import { e2eLocalePath } from '../helpers/env'
import { e2eLocales, fillMessage, m } from '../helpers/i18n'
import { requireBackend } from '../helpers/requirements'

for (const locale of e2eLocales) {
  test.describe(`trips list (${locale})`, () => {
    test.beforeEach(async () => {
      await requireBackend(true)
    })

    test('shows empty state for a new account', async ({ page, context }) => {
      const copy = m(locale)
      await createAuthenticatedSession(context, `trips-empty-${locale}`)
      await page.goto(e2eLocalePath('/trips', locale))
      await expect(page.getByRole('heading', { name: copy.trips.list.title })).toBeVisible()
      await expect(page.getByRole('heading', { name: copy.trips.list.emptyTitle })).toBeVisible()
      await expect(page.getByRole('link', { name: copy.trips.list.createFirst })).toBeVisible()
    })

    test('lists a published trip and opens detail', async ({ page, context }) => {
      const copy = m(locale)
      const tripName = `Listable Kyoto ${locale}`
      const user = await createAuthenticatedSession(context, `trips-list-${locale}`)
      const trip = await createPublishedTrip(user.tokens.access_token, {
        name: tripName,
        destination: 'Kyoto',
      })

      await page.goto(e2eLocalePath('/trips', locale))
      await expect(page.getByText(tripName)).toBeVisible()
      await page
        .getByRole('link', {
          name: fillMessage(copy.trips.list.openTrip, { name: tripName }),
        })
        .click()
      await expect(page).toHaveURL(isLocaleTripDetailPath(locale, trip.id))
      await expect(page.getByRole('heading', { name: tripName })).toBeVisible()
    })
  })
}
