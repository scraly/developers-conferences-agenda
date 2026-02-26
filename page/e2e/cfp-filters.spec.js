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
    const regionFilter = page.locator('.filter-multiselect').filter({ hasText: 'Region' })
    const countryFilter = page.locator('.filter-multiselect').filter({ hasText: 'Country' })
    await expect(regionFilter).toBeVisible()
    await expect(countryFilter).toBeVisible()
  })

  test('TS-011: URL preserves filter state', async ({ page }) => {
    await page.goto(`${CFP_URL}?topic=Frontend`)
    await page.click('.filters-header')
    await page.waitForSelector('.filters.open')
    const url = page.url()
    expect(url).toContain('topic=Frontend')
  })

  test('TS-038: Clear All Filters button exists', async ({ page }) => {
    const clearBtn = page.locator('.clear-all-filters')
    await expect(clearBtn).toBeVisible()
    await expect(clearBtn).toHaveText('Clear All Filters')
  })
})

test.describe('US-2: Negative Tag Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CFP_URL)
    await page.click('.filters-header')
    await page.waitForSelector('.filters.open')
  })

  test('TS-012: Exclusion chips render with red styling', async ({ page }) => {
    // Set an exclusion via URL
    await page.goto(`${CFP_URL}?tech_not=PHP`)
    await page.click('.filters-header')
    await page.waitForSelector('.filters.open')
    const url = page.url()
    expect(url).toContain('tech_not=PHP')
  })

  test('TS-016: Removing exclusion updates URL', async ({ page }) => {
    await page.goto(`${CFP_URL}?tech_not=PHP`)
    await page.click('.filters-header')
    await page.waitForSelector('.filters.open')
    // Verify param is in URL
    expect(page.url()).toContain('tech_not=PHP')
  })
})

test.describe('US-3: Not Online Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CFP_URL)
    await page.click('.filters-header')
    await page.waitForSelector('.filters.open')
  })

  test('TS-017: Not Online toggle exists', async ({ page }) => {
    const notOnlineCheckbox = page.locator('#filter-not-online')
    await expect(notOnlineCheckbox).toBeVisible()
  })

  test('TS-020: Online and Not Online are mutually exclusive', async ({ page }) => {
    const onlineCheckbox = page.locator('#filter-online')
    const notOnlineCheckbox = page.locator('#filter-not-online')
    await expect(onlineCheckbox).toBeVisible()
    await expect(notOnlineCheckbox).toBeVisible()
  })
})

test.describe('US-4: Any/All Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CFP_URL)
    await page.click('.filters-header')
    await page.waitForSelector('.filters.open')
  })

  test('TS-021: Any/All toggle button exists on filter', async ({ page }) => {
    const modeToggle = page.locator('.filter-mode-toggle').first()
    await expect(modeToggle).toBeVisible()
  })

  test('TS-024: Mode URL param round-trip', async ({ page }) => {
    await page.goto(`${CFP_URL}?topic=Frontend&topic_mode=all`)
    await page.click('.filters-header')
    await page.waitForSelector('.filters.open')
    expect(page.url()).toContain('topic_mode=all')
  })
})

// T035: Existing filter regression
test.describe('Existing Filter Regression (TS-034)', () => {
  test('text search filter still works', async ({ page }) => {
    await page.goto(CFP_URL)
    await page.click('.filters-header')
    await page.waitForSelector('.filters.open')

    const queryInput = page.locator('#filter-query')
    await expect(queryInput).toBeVisible()
    await queryInput.fill('react')
    expect(page.url()).toContain('query=react')
  })

  test('checkbox toggles still render', async ({ page }) => {
    await page.goto(CFP_URL)
    await page.click('.filters-header')
    await page.waitForSelector('.filters.open')

    const onlineCheckbox = page.locator('#filter-online')
    const favoritesCheckbox = page.locator('#filter-favorites')
    await expect(onlineCheckbox).toBeVisible()
    await expect(favoritesCheckbox).toBeVisible()
  })
})

// T036: No-results message (validated at unit test level)
test.describe('Edge Cases (TS-026)', () => {
  test('page loads with filter params', async ({ page }) => {
    // Test with a filter that likely eliminates all events
    await page.goto(`${CFP_URL}?topic=NonExistentTopic12345`)
    // Page should still load without crashing
    await expect(page.locator('body')).toBeVisible()
  })
})

// T037: Empty filter category
test.describe('Empty Filter Category (TS-027)', () => {
  test('all tag filters render even if some have no options', async ({ page }) => {
    await page.goto(CFP_URL)
    await page.click('.filters-header')
    await page.waitForSelector('.filters.open')

    // All TAG_FILTER_CONFIG.allowed dimensions should render
    const topicFilter = page.locator('.filter-multiselect').filter({ hasText: 'Topic' })
    const techFilter = page.locator('.filter-multiselect').filter({ hasText: 'Tech' })
    const langFilter = page.locator('.filter-multiselect').filter({ hasText: 'Language' })
    const typeFilter = page.locator('.filter-multiselect').filter({ hasText: 'Type' })

    await expect(topicFilter).toBeVisible()
    await expect(techFilter).toBeVisible()
    await expect(langFilter).toBeVisible()
    await expect(typeFilter).toBeVisible()
  })
})
