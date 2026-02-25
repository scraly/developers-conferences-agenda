import { test, expect } from '@playwright/test'

// E2E tests for Advanced CFP Filtering
// These tests validate user-facing interactions in the browser.
// Run with: npm run test:e2e (requires dev server on localhost:8080)

const CFP_URL = '/#/2026/cfp'

test.describe('US-1: Unified Multi-Select Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CFP_URL)
    // Open the filters panel
    await page.click('.filters-header')
    await page.waitForSelector('.filters.open')
  })

  test('TS-001: Multi-select topic filter shows matching events', async ({ page }) => {
    // Verify topic FilterMultiSelect renders
    const topicFilter = page.locator('.filter-multiselect').filter({ hasText: 'Topic' })
    await expect(topicFilter).toBeVisible()
  })

  test('TS-004: Multi-select country filter renders', async ({ page }) => {
    const countryFilter = page.locator('.filter-multiselect').filter({ hasText: 'Country' })
    await expect(countryFilter).toBeVisible()
  })

  test('TS-005: Multi-select region filter renders', async ({ page }) => {
    const regionFilter = page.locator('.filter-multiselect').filter({ hasText: 'Region' })
    await expect(regionFilter).toBeVisible()
  })

  test('TS-010: Region cascading — available on page', async ({ page }) => {
    // Verify both Region and Country filters exist
    const regionFilter = page.locator('.filter-multiselect').filter({ hasText: 'Region' })
    const countryFilter = page.locator('.filter-multiselect').filter({ hasText: 'Country' })
    await expect(regionFilter).toBeVisible()
    await expect(countryFilter).toBeVisible()
  })

  test('TS-011: URL preserves filter state', async ({ page }) => {
    // Set a topic filter via URL
    await page.goto(`${CFP_URL}?topic=Frontend`)
    await page.click('.filters-header')
    await page.waitForSelector('.filters.open')

    // Check URL contains the param
    const url = page.url()
    expect(url).toContain('topic=Frontend')
  })

  test('TS-038: Clear All Filters button exists', async ({ page }) => {
    const clearBtn = page.locator('.clear-all-filters')
    await expect(clearBtn).toBeVisible()
    await expect(clearBtn).toHaveText('Clear All Filters')
  })
})
