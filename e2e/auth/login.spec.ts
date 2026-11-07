import { expect, test } from 'playwright/test'

import { isLocaleLoginUrl, isLocalePostAuthLanding } from '../constants/patterns'
import { createVerifiedUser } from '../helpers/api'
import { e2eLocalePath } from '../helpers/env'
import { e2eLocales, m } from '../helpers/i18n'
import { requireBackend } from '../helpers/requirements'

for (const locale of e2eLocales) {
  test.describe(`login (${locale})`, () => {
    test.beforeEach(async () => {
      await requireBackend(true)
    })

    test('signs in a verified user and lands on trips', async ({ page }) => {
      const copy = m(locale)
      const user = await createVerifiedUser(`login-ok-${locale}`)
      await page.goto(e2eLocalePath('/auth/login', locale))
      await page.getByRole('textbox', { name: copy.auth.common.labels.email }).fill(user.email)
      await page.getByLabel(copy.auth.common.labels.password, { exact: true }).fill(user.password)
      await page.getByRole('button', { name: copy.auth.login.actions.submit, exact: true }).click()
      await expect(page).toHaveURL(isLocalePostAuthLanding(locale))
    })

    test('shows an error for wrong password', async ({ page }) => {
      const copy = m(locale)
      const user = await createVerifiedUser(`login-bad-${locale}`)
      await page.goto(e2eLocalePath('/auth/login', locale))
      await page.getByRole('textbox', { name: copy.auth.common.labels.email }).fill(user.email)
      await page
        .getByLabel(copy.auth.common.labels.password, { exact: true })
        .fill('DefinitelyWrongPass1!')
      await page.getByRole('button', { name: copy.auth.login.actions.submit, exact: true }).click()
      await expect(page.getByText(copy.auth.login.errors.signInFailed)).toBeVisible()
      await expect(page).toHaveURL(isLocaleLoginUrl(locale))
    })
  })
}
