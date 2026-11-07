import { expect, test } from 'playwright/test'

import { isLocaleLoginUrl } from '../constants/patterns'
import { createAuthenticatedSession } from '../helpers/auth'
import { e2eLocalePath } from '../helpers/env'
import { e2eLocales, m } from '../helpers/i18n'
import { requireBackend } from '../helpers/requirements'

for (const locale of e2eLocales) {
  test.describe(`account (${locale})`, () => {
    test.beforeEach(async () => {
      await requireBackend(true)
    })

    test('shows signed-in account details and links', async ({ page, context }) => {
      const copy = m(locale)
      const user = await createAuthenticatedSession(context, `account-home-${locale}`)
      await page.goto(e2eLocalePath('/account', locale))
      await expect(page.getByRole('heading', { name: copy.account.content.title })).toBeVisible()
      await expect(page.getByText(user.email)).toBeVisible()
      await expect(page.getByRole('link', { name: copy.account.actions.viewTrips })).toBeVisible()
      await expect(
        page.getByRole('link', { name: copy.account.actions.updatePassword }),
      ).toBeVisible()
      await expect(page.getByRole('button', { name: copy.account.actions.signOut })).toBeVisible()
    })

    test('signs out and returns to login', async ({ page, context }) => {
      const copy = m(locale)
      await createAuthenticatedSession(context, `account-logout-${locale}`)
      await page.goto(e2eLocalePath('/account', locale))
      await page.getByRole('button', { name: copy.account.actions.signOut }).click()
      await expect(page).toHaveURL(isLocaleLoginUrl(locale))
    })

    test('updates password from the account flow', async ({ page, context }) => {
      const copy = m(locale)
      const user = await createAuthenticatedSession(context, `account-password-${locale}`)
      const nextPassword = 'E2eUpdatedPass123!'

      await page.goto(e2eLocalePath('/auth/update-password', locale))
      await expect(
        page.getByRole('heading', { name: copy.auth.updatePassword.content.title }),
      ).toBeVisible()
      await page.getByLabel(copy.auth.updatePassword.labels.currentPassword).fill(user.password)
      await page
        .getByLabel(copy.auth.updatePassword.labels.password, { exact: true })
        .fill(nextPassword)
      await page.getByLabel(copy.auth.updatePassword.labels.confirmPassword).fill(nextPassword)
      await page
        .getByRole('button', { name: copy.auth.updatePassword.actions.submit, exact: true })
        .click()
      await expect(page.getByText(copy.auth.updatePassword.messages.success)).toBeVisible()
    })
  })
}
