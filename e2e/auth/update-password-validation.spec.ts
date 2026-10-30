import { expect, test } from 'playwright/test'

test('redirects unauthenticated users away from update-password', async ({ page }) => {
  await page.goto('/en/auth/update-password')

  await expect(page).toHaveURL(/\/en\/auth\/login$/)
  await expect(page.getByRole('heading', { name: 'Continue your journey' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Update password' })).toHaveCount(0)
})
