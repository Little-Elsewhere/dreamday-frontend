import { expect, test } from 'playwright/test'

import { createPublishedTrip, createVerifiedUser, uniqueEmail } from '../helpers/api'
import { createAuthenticatedSession } from '../helpers/auth'
import { e2eLocalePath } from '../helpers/env'
import { e2eLocales, m } from '../helpers/i18n'
import { requireBackend } from '../helpers/requirements'

for (const locale of e2eLocales) {
  test.describe(`trip members abnormal cases (${locale})`, () => {
    test.beforeEach(async () => {
      await requireBackend(true)
    })

    test('shows an error when adding an unknown member email', async ({ page, context }) => {
      const copy = m(locale)
      const user = await createAuthenticatedSession(context, `member-unknown-${locale}`)
      const trip = await createPublishedTrip(user.tokens.access_token, {
        name: `Members Unknown ${locale}`,
      })

      await page.goto(e2eLocalePath(`/trips/${trip.id}`, locale))
      await page
        .getByLabel(copy.trips.detail.members.emailLabel)
        .fill(uniqueEmail(`no-such-user-${locale}`))
      await page.getByRole('button', { name: copy.trips.detail.members.add }).click()
      await expect(page.getByText(copy.trips.detail.members.addFailed)).toBeVisible()
    })

    test('owner can remove a member from the panel', async ({ page, context }) => {
      const copy = m(locale)
      const owner = await createAuthenticatedSession(context, `member-remove-owner-${locale}`)
      const invitee = await createVerifiedUser(`member-remove-invitee-${locale}`)
      const trip = await createPublishedTrip(owner.tokens.access_token, {
        name: `Members Removable ${locale}`,
      })

      await page.goto(e2eLocalePath(`/trips/${trip.id}`, locale))
      await page.getByLabel(copy.trips.detail.members.emailLabel).fill(invitee.email)
      await page.getByRole('button', { name: copy.trips.detail.members.add }).click()
      await expect(page.getByText(invitee.email)).toBeVisible()

      const row = page.locator('li, div').filter({ hasText: invitee.email }).first()
      await row.getByRole('button', { name: copy.trips.detail.members.remove, exact: true }).click()
      await expect(page.getByText(invitee.email)).toHaveCount(0)
    })

    test('member can view a private trip after being invited', async ({ page, context }) => {
      const copy = m(locale)
      const tripName = `Readonly Member Trip ${locale}`
      const owner = await createVerifiedUser(`member-readonly-owner-${locale}`)
      const member = await createAuthenticatedSession(context, `member-readonly-${locale}`)
      const trip = await createPublishedTrip(owner.tokens.access_token, {
        name: tripName,
        visibility: 'private',
      })

      const add = await page.request.post(
        `${process.env.E2E_API_BASE_URL ?? 'http://localhost:8000'}/api/v1/trips/${trip.id}/members`,
        {
          headers: {
            Authorization: `Bearer ${owner.tokens.access_token}`,
            'Content-Type': 'application/json',
          },
          data: { email: member.email },
        },
      )
      expect(add.ok()).toBeTruthy()

      await page.goto(e2eLocalePath(`/trips/${trip.id}`, locale))
      await expect(page.getByRole('heading', { name: tripName })).toBeVisible()
      await expect(
        page.getByRole('heading', { name: copy.trips.detail.members.title }),
      ).toBeVisible()
    })
  })
}
