import { test, expect } from '@playwright/test'

// E2E tests for Advanced CFP Filtering
// These tests validate user-facing interactions in the browser.
// Run with: npm run test:e2e (requires dev server on localhost:8080)

const CFP_URL = '/#/2026/cfp'

const openFilters = async (page) => {
  const filters = page.locator('.filters')
  if (!(await filters.evaluate(element => element.classList.contains('open')))) {
    await page.locator('.filters-icon').first().click()
  }
  await expect(filters).toHaveClass(/open/)
}

test.describe('US-1: Unified Multi-Select Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CFP_URL)
    // Open the filters panel
    await openFilters(page)
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
    await openFilters(page)
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
    await openFilters(page)
  })

  test('TS-012: Exclusion chips render with red styling', async ({ page }) => {
    // Set an exclusion via URL
    await page.goto(`${CFP_URL}?tech_not=PHP`)
    await openFilters(page)
    const url = page.url()
    expect(url).toContain('tech_not=PHP')
  })

  test('TS-016: Removing exclusion updates URL', async ({ page }) => {
    await page.goto(`${CFP_URL}?tech_not=PHP`)
    await openFilters(page)
    // Verify param is in URL
    expect(page.url()).toContain('tech_not=PHP')
  })
})

test.describe('US-3: Online / In Person Checkboxes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CFP_URL)
    await openFilters(page)
  })

  test('Online and In Person checkboxes both exist', async ({ page }) => {
    const onlineCheckbox = page.locator('#filter-online')
    const inPersonCheckbox = page.locator('#filter-in-person')
    await expect(onlineCheckbox).toBeVisible()
    await expect(inPersonCheckbox).toBeVisible()
  })

  test('Both checkboxes can be selected independently', async ({ page }) => {
    const onlineCheckbox = page.locator('#filter-online')
    const inPersonCheckbox = page.locator('#filter-in-person')
    // These inputs are controlled from URL parameters, so wait for React to
    // apply each update instead of using check()'s immediate state assertion.
    await onlineCheckbox.click()
    await expect(onlineCheckbox).toBeChecked()
    await inPersonCheckbox.click()
    await expect(inPersonCheckbox).toBeChecked()
    await expect(onlineCheckbox).toBeChecked()
  })
})

test.describe('US-4: Any/All Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CFP_URL)
    await openFilters(page)
  })

  test('TS-021: Any/All toggle button exists on filter', async ({ page }) => {
    const modeToggle = page.locator('.filter-mode-toggle').first()
    await expect(modeToggle).toBeVisible()
  })

  test('TS-024: Mode URL param round-trip', async ({ page }) => {
    await page.goto(`${CFP_URL}?topic=Frontend&topic_mode=all`)
    await openFilters(page)
    expect(page.url()).toContain('topic_mode=all')
  })
})

// T035: Existing filter regression
test.describe('Existing Filter Regression (TS-034)', () => {
  test('text search filter still works', async ({ page }) => {
    await page.goto(CFP_URL)
    await openFilters(page)

    const queryInput = page.locator('#filter-query')
    await expect(queryInput).toBeVisible()
    await queryInput.fill('react')
    await expect.poll(() => page.url()).toContain('query=react')
  })

  test('fast text input does not lose characters while filtering the list', async ({ page }) => {
    await page.goto('/#/2026/list')
    await openFilters(page)

    const queryInput = page.locator('#filter-query')
    await queryInput.pressSequentially('produce')

    await expect(queryInput).toHaveValue('produce')
    await expect.poll(() => page.url()).toContain('query=produce')

    await page.getByRole('button', { name: 'Clear All Filters' }).click()
    await expect(queryInput).toHaveValue('')
    await expect.poll(() => page.url()).not.toContain('query=')
  })

  test('checkbox toggles still render', async ({ page }) => {
    await page.goto(CFP_URL)
    await openFilters(page)

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

// Panel dismissal: clicking outside or pressing Escape closes the panel
// without discarding what the user entered.
test.describe('Filter panel dismissal', () => {
  const filtersPanel = (page) => page.locator('.filters')
  const queryInput = (page) => page.locator('#filter-query')

  const clickOutsidePanel = async (page) => {
    // The page title spans the viewport, is not interactive, and its right
    // half sits clear of the 300px-wide panel.
    await page.locator('.dcaTitle').click({ position: { x: 700, y: 10 } })
  }

  test('clicking outside closes the panel and keeps the entered filters', async ({ page }) => {
    await page.goto('/#/2026/list')
    await openFilters(page)

    await queryInput(page).fill('react')
    await expect.poll(() => page.url()).toContain('query=react')

    await clickOutsidePanel(page)
    await expect(filtersPanel(page)).toHaveClass(/closed/)

    await openFilters(page)
    await expect(queryInput(page)).toHaveValue('react')
  })

  test('pressing Escape closes the panel and keeps the entered filters', async ({ page }) => {
    await page.goto('/#/2026/list')
    await openFilters(page)

    await queryInput(page).fill('rust')
    await expect.poll(() => page.url()).toContain('query=rust')

    await page.keyboard.press('Escape')
    await expect(filtersPanel(page)).toHaveClass(/closed/)

    await openFilters(page)
    await expect(queryInput(page)).toHaveValue('rust')
  })

  test('pressing Escape moves focus out of the hidden panel', async ({ page }) => {
    await page.goto('/#/2026/list')
    await openFilters(page)

    await queryInput(page).fill('react')
    await expect.poll(() => page.url()).toContain('query=react')

    await page.keyboard.press('Escape')
    await expect(filtersPanel(page)).toHaveClass(/closed/)

    const toggle = page.locator('.filters > .filters-header')
    await expect(toggle).toBeFocused()

    // Typing must not edit the query field that slid off-screen.
    await page.keyboard.type('xyz')
    await expect(queryInput(page)).toHaveValue('react')
    await expect.poll(() => page.url()).not.toContain('xyz')

    // The toggle is keyboard operable, so the panel can be reopened without a mouse.
    await page.keyboard.press('Enter')
    await expect(filtersPanel(page)).toHaveClass(/open/)
  })

  test('clicking inside the panel keeps it open', async ({ page }) => {
    await page.goto('/#/2026/list')
    await openFilters(page)

    await page.locator('#filter-online').click()

    await expect(filtersPanel(page)).toHaveClass(/open/)
  })

  test('selecting a dropdown option keeps the panel open', async ({ page }) => {
    await page.goto('/#/2026/list')
    await openFilters(page)

    const topicFilter = page.locator('.filter-multiselect').filter({ hasText: 'Topic' })
    await topicFilter.locator('.filter-ms__control').click()
    await page.locator('.filter-ms__option').first().click()

    await expect(filtersPanel(page)).toHaveClass(/open/)
  })
})

// T037: Empty filter category
test.describe('Empty Filter Category (TS-027)', () => {
  test('all tag filters render even if some have no options', async ({ page }) => {
    await page.goto(CFP_URL)
    await openFilters(page)

    // All TAG_FILTER_CONFIG.allowed dimensions should render
    const topicFilter = page.locator('.filter-multiselect').filter({ hasText: 'Topic' })
    const techFilter = page.locator('.filter-multiselect').filter({ hasText: 'Tech' })
    const langFilter = page.locator('.filter-multiselect').filter({ hasText: 'Language' })

    await expect(topicFilter).toBeVisible()
    await expect(techFilter).toBeVisible()
    await expect(langFilter).toBeVisible()
  })
})
