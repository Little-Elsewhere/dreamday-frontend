import { expect, test } from 'playwright/test'

import { isLocaleAuthRegisterSuccessPath, isLocaleLoginUrl } from '../constants/patterns'
import { createVerifiedUser, registerUser, uniqueEmail } from '../helpers/api'
import { E2E_DEFAULT_PASSWORD, e2eLocalePath } from '../helpers/env'
import { e2eLocales, m } from '../helpers/i18n'
import { requireBackend } from '../helpers/requirements'

for (const locale of e2eLocales) {
  test.describe(`auth abnormal flows (${locale})`, () => {
    test.beforeEach(async () => {
      await requireBackend(true)
    })

    test('blocks sign-in for an unverified account', async ({ page }) => {
      const copy = m(locale)
      const email = uniqueEmail(`unverified-login-${locale}`)
      await registerUser(email, E2E_DEFAULT_PASSWORD)

      await page.goto(e2eLocalePath('/auth/login', locale))
      await page.getByRole('textbox', { name: copy.auth.common.labels.email }).fill(email)
      await page
        .getByLabel(copy.auth.common.labels.password, { exact: true })
        .fill(E2E_DEFAULT_PASSWORD)
      await page.getByRole('button', { name: copy.auth.login.actions.submit, exact: true }).click()
      await expect(page).toHaveURL(isLocaleAuthRegisterSuccessPath(locale))
      await expect(
        page.getByRole('heading', { name: copy.auth.common.confirmation.title }),
      ).toBeVisible()
    })

    test('registering an existing email stays on a safe success path or shows an error', async ({
      page,
    }) => {
      const copy = m(locale)
      const existing = await createVerifiedUser(`dup-register-${locale}`)
      await page.goto(e2eLocalePath('/auth/register', locale))
      await page.getByRole('textbox', { name: copy.auth.common.labels.email }).fill(existing.email)
      await page
        .getByLabel(copy.auth.common.labels.password, { exact: true })
        .fill(E2E_DEFAULT_PASSWORD)
      await page.getByLabel(copy.auth.register.labels.confirmPassword).fill(E2E_DEFAULT_PASSWORD)
      await page
        .getByRole('button', { name: copy.auth.register.actions.submit, exact: true })
        .click()

      const success = page.getByRole('heading', { name: copy.auth.common.confirmation.title })
      const already = page.getByText(copy.auth.register.errors.emailAlreadyRegistered)
      await expect(success.or(already)).toBeVisible()
    })

    test('unknown email still gets a generic forgot-password confirmation', async ({ page }) => {
      const copy = m(locale)
      await page.goto(e2eLocalePath('/auth/login', locale))
      await page.getByRole('button', { name: copy.auth.login.actions.forgotPassword }).click()
      await page.locator('#reset-email').fill(uniqueEmail(`unknown-reset-${locale}`))
      await page.getByRole('button', { name: copy.auth.recovery.actions.submit }).click()
      await expect(page.getByText(copy.auth.recovery.confirmation.description)).toBeVisible()
    })

    test('private account route redirects anonymous users to login', async ({ page }) => {
      await page.goto(e2eLocalePath('/account', locale))
      await expect(page).toHaveURL(isLocaleLoginUrl(locale))
    })

    test('private update-password route redirects anonymous users to login', async ({ page }) => {
      await page.goto(e2eLocalePath('/auth/update-password', locale))
      await expect(page).toHaveURL(isLocaleLoginUrl(locale))
    })
  })
}
