import { expect, test } from 'playwright/test'

import { isLocaleAuthLoginPath, isLocalePostAuthLanding } from '../constants/patterns'
import { createVerifiedUser } from '../helpers/api'
import { loginViaUi } from '../helpers/auth'
import { e2eLocalePath } from '../helpers/env'
import { e2eLocales, m } from '../helpers/i18n'
import { waitForEmailToken } from '../helpers/mailpit'
import { requireBackend } from '../helpers/requirements'

for (const locale of e2eLocales) {
  test.describe(`password recovery (${locale})`, () => {
    test.beforeEach(async () => {
      await requireBackend(true)
    })

    test('requests reset from login dialog and completes reset form', async ({ page }) => {
      const copy = m(locale)
      const user = await createVerifiedUser(`reset-flow-${locale}`)
      const newPassword = 'E2eNewPassword123!'

      await page.goto(e2eLocalePath('/auth/login', locale))
      await page.getByRole('button', { name: copy.auth.login.actions.forgotPassword }).click()
      await expect(
        page.getByRole('heading', { name: copy.auth.recovery.content.title }),
      ).toBeVisible()
      await page.locator('#reset-email').fill(user.email)
      await page.getByRole('button', { name: copy.auth.recovery.actions.submit }).click()
      await expect(page.getByText(copy.auth.recovery.confirmation.description)).toBeVisible()

      const token = await waitForEmailToken({
        to: user.email,
        subjectIncludes: 'Reset your Dreamday password',
      })

      await page.goto(e2eLocalePath(`/auth/reset-password?token=${token}`, locale))
      await expect(
        page.getByRole('heading', { name: copy.auth.resetPassword.content.title }),
      ).toBeVisible()
      await page
        .getByLabel(copy.auth.resetPassword.labels.password, { exact: true })
        .fill(newPassword)
      await page.getByLabel(copy.auth.resetPassword.labels.confirmPassword).fill(newPassword)
      await page
        .getByRole('button', { name: copy.auth.resetPassword.actions.submit, exact: true })
        .click()
      await expect(page).toHaveURL(isLocaleAuthLoginPath(locale))

      await loginViaUi(page, user.email, newPassword, locale)
      await expect(page).toHaveURL(isLocalePostAuthLanding(locale))
    })

    test('reset page without token shows a missing-link state', async ({ page }) => {
      const copy = m(locale)
      await page.goto(e2eLocalePath('/auth/reset-password', locale))
      await expect(
        page.getByRole('heading', { name: copy.auth.resetPassword.content.missingTokenTitle }),
      ).toBeVisible()
      await expect(
        page.getByRole('link', { name: copy.auth.resetPassword.actions.login }),
      ).toBeVisible()
    })
  })
}
