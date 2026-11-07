import { expect, test } from 'playwright/test'

import { isLocaleLoginUrl } from '../constants/patterns'
import { addTripMember, createPublishedTrip, createVerifiedUser } from '../helpers/api'
import { applySessionCookies, createAuthenticatedSession } from '../helpers/auth'
import { e2eLocalePath } from '../helpers/env'
import { e2eLocales, fillMessage, m } from '../helpers/i18n'
import { requireBackend } from '../helpers/requirements'

for (const locale of e2eLocales) {
  test.describe(`members and visibility (${locale})`, () => {
    test.beforeEach(async () => {
      await requireBackend(true)
    })

    test('owner can add a member who then sees a private trip', async ({ page, context }) => {
      const copy = m(locale)
      const tripName = `Shared Private Trip ${locale}`
      const owner = await createAuthenticatedSession(context, `members-owner-${locale}`)
      const invitee = await createVerifiedUser(`members-invitee-${locale}`)
      const trip = await createPublishedTrip(owner.tokens.access_token, {
        name: tripName,
        destination: 'Dalton',
        visibility: 'private',
      })

      await page.goto(e2eLocalePath(`/trips/${trip.id}`, locale))
      await expect(
        page.getByRole('heading', { name: copy.trips.detail.members.title }),
      ).toBeVisible()
      await page.getByLabel(copy.trips.detail.members.emailLabel).fill(invitee.email)
      await page.getByRole('button', { name: copy.trips.detail.members.add }).click()
      await expect(page.getByText(invitee.email)).toBeVisible()

      await context.clearCookies()
      await applySessionCookies(context, invitee.tokens)
      await page.goto(e2eLocalePath('/trips', locale))
      await expect(page.getByText(tripName)).toBeVisible()
      await page
        .getByRole('link', { name: fillMessage(copy.trips.list.openTrip, { name: tripName }) })
        .click()
      await expect(page.getByRole('heading', { name: tripName })).toBeVisible()
    })

    test('non-member cannot open a private published trip', async ({ page, context }) => {
      const owner = await createVerifiedUser(`private-owner-${locale}`)
      await createAuthenticatedSession(context, `private-stranger-${locale}`)
      const trip = await createPublishedTrip(owner.tokens.access_token, {
        name: `Secret Private Trip ${locale}`,
        visibility: 'private',
      })

      await page.goto(e2eLocalePath(`/trips/${trip.id}`, locale))
      await expect(
        page.getByRole('heading', { name: `Secret Private Trip ${locale}` }),
      ).toHaveCount(0)
    })

    test('anonymous visitor can open a public published trip', async ({ page, browser }) => {
      const owner = await createVerifiedUser(`public-owner-${locale}`)
      const trip = await createPublishedTrip(owner.tokens.access_token, {
        name: `World Readable Trip ${locale}`,
        destination: 'Bali',
        visibility: 'public',
      })

      const anon = await browser.newContext()
      const anonPage = await anon.newPage()
      await anonPage.goto(e2eLocalePath(`/trips/${trip.id}`, locale))
      const cover = await anonPage.request.get(
        `${process.env.E2E_API_BASE_URL ?? 'http://localhost:8000'}/api/v1/trips/${trip.id}`,
      )
      expect(cover.ok()).toBeTruthy()
      const body = (await cover.json()) as { name: string; visibility: string }
      expect(body.name).toBe(`World Readable Trip ${locale}`)
      expect(body.visibility).toBe('public')
      await anon.close()

      await page.goto(e2eLocalePath(`/trips/${trip.id}`, locale))
      await expect(page).toHaveURL(isLocaleLoginUrl(locale))
    })

    test('owner can invite via API helper used by UI flow', async () => {
      const owner = await createVerifiedUser(`api-member-owner-${locale}`)
      const invitee = await createVerifiedUser(`api-member-invitee-${locale}`)
      const trip = await createPublishedTrip(owner.tokens.access_token, {
        name: `API Members Trip ${locale}`,
        visibility: 'private',
      })
      await addTripMember(owner.tokens.access_token, trip.id, invitee.email)
    })
  })
}
