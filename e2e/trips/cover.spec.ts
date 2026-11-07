import { expect, test } from 'playwright/test'

import { IMAGE_CONTENT_TYPE } from '../constants/patterns'
import { createPublishedTrip } from '../helpers/api'
import { createAuthenticatedSession } from '../helpers/auth'
import { E2E_API_BASE_URL, e2eLocalePath } from '../helpers/env'
import { e2eLocales, m } from '../helpers/i18n'
import { requireBackend } from '../helpers/requirements'

const tinyJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xd9, ...Buffer.alloc(64, 1)])

for (const locale of e2eLocales) {
  test.describe(`trip cover (${locale})`, () => {
    test.beforeEach(async () => {
      await requireBackend(true)
    })

    test('serves an uploaded cover through the same-origin proxy', async ({ page, context }) => {
      const user = await createAuthenticatedSession(context, `cover-proxy-${locale}`)
      const trip = await createPublishedTrip(user.tokens.access_token, {
        name: `Cover Proxy Trip ${locale}`,
      })

      const form = new FormData()
      form.append('file', new Blob([tinyJpeg], { type: 'image/jpeg' }), 'cover.jpg')
      const uploaded = await fetch(`${E2E_API_BASE_URL}/api/v1/trips/${trip.id}/cover`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.tokens.access_token}` },
        body: form,
      })
      expect(uploaded.ok).toBeTruthy()

      const proxy = await page.request.get(`/api/trips/${trip.id}/cover`)
      expect(proxy.ok()).toBeTruthy()
      expect(proxy.headers()['content-type'] ?? '').toMatch(IMAGE_CONTENT_TYPE)

      await page.goto(e2eLocalePath(`/trips/${trip.id}`, locale))
      await expect(page.locator(`img[src*="/api/trips/${trip.id}/cover"]`)).toBeVisible()
    })

    test('rejects an unsupported cover file type in the UI', async ({ page, context }) => {
      const copy = m(locale)
      const user = await createAuthenticatedSession(context, `cover-bad-type-${locale}`)
      const trip = await createPublishedTrip(user.tokens.access_token, {
        name: `Cover Bad Type ${locale}`,
      })

      await page.goto(e2eLocalePath(`/trips/${trip.id}/edit`, locale))
      await page.locator('input[type="file"]').setInputFiles({
        name: 'cover.gif',
        mimeType: 'image/gif',
        buffer: Buffer.from('GIF89a'),
      })
      await expect(
        page.getByRole('alert').filter({ hasText: copy.trips.create.errors.invalidCover }),
      ).toBeVisible()
    })
  })
}
