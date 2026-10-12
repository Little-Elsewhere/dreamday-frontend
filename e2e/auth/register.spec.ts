import { test } from 'playwright/test'

import { LOCALES } from '../../src/constants/locale'

for (const locale of LOCALES) {
  test.skip(`registers and confirms an account in ${locale}`, () => {
    // TODO: Reconnect this case to the API and its email delivery flow.
  })
}
