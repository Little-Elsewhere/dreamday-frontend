import { expect, test } from 'playwright/test'

import { isLocaleTripEditPath } from '../constants/patterns'
import { createPublishedTrip } from '../helpers/api'
import { createAuthenticatedSession } from '../helpers/auth'
import { e2eLocalePath } from '../helpers/env'
import { e2eLocales, m } from '../helpers/i18n'
import { requireBackend } from '../helpers/requirements'

for (const locale of e2eLocales) {
  test.describe(`trip detail and edit (${locale})`, () => {
    test.beforeEach(async () => {
      await requireBackend(true)
    })

    test('opens edit from detail and updates the trip name', async ({ page, context }) => {
      const copy = m(locale)
      const originalName = `Editable Hanoi ${locale}`
      const updatedName = `Editable Hanoi Updated ${locale}`
      const user = await createAuthenticatedSession(context, `trip-edit-${locale}`)
      const trip = await createPublishedTrip(user.tokens.access_token, {
        name: originalName,
        destination: 'Hanoi',
      })

      await page.goto(e2eLocalePath(`/trips/${trip.id}`, locale))
      await expect(page.getByRole('heading', { name: originalName })).toBeVisible()
      await page.getByRole('link', { name: copy.trips.detail.actions.edit }).click()
      await expect(page).toHaveURL(isLocaleTripEditPath(locale, trip.id))

      const nameField = page.getByLabel(copy.trips.create.fields.name)
      await nameField.fill(updatedName)
      await page.getByRole('button', { name: copy.trips.create.actions.saveDraft }).click()
      await expect(page.getByText(copy.trips.create.draftSaved)).toBeVisible()

      await page.goto(e2eLocalePath(`/trips/${trip.id}`, locale))
      await expect(page.getByRole('heading', { name: updatedName })).toBeVisible()
    })

    test('shows visibility on the detail facts panel', async ({ page, context }) => {
      const copy = m(locale)
      const user = await createAuthenticatedSession(context, `trip-visibility-ui-${locale}`)
      const trip = await createPublishedTrip(user.tokens.access_token, {
        name: `Public Saigon ${locale}`,
        destination: 'Ho Chi Minh City',
        visibility: 'public',
      })

      await page.goto(e2eLocalePath(`/trips/${trip.id}`, locale))
      await expect(
        page.getByText(copy.trips.detail.visibility.public, { exact: true }),
      ).toBeVisible()
    })
  })
}
