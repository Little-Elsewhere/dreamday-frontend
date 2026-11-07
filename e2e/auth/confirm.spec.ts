import { expect, test } from 'playwright/test'

import { registerUser, uniqueEmail } from '../helpers/api'
import { E2E_DEFAULT_PASSWORD, e2eLocalePath } from '../helpers/env'
import { e2eLocales, m } from '../helpers/i18n'
import { waitForEmailToken } from '../helpers/mailpit'
import { requireBackend } from '../helpers/requirements'

for (const locale of e2eLocales) {
  test.describe(`email confirmation page (${locale})`, () => {
    test.beforeEach(async () => {
      await requireBackend(true)
    })

    test('verifies a valid token from email', async ({ page }) => {
      const copy = m(locale)
      const email = uniqueEmail(`confirm-ok-${locale}`)
      await registerUser(email, E2E_DEFAULT_PASSWORD)
      const token = await waitForEmailToken({ to: email, subjectIncludes: 'Verify' })

      await page.goto(e2eLocalePath(`/auth/confirm?token=${token}`, locale))
      await expect(
        page.getByRole('heading', { name: copy.auth.confirm.content.successTitle }),
      ).toBeVisible()
      await expect(page.getByRole('link', { name: copy.auth.confirm.actions.login })).toBeVisible()
    })

    test('shows an error for an invalid token', async ({ page }) => {
      const copy = m(locale)
      await page.goto(e2eLocalePath('/auth/confirm?token=not-a-real-token', locale))
      await expect(
        page.getByRole('heading', { name: copy.auth.confirm.content.errorTitle }),
      ).toBeVisible()
    })
  })
}
