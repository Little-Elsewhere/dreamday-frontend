import { LOCALES } from '../../src/constants/locale'
import { expect, test } from '../fixtures/authenticated-test'

for (const locale of LOCALES) {
  test(`keeps access to private trips after reload in ${locale}`, async ({ page }) => {
    const tripsPath = `/${locale}/trips`

    await page.goto(tripsPath)
    await expect(page).toHaveURL(new RegExp(`${tripsPath}$`))

    await page.reload()
    await expect(page).toHaveURL(new RegExp(`${tripsPath}$`))
  })
}
