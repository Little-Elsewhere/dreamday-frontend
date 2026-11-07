import { expect, test } from 'playwright/test'

import {
  isLocaleAuthRegisterPath,
  isLocaleAuthRegisterSuccessPath,
  isLocalePostAuthLanding,
} from '../constants/patterns'
import { uniqueEmail, verifyEmailWithToken } from '../helpers/api'
import { loginViaUi } from '../helpers/auth'
import { E2E_DEFAULT_PASSWORD, e2eLocalePath } from '../helpers/env'
import { e2eLocales, m } from '../helpers/i18n'
import { waitForEmailToken } from '../helpers/mailpit'
import { requireBackend } from '../helpers/requirements'

for (const locale of e2eLocales) {
  test.describe(`registration (${locale})`, () => {
    test.beforeEach(async () => {
      await requireBackend(true)
    })

    test('registers, confirms email from Mailpit, then signs in', async ({ page }) => {
      const copy = m(locale)
      const email = uniqueEmail(`register-ui-${locale}`)
      await page.goto(e2eLocalePath('/auth/register', locale))
      await expect(
        page.getByRole('heading', { name: copy.auth.register.content.title }),
      ).toBeVisible()

      await page.getByRole('textbox', { name: copy.auth.common.labels.email }).fill(email)
      await page
        .getByLabel(copy.auth.common.labels.password, { exact: true })
        .fill(E2E_DEFAULT_PASSWORD)
      await page.getByLabel(copy.auth.register.labels.confirmPassword).fill(E2E_DEFAULT_PASSWORD)
      await page
        .getByRole('button', { name: copy.auth.register.actions.submit, exact: true })
        .click()

      await expect(page).toHaveURL(isLocaleAuthRegisterSuccessPath(locale))
      await expect(
        page.getByRole('heading', { name: copy.auth.common.confirmation.title }),
      ).toBeVisible()
      await expect(page.getByText(copy.auth.register.confirmation.description)).toBeVisible()

      const token = await waitForEmailToken({ to: email, subjectIncludes: 'Verify' })
      await verifyEmailWithToken(token)

      await loginViaUi(page, email, E2E_DEFAULT_PASSWORD, locale)
      await expect(page).toHaveURL(isLocalePostAuthLanding(locale))
    })

    test('shows client validation for short passwords', async ({ page }) => {
      const copy = m(locale)
      await page.goto(e2eLocalePath('/auth/register', locale))
      await page
        .getByRole('textbox', { name: copy.auth.common.labels.email })
        .fill(uniqueEmail(`register-short-${locale}`))
      await page.getByLabel(copy.auth.common.labels.password, { exact: true }).fill('short')
      await page.getByLabel(copy.auth.register.labels.confirmPassword).fill('short')
      await page
        .getByRole('button', { name: copy.auth.register.actions.submit, exact: true })
        .click()
      await expect(page.locator('[id$="-error"]').first()).toBeVisible()
      await expect(page).toHaveURL(isLocaleAuthRegisterPath(locale))
    })
  })
}
