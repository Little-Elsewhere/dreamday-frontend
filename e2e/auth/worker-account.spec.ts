import { test } from 'playwright/test'

import { LOCALES } from '../../src/constants/locale'

for (const locale of LOCALES) {
  test.skip(`keeps access to private trips after reload in ${locale}`, () => {
    // TODO: Reconnect this case to API authentication and trip access.
  })
}
