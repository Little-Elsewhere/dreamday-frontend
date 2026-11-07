import { expect, test } from 'playwright/test'

import { createPublishedTrip } from '../helpers/api'
import { createAuthenticatedSession } from '../helpers/auth'
import { e2eLocalePath } from '../helpers/env'
import { e2eLocales, m } from '../helpers/i18n'
import { requireBackend } from '../helpers/requirements'

for (const locale of e2eLocales) {
  test.describe(`trip list search and filters (${locale})`, () => {
    test.beforeEach(async () => {
      await requireBackend(true)
    })

    test('filters trips by search text and status chips', async ({ page, context }) => {
      const copy = m(locale)
      const upcomingName = `Searchable Kyoto ${locale}`
      const pastName = `Searchable Past Trip ${locale}`
      const user = await createAuthenticatedSession(context, `trip-search-${locale}`)
      await createPublishedTrip(user.tokens.access_token, {
        name: upcomingName,
        destination: 'Kyoto',
        start_date: '2027-09-01',
        end_date: '2027-09-05',
      })
      await createPublishedTrip(user.tokens.access_token, {
        name: pastName,
        destination: 'Hue',
        start_date: '2020-01-01',
        end_date: '2020-01-03',
        pace: 'relaxed',
      })

      await page.goto(e2eLocalePath('/trips', locale))
      await expect(page.getByText(upcomingName)).toBeVisible()
      await expect(page.getByText(pastName)).toBeVisible()

      await page.getByLabel(copy.trips.list.searchLabel).fill('Kyoto')
      await expect(page.getByText(upcomingName)).toBeVisible()
      await expect(page.getByText(pastName)).toHaveCount(0)

      await page.getByLabel(copy.trips.list.searchLabel).fill('')
      await page.getByRole('button', { name: copy.trips.list.filters.past }).click()
      await expect(page.getByText(pastName)).toBeVisible()
      await expect(page.getByText(upcomingName)).toHaveCount(0)

      await page.getByRole('button', { name: copy.trips.list.filters.upcoming }).click()
      await expect(page.getByText(upcomingName)).toBeVisible()
      await expect(page.getByText(pastName)).toHaveCount(0)

      await page.getByRole('button', { name: copy.trips.list.filters.all }).click()
      await expect(page.getByText(upcomingName)).toBeVisible()
      await expect(page.getByText(pastName)).toBeVisible()
    })

    test('shows a no-results state for unmatched search', async ({ page, context }) => {
      const copy = m(locale)
      const tripName = `Only One Trip ${locale}`
      const user = await createAuthenticatedSession(context, `trip-no-results-${locale}`)
      await createPublishedTrip(user.tokens.access_token, {
        name: tripName,
        destination: 'Da Lat',
      })

      await page.goto(e2eLocalePath('/trips', locale))
      await page.getByLabel(copy.trips.list.searchLabel).fill('zzzz-not-found')
      await expect(
        page.getByRole('heading', { name: copy.trips.list.noResultsTitle }),
      ).toBeVisible()
      await page.getByRole('button', { name: copy.trips.list.clearFilters }).click()
      await expect(page.getByText(tripName)).toBeVisible()
    })
  })
}
