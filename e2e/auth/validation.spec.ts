import { expect, test } from 'playwright/test'

import { isLocaleAuthLoginPath, isLocaleAuthRegisterPath } from '../constants/patterns'
import { uniqueEmail } from '../helpers/api'
import { E2E_DEFAULT_PASSWORD, e2eLocalePath } from '../helpers/env'
import { e2eLocales, m } from '../helpers/i18n'

for (const locale of e2eLocales) {
  test.describe(`auth form validation (${locale})`, () => {
    test('login requires email and password', async ({ page }) => {
      const copy = m(locale)
      await page.goto(e2eLocalePath('/auth/login', locale))
      await page.getByRole('button', { name: copy.auth.login.actions.submit, exact: true }).click()
      await expect(page.locator('#login-email-error')).toBeVisible()
      await expect(page).toHaveURL(isLocaleAuthLoginPath(locale))
    })

    test('login rejects an invalid email shape', async ({ page }) => {
      const copy = m(locale)
      await page.goto(e2eLocalePath('/auth/login', locale))
      await page.getByRole('textbox', { name: copy.auth.common.labels.email }).fill('bad-email')
      await page.getByLabel(copy.auth.common.labels.password, { exact: true }).fill('not-important')
      await page.getByRole('button', { name: copy.auth.login.actions.submit, exact: true }).click()
      await expect(page.locator('#login-email-error')).toHaveText(
        copy.auth.common.errors.emailInvalid,
      )
    })

    test('register rejects mismatched passwords', async ({ page }) => {
      const copy = m(locale)
      await page.goto(e2eLocalePath('/auth/register', locale))
      await page
        .getByRole('textbox', { name: copy.auth.common.labels.email })
        .fill(uniqueEmail(`mismatch-${locale}`))
      await page
        .getByLabel(copy.auth.common.labels.password, { exact: true })
        .fill(E2E_DEFAULT_PASSWORD)
      await page.getByLabel(copy.auth.register.labels.confirmPassword).fill('DifferentPass12')
      await page
        .getByRole('button', { name: copy.auth.register.actions.submit, exact: true })
        .click()
      await expect(page.getByText(copy.auth.common.errors.passwordMismatch)).toBeVisible()
      await expect(page).toHaveURL(isLocaleAuthRegisterPath(locale))
    })

    test('register rejects a short password', async ({ page }) => {
      const copy = m(locale)
      await page.goto(e2eLocalePath('/auth/register', locale))
      await page
        .getByRole('textbox', { name: copy.auth.common.labels.email })
        .fill(uniqueEmail(`short-pw-${locale}`))
      await page.getByLabel(copy.auth.common.labels.password, { exact: true }).fill('short')
      await page.getByLabel(copy.auth.register.labels.confirmPassword).fill('short')
      await page
        .getByRole('button', { name: copy.auth.register.actions.submit, exact: true })
        .click()
      await expect(
        page.locator('#register-password-error, [id$="password-error"]').first(),
      ).toHaveText(copy.auth.common.errors.passwordTooShort)
    })

    test('forgot-password dialog validates email before submit', async ({ page }) => {
      const copy = m(locale)
      await page.goto(e2eLocalePath('/auth/login', locale))
      await page.getByRole('button', { name: copy.auth.login.actions.forgotPassword }).click()
      await page.locator('#reset-email').fill('not-valid')
      await page.getByRole('button', { name: copy.auth.recovery.actions.submit }).click()
      await expect(page.getByText(copy.auth.common.errors.emailInvalid)).toBeVisible()
    })

    test('reset password form rejects mismatched confirmation', async ({ page }) => {
      const copy = m(locale)
      await page.goto(
        e2eLocalePath('/auth/reset-password?token=dummy-token-for-client-validation', locale),
      )
      await expect(
        page.getByRole('heading', { name: copy.auth.resetPassword.content.title }),
      ).toBeVisible()
      await page
        .getByLabel(copy.auth.resetPassword.labels.password, { exact: true })
        .fill(E2E_DEFAULT_PASSWORD)
      await page.getByLabel(copy.auth.resetPassword.labels.confirmPassword).fill('DifferentPass99')
      await page
        .getByRole('button', { name: copy.auth.resetPassword.actions.submit, exact: true })
        .click()
      await expect(page.getByText(copy.auth.common.errors.passwordMismatch)).toBeVisible()
    })
  })
}
