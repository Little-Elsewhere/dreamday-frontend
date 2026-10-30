import { test } from 'playwright/test'

import { LOCALES } from '../../src/constants/locale'

for (const locale of LOCALES) {
  test.skip(`registers and confirms an account in ${locale}`, () => {
    // Requires a running API + mailbox (Mailpit) to complete email verification.
  })
}
