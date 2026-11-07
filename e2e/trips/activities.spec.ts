import { expect, test } from 'playwright/test'

import { createActivityApi, createPublishedTrip } from '../helpers/api'
import { createAuthenticatedSession } from '../helpers/auth'
import { e2eLocalePath } from '../helpers/env'
import { e2eLocales, m } from '../helpers/i18n'
import { requireBackend } from '../helpers/requirements'

for (const locale of e2eLocales) {
  test.describe(`trip activities (${locale})`, () => {
    test.beforeEach(async () => {
      await requireBackend(true)
    })

    test('shows activities created via API on the detail page', async ({ page, context }) => {
      const copy = m(locale)
      const user = await createAuthenticatedSession(context, `activity-detail-${locale}`)
      const trip = await createPublishedTrip(user.tokens.access_token, {
        name: `Activity Detail Trip ${locale}`,
        start_date: '2027-04-01',
        end_date: '2027-04-05',
      })
      await createActivityApi(user.tokens.access_token, trip.id, {
        title: 'Senso-ji',
        activity_date: '2027-04-02',
      })

      await page.goto(e2eLocalePath(`/trips/${trip.id}`, locale))
      await expect(
        page.getByRole('heading', { name: copy.trips.detail.scheduleTitle }),
      ).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Senso-ji' })).toBeVisible()
      await expect(page.getByText(copy.trips.detail.activityTypes.explore)).toBeVisible()
    })

    test('adds an activity from the create/edit itinerary step', async ({ page, context }) => {
      const copy = m(locale)
      const user = await createAuthenticatedSession(context, `activity-ui-${locale}`)
      const trip = await createPublishedTrip(user.tokens.access_token, {
        name: `Editable Activities ${locale}`,
        start_date: '2027-07-01',
        end_date: '2027-07-03',
      })

      await page.goto(e2eLocalePath(`/trips/${trip.id}/edit`, locale))
      await page.getByRole('button', { name: copy.trips.create.actions.continue }).click()
      await expect(
        page.getByRole('heading', { name: copy.trips.create.scheduleTitle }),
      ).toBeVisible()

      const addButton = page
        .getByRole('button', { name: copy.trips.create.actions.addForDay })
        .or(page.getByRole('button', { name: copy.trips.create.actions.addActivity }))
        .first()
      await addButton.click()

      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()
      await dialog.locator('#activity-title').fill('Night market')
      await dialog.getByRole('button', { name: copy.trips.create.actions.saveActivity }).click()
      await expect(page.getByText('Night market')).toBeVisible()
    })
  })
}
