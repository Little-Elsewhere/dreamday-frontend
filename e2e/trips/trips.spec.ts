import { expect, test } from 'playwright/test'

const email = process.env.TRIPS_E2E_EMAIL
const password = process.env.TRIPS_E2E_PASSWORD

const inDays = (days: number): string => {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

test.describe('authenticated trip journeys', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !email || !password,
      'Set TRIPS_E2E_EMAIL and TRIPS_E2E_PASSWORD to run authenticated trip flows.',
    )
    await page.goto('/en/auth/login')
    await page.locator('#login-email').fill(email!)
    await page.locator('#login-password').fill(password!)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/en\/account$/)
  })

  test('search, filters, and both locales render', async ({ page }) => {
    await page.goto('/en/trips')
    await expect(page.getByRole('heading', { name: 'Your trips' })).toBeVisible()
    await page.getByLabel('Find a trip').fill(`no-trip-${Date.now()}`)
    await expect(page.getByRole('heading', { name: 'No trips match that search' })).toBeVisible()
    await page.getByRole('button', { name: 'Clear filters' }).click()
    await page.getByRole('button', { name: 'Upcoming' }).click()
    await page.goto('/vi/trips')
    await expect(page.getByRole('heading', { name: 'Chuyến đi của bạn' })).toBeVisible()
  })

  test('saves a draft, resumes it, edits the itinerary, and opens the published detail', async ({
    page,
  }) => {
    const name = `Test trip ${Date.now()}`
    const startDate = inDays(45)
    const endDate = inDays(47)
    const activityTitle = `Coffee walk ${Date.now()}`

    await page.goto('/en/trips/create')
    await page.locator('#trip-name').fill(name)
    await page.locator('#trip-destination').fill('Da Lat')
    await page.locator('#trip-description').fill('A few quiet days in the highlands.')
    await page.locator('#trip-start-date').fill(startDate)
    await page.locator('#trip-end-date').fill(endDate)
    await page.getByLabel('A little of everything').check()
    await page.getByRole('button', { name: 'Save draft' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Draft saved' })).toBeVisible()

    await page.reload()
    await expect(page.locator('#trip-name')).toHaveValue(name)
    await page.locator('input[type="file"]').setInputFiles({
      name: 'cover.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/XYkAAAAASUVORK5CYII=',
        'base64',
      ),
    })
    await expect(
      page.getByRole('status').filter({ hasText: 'cover photo has been added' }),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Continue to itinerary' }).click()

    await page.getByRole('button', { name: 'Add an activity' }).click()
    await page.locator('#activity-title').fill(activityTitle)
    await page.locator('#activity-start').selectOption('540')
    await page.locator('#activity-end').selectOption('600')
    await page.getByRole('button', { name: 'Save activity' }).click()
    await expect(page.getByRole('button', { name: new RegExp(activityTitle) })).toBeVisible()
    const moveSaved = page.waitForResponse(
      (response) => response.request().method() === 'POST' && response.status() === 200,
    )
    await page.getByRole('button', { name: `Move ${activityTitle} to the next day` }).click()
    await moveSaved
    const durationSaved = page.waitForResponse(
      (response) => response.request().method() === 'POST' && response.status() === 200,
    )
    await page.getByRole('button', { name: `Extend ${activityTitle} by 15 minutes` }).click()
    await durationSaved

    await page.locator('#trip-note').fill('Remember to bring a light jacket.')
    await page.getByRole('button', { name: 'Save note' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Trip note saved' })).toBeVisible()
    await page.getByRole('button', { name: 'Create trip' }).last().click()

    await expect(page).toHaveURL(/\/en\/trips\/[0-9a-f-]+$/)
    await expect(page.getByRole('heading', { name })).toBeVisible()
    await expect(page.getByText(activityTitle)).toBeVisible()
    await expect(page.getByText('Remember to bring a light jacket.')).toBeVisible()

    await page.goto('/en/trips')
    await page.getByLabel('Find a trip').fill(name)
    await page.getByRole('button', { name: 'Upcoming' }).click()
    await expect(page.getByRole('link', { name: new RegExp(name) })).toBeVisible()
  })
})
