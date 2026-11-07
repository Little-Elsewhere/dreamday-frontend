import { expect, test } from 'playwright/test'

import { createAuthenticatedSession } from '../helpers/auth'
import { E2E_DEFAULT_PASSWORD, e2eLocalePath } from '../helpers/env'
import { e2eLocales, m } from '../helpers/i18n'
import { requireBackend } from '../helpers/requirements'

for (const locale of e2eLocales) {
  test.describe(`update password validation (${locale})`, () => {
    test.beforeEach(async () => {
      await requireBackend(true)
    })

    test('rejects mismatched confirmation passwords', async ({ page, context }) => {
      const copy = m(locale)
      const user = await createAuthenticatedSession(context, `pwd-mismatch-${locale}`)
      await page.goto(e2eLocalePath('/auth/update-password', locale))
      await page.getByLabel(copy.auth.updatePassword.labels.currentPassword).fill(user.password)
      await page
        .getByLabel(copy.auth.updatePassword.labels.password, { exact: true })
        .fill('BrandNewPass12')
      await page.getByLabel(copy.auth.updatePassword.labels.confirmPassword).fill('DifferentPass12')
      await page
        .getByRole('button', { name: copy.auth.updatePassword.actions.submit, exact: true })
        .click()
      await expect(page.getByText(copy.auth.common.errors.passwordMismatch)).toBeVisible()
    })

    test('rejects an incorrect current password', async ({ page, context }) => {
      const copy = m(locale)
      await createAuthenticatedSession(context, `pwd-wrong-current-${locale}`)
      await page.goto(e2eLocalePath('/auth/update-password', locale))
      await page.getByLabel(copy.auth.updatePassword.labels.currentPassword).fill('WrongCurrent12!')
      await page
        .getByLabel(copy.auth.updatePassword.labels.password, { exact: true })
        .fill('BrandNewPass12')
      await page.getByLabel(copy.auth.updatePassword.labels.confirmPassword).fill('BrandNewPass12')
      await page
        .getByRole('button', { name: copy.auth.updatePassword.actions.submit, exact: true })
        .click()
      await expect(
        page
          .getByText(copy.auth.updatePassword.errors.currentPasswordIncorrect)
          .or(page.getByText(copy.auth.updatePassword.errors.updateFailed)),
      ).toBeVisible()
    })

    test('rejects a short new password', async ({ page, context }) => {
      const copy = m(locale)
      await createAuthenticatedSession(context, `pwd-short-${locale}`)
      await page.goto(e2eLocalePath('/auth/update-password', locale))
      await page
        .getByLabel(copy.auth.updatePassword.labels.currentPassword)
        .fill(E2E_DEFAULT_PASSWORD)
      await page.getByLabel(copy.auth.updatePassword.labels.password, { exact: true }).fill('short')
      await page.getByLabel(copy.auth.updatePassword.labels.confirmPassword).fill('short')
      await page
        .getByRole('button', { name: copy.auth.updatePassword.actions.submit, exact: true })
        .click()
      await expect(page.locator('[id$="password-error"]').first()).toHaveText(
        copy.auth.common.errors.passwordTooShort,
      )
    })
  })
}
