import { expect, test } from '@playwright/test'

// Assumes the local database has been seeded (pnpm seed).
test.describe('Public site', () => {
  test('home page shows the hero and navigation', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page).toHaveTitle(/Celestial Church of Christ/)
    await expect(page.locator('h1').first()).toHaveAttribute('aria-label', /You belong here/)
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()
  })

  for (const path of ['/about-us', '/our-team', '/ministries', '/events', '/sermons', '/gallery', '/give', '/contact']) {
    test(`${path} loads`, async ({ page }) => {
      const res = await page.goto(`http://localhost:3000${path}`)
      expect(res?.status()).toBe(200)
      await expect(page.locator('h1').first()).toBeVisible()
    })
  }

  test('old WordPress links redirect', async ({ page }) => {
    await page.goto('http://localhost:3000/contacts')
    await expect(page).toHaveURL(/\/contact$/)
  })
})
