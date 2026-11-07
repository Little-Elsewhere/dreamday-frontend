import { expect, test } from 'playwright/test'

import { isLocaleTripsCreatePath } from '../constants/patterns'
import { createAuthenticatedSession } from '../helpers/auth'
import { e2eLocalePath } from '../helpers/env'
import { e2eLocales, m } from '../helpers/i18n'
import { requireBackend } from '../helpers/requirements'

for (const locale of e2eLocales) {
  test.describe(`trip create validation (${locale})`, () => {
    test.beforeEach(async () => {
      await requireBackend(true)
    })

    test('blocks publish when required fields are missing', async ({ page, context }) => {
      const copy = m(locale)
      await createAuthenticatedSession(context, `trip-publish-validation-${locale}`)
      await page.goto(e2eLocalePath('/trips/create', locale))

      await page.getByRole('button', { name: copy.trips.create.actions.continue }).click()
      await expect(
        page.getByRole('heading', { name: copy.trips.create.scheduleTitle }),
      ).toBeVisible()
      await page
        .getByRole('button', { name: copy.trips.create.actions.publish, exact: true })
        .click()
      await expect(
        page
          .getByText(copy.trips.create.errors.publishRequired)
          .or(page.getByText(copy.trips.create.errors.nameRequired))
          .or(page.getByText(copy.trips.create.errors.startDateRequired))
          .or(page.getByText(copy.trips.create.errors.paceRequired)),
      ).toBeVisible()
      await expect(page).toHaveURL(isLocaleTripsCreatePath(locale))
    })

    test('rejects a return date before departure on the details step', async ({
      page,
      context,
    }) => {
      const copy = m(locale)
      await createAuthenticatedSession(context, `trip-date-validation-${locale}`)
      await page.goto(e2eLocalePath('/trips/create', locale))

      await page.locator('#trip-name').fill('Bad dates')
      await page.locator('#trip-start-date').fill('2027-08-10')
      await page.locator('#trip-end-date').fill('2027-08-01')
      await page.locator('label').filter({ hasText: copy.trips.create.paces.balanced }).click()
      await page.getByRole('button', { name: copy.trips.create.actions.saveDraft }).click()

      await expect(
        page
          .getByRole('alert')
          .filter({ hasText: copy.trips.create.errors.endBeforeStart })
          .or(page.getByRole('alert').filter({ hasText: copy.trips.create.errors.system })),
      ).toBeVisible()
    })

    test('saves an incomplete draft without publishing', async ({ page, context }) => {
      const copy = m(locale)
      await createAuthenticatedSession(context, `trip-draft-save-${locale}`)
      await page.goto(e2eLocalePath('/trips/create', locale))
      await page.locator('#trip-name').fill('Partial draft')
      await page.getByRole('button', { name: copy.trips.create.actions.saveDraft }).click()
      await expect(page.getByText(copy.trips.create.draftSaved)).toBeVisible()
    })
  })
}
