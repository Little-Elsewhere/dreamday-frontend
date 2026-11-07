import { expect, test } from 'playwright/test'

import { isLocaleLoginUrl } from '../constants/patterns'
import { e2eLocalePath } from '../helpers/env'
import { e2eLocales, m } from '../helpers/i18n'

for (const locale of e2eLocales) {
  test.describe(`login validation (${locale})`, () => {
    test('shows an email error before sign-in on mobile', async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'mobile', 'This check covers the mobile login layout.')

      const copy = m(locale)
      const response = await page.goto(e2eLocalePath('/auth/login', locale))
      expect(response?.status()).toBe(200)
      await expect(page.getByRole('heading', { name: copy.auth.login.content.title })).toBeVisible()

      const email = page.getByRole('textbox', { name: copy.auth.common.labels.email })
      await email.fill('not-an-email')
      await page
        .getByLabel(copy.auth.common.labels.password, { exact: true })
        .fill('not-a-real-password')
      await page.getByRole('button', { name: copy.auth.login.actions.submit, exact: true }).click()

      await expect(page.locator('#login-email-error')).toHaveText(
        copy.auth.common.errors.emailInvalid,
      )
      await expect(email).toHaveAttribute('aria-invalid', 'true')
      await expect(page).toHaveURL(isLocaleLoginUrl(locale))

      const screenshotPath = testInfo.outputPath(`invalid-email-${locale}.png`)
      await page.screenshot({ path: screenshotPath, fullPage: true })
      await testInfo.attach(`invalid-email-${locale}`, {
        path: screenshotPath,
        contentType: 'image/png',
      })
    })

    test('login page renders core fields on desktop and tablet', async ({ page }, testInfo) => {
      test.skip(testInfo.project.name === 'mobile', 'Mobile layout is covered separately.')

      const copy = m(locale)
      await page.goto(e2eLocalePath('/auth/login', locale))
      await expect(page.getByRole('heading', { name: copy.auth.login.content.title })).toBeVisible()
      await expect(page.getByRole('textbox', { name: copy.auth.common.labels.email })).toBeVisible()
      await expect(page.getByLabel(copy.auth.common.labels.password, { exact: true })).toBeVisible()
      await expect(
        page.getByRole('button', { name: copy.auth.login.actions.submit, exact: true }),
      ).toBeVisible()
      await expect(
        page.getByRole('button', { name: copy.auth.login.actions.forgotPassword }),
      ).toBeVisible()
    })
  })
}
