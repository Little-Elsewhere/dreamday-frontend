import { expect, test } from 'playwright/test'

import { Locale, LOCALES } from '../../src/constants/locale'
import { registerUser } from '../support/auth/register'
import { deleteUser } from '../support/database/database'
import { confirmEmail } from '../support/mail/mailpit'
import { generateEmail, generatePassword } from '../utils/auth'

for (const locale of LOCALES) {
  test(`registers and confirms an account in ${locale}`, async ({ page }) => {
    const email = generateEmail('register')
    const password = generatePassword()

    try {
      await registerUser(page, email, password, locale)
      await expect(page).toHaveURL(new RegExp(`/${locale}/auth/register/success$`))

      await confirmEmail(page, email)
      await expect(page).toHaveURL(new RegExp(`/${locale}/trips$`))
    } finally {
      await deleteUser(email)
    }
  })
}
