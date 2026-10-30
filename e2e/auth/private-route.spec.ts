import { expect, test } from 'playwright/test'

test('redirects unauthenticated users from private routes to login', async ({ page }) => {
  await page.goto('/en/account')
  await expect(page).toHaveURL(/\/en\/auth\/login$/)
  await expect(page.getByRole('heading', { name: 'Continue your journey' })).toBeVisible()
})

test('redirects unauthenticated trips access to login', async ({ page }) => {
  await page.goto('/en/trips')
  await expect(page).toHaveURL(/\/en\/auth\/login$/)
})

test('redirects unauthenticated trip-create access to login', async ({ page }) => {
  await page.goto('/en/trips/create')
  await expect(page).toHaveURL(/\/en\/auth\/login$/)
})
