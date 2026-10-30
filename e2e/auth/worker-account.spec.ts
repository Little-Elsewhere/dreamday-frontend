import { test } from 'playwright/test'

import { LOCALES } from '../../src/constants/locale'

for (const locale of LOCALES) {
  test.skip(`keeps access to private trips after reload in ${locale}`, () => {
    // Requires authenticated session fixtures wired to the API.
  })
}
