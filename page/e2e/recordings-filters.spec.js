import { test, expect } from '@playwright/test'

const SHOW_RECORDINGS = 'Show only events with recordings'
const CLEAR_RECORDINGS = 'Clear recordings filter'
const LIST_URL = '/#/2026/list'
const RECORDED_TITLES = ['Devoxx France 2026', 'Sunny Tech', 'Riviera Dev']

const openFilters = async (page) => {
  const filters = page.locator('.filters')
  if (!(await filters.evaluate(element => element.classList.contains('open')))) {
    await page.locator('.filters-icon').first().click()
  }
  await expect(filters).toHaveClass(/open/)
}

const getHashParam = (page, key) => page.evaluate((param) => {
  const query = window.location.hash.split('?')[1] || ''
  return new URLSearchParams(query).get(param)
}, key)

const getAllHashParams = (page, key) => page.evaluate((param) => {
  const query = window.location.hash.split('?')[1] || ''
  return new URLSearchParams(query).getAll(param)
}, key)

const expectUnrelatedParamsPreserved = async (page) => {
  await expect.poll(() => getAllHashParams(page, 'custom')).toEqual(['one', 'two'])
  await expect.poll(() => getHashParam(page, 'empty')).toBe('')
}

test('sidebar and quick-access controls stay synchronized without losing ordering or duplicating entries', async ({ page }) => {
  await page.goto(LIST_URL)
  const titles = page.locator('.event-list-entry .title')
  await expect(titles.first()).toBeVisible()
  const initialTitles = await titles.allTextContents()

  const showButton = page.getByRole('button', { name: SHOW_RECORDINGS })
  await expect(showButton).toBeVisible()
  await expect(showButton).toHaveAttribute('aria-pressed', 'false')
  await expect.poll(() => getHashParam(page, 'recordings')).toBeNull()

  await openFilters(page)
  const checkbox = page.getByLabel('Recordings available', { exact: true })
  await expect(checkbox).toBeVisible()
  await expect(checkbox).not.toBeChecked()

  await checkbox.click()
  await expect(titles).toHaveText(RECORDED_TITLES)
  await expect.poll(() => getHashParam(page, 'recordings')).toBe('true')

  const clearButton = page.getByRole('button', { name: CLEAR_RECORDINGS })
  await expect(clearButton).toHaveAttribute('aria-pressed', 'true')
  await clearButton.click()

  await expect(titles).toHaveCount(initialTitles.length)
  expect(await titles.allTextContents()).toEqual(initialTitles)
  await expect(checkbox).not.toBeChecked()
  await expect(showButton).toHaveAttribute('aria-pressed', 'false')
  await expect.poll(() => getHashParam(page, 'recordings')).toBeNull()
})

test('quick toggle preserves the query, unrelated empty parameters, and repeated parameters', async ({ page }) => {
  await page.goto(`${LIST_URL}?query=Sunny%20Tech&custom=one&empty=&custom=two`)
  const titles = page.locator('.event-list-entry .title')
  await expect(titles).toHaveText(['Sunny Tech'])
  await expect(page.locator('.recordings-toggle-button + .cfp-view')).toHaveCount(1)

  await page.getByRole('button', { name: SHOW_RECORDINGS }).click()
  await expect.poll(() => getHashParam(page, 'recordings')).toBe('true')
  await expect.poll(() => getHashParam(page, 'query')).toBe('Sunny Tech')
  await expectUnrelatedParamsPreserved(page)
  await expect(titles).toHaveText(['Sunny Tech'])

  await openFilters(page)
  const checkbox = page.getByLabel('Recordings available', { exact: true })
  await expect(checkbox).toBeChecked()
  await checkbox.click()

  await expect.poll(() => getHashParam(page, 'recordings')).toBeNull()
  await expect.poll(() => getHashParam(page, 'query')).toBe('Sunny Tech')
  await expectUnrelatedParamsPreserved(page)
  await expect(page.getByRole('button', { name: SHOW_RECORDINGS })).toHaveAttribute('aria-pressed', 'false')
})

test('Clear All removes recordings and other filters but preserves sorting and unrelated parameters', async ({ page }) => {
  await page.goto(`${LIST_URL}?recordings=true&query=Sunny%20Tech&country=France&sort=attendees&custom=one&empty=&custom=two`)
  await openFilters(page)
  await expect(page.getByLabel('Recordings available', { exact: true })).toBeChecked()

  await page.getByRole('button', { name: 'Clear All Filters' }).click()

  for (const key of ['recordings', 'query', 'country']) {
    await expect.poll(() => getHashParam(page, key)).toBeNull()
  }
  await expect.poll(() => getHashParam(page, 'sort')).toBe('attendees')
  await expectUnrelatedParamsPreserved(page)
  await expect(page.getByLabel('Recordings available', { exact: true })).not.toBeChecked()
  await expect(page.locator('#filter-query')).toHaveValue('')
  await expect(page.getByRole('button', { name: SHOW_RECORDINGS })).toHaveAttribute('aria-pressed', 'false')
})

test('deep links restore controls and filter recording editions only', async ({ page }) => {
  const titles = page.locator('.event-list-entry .title')

  await page.goto(`${LIST_URL}?recordings=true`)
  await expect(titles).toHaveText(RECORDED_TITLES)
  await openFilters(page)
  await expect(page.getByLabel('Recordings available', { exact: true })).toBeChecked()
  await expect(page.getByRole('button', { name: CLEAR_RECORDINGS })).toHaveAttribute('aria-pressed', 'true')

  await page.reload()
  await expect(titles).toHaveText(RECORDED_TITLES)
  await expect(page.getByRole('button', { name: CLEAR_RECORDINGS })).toHaveAttribute('aria-pressed', 'true')

  await page.goto('/#/2025/list?recordings=true')
  await expect(page.locator('.eventCount')).toHaveText('no event')
  await expect(page.locator('.event-list-entry')).toHaveCount(0)

  await page.goto(LIST_URL)
  const unfilteredCount = await page.locator('.eventCount').textContent()
  await page.goto(`${LIST_URL}?recordings=false`)
  await expect(page.locator('.eventCount')).toHaveText(unfilteredCount)
  await expect(page.getByRole('button', { name: SHOW_RECORDINGS })).toHaveAttribute('aria-pressed', 'false')
})

test('calendar and map consume the same filtered year and view changes preserve state', async ({ page }) => {
  await page.goto('/#/2026/calendar?recordings=true&custom=one&empty=&custom=two')
  await expect(page.locator('.eventCount').first()).toHaveText('3 events')
  await expect(page.getByRole('button', { name: CLEAR_RECORDINGS })).toHaveAttribute('aria-pressed', 'true')

  await page.goto('/#/2026/map?recordings=true&custom=one&empty=&custom=two')
  await expect(page.locator('.eventCount')).toHaveText('3 events')
  await expect(page.locator('.leaflet-marker-icon')).toHaveCount(3)

  await page.locator('.view-selector.list-view').click()
  await expect(page.locator('.event-list-entry .title')).toHaveText(RECORDED_TITLES)
  await expect.poll(() => getHashParam(page, 'recordings')).toBe('true')
  await expectUnrelatedParamsPreserved(page)
})

test('CFP view filters current results while retaining its open-CFP scope', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-01-01T12:00:00Z'))
  await page.goto('/#/2026/cfp?recordings=true')
  await expect(page.locator('.cfpView .title')).toHaveText(RECORDED_TITLES)
  await expect(page.locator('.eventCount')).toHaveText('3 events')

  await openFilters(page)
  await expect(page.getByLabel('Recordings available', { exact: true })).toBeChecked()
  await page.getByRole('button', { name: CLEAR_RECORDINGS }).click()

  await expect.poll(() => getHashParam(page, 'recordings')).toBeNull()
  await expect.poll(async () => page.locator('.cfpView .title').count()).toBeGreaterThan(1)
})

test('CFP Companion filters current results and exposes both recording controls', async ({ page }) => {
  await page.goto('/#/2026/cfp-companion?query=Devoxx&recordings=true')
  await expect(page.locator('.cfp-companion-view .title')).toHaveText(['Devoxx France 2026'])
  await expect(page.locator('.eventCount')).toContainText('1 event')

  await openFilters(page)
  await expect(page.getByLabel('Recordings available', { exact: true })).toBeChecked()
  await expect(page.getByRole('button', { name: CLEAR_RECORDINGS })).toHaveAttribute('aria-pressed', 'true')
})

test('the quick-access group fits a narrow viewport with one unambiguous active control', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto(`${LIST_URL}?recordings=true`)
  await expect(page.locator('.event-list-entry .title')).toHaveText(RECORDED_TITLES)

  const quickButton = page.getByRole('button', { name: CLEAR_RECORDINGS })
  await expect(quickButton).toHaveAttribute('aria-pressed', 'true')
  const groupBounds = await page.locator('.view-type-selector').boundingBox()
  expect(groupBounds).not.toBeNull()
  expect(groupBounds.x).toBeGreaterThanOrEqual(0)
  expect(groupBounds.x + groupBounds.width).toBeLessThanOrEqual(375)

  await quickButton.click()
  await expect(page.getByRole('button', { name: SHOW_RECORDINGS })).toHaveAttribute('aria-pressed', 'false')
  await expect.poll(() => getHashParam(page, 'recordings')).toBeNull()
})

test('recordings composes with other filters and recovers when the other filter is disabled', async ({ page }) => {
  await page.goto(`${LIST_URL}?recordings=true&online=true`)
  await expect(page.locator('.eventCount')).toHaveText('no event')
  await expect(page.locator('.event-list-entry')).toHaveCount(0)

  await openFilters(page)
  const recordingsCheckbox = page.getByLabel('Recordings available', { exact: true })
  await expect(recordingsCheckbox).toBeChecked()
  await page.getByLabel('Online', { exact: true }).click()

  await expect(page.locator('.event-list-entry .title')).toHaveText(RECORDED_TITLES)
  await expect(recordingsCheckbox).toBeChecked()
  await expect.poll(() => getHashParam(page, 'recordings')).toBe('true')
  await expect.poll(() => getHashParam(page, 'online')).toBe('false')
})

test('noncanonical recording values leave both controls and results unfiltered', async ({ page }) => {
  await page.goto(LIST_URL)
  const unfilteredCount = await page.locator('.eventCount').textContent()

  for (const value of ['false', '1', 'TRUE', '']) {
    await page.goto(`${LIST_URL}?recordings=${value}`)
    await expect(page.locator('.eventCount')).toHaveText(unfilteredCount)
    await expect(page.getByRole('button', { name: SHOW_RECORDINGS })).toHaveAttribute('aria-pressed', 'false')

    await openFilters(page)
    await expect(page.getByLabel('Recordings available', { exact: true })).not.toBeChecked()
  }
})

test('duplicate recording parameters use the last value and normalize when toggled', async ({ page }) => {
  await page.goto(`${LIST_URL}?recordings=false&recordings=true&custom=one&empty=&custom=two`)
  await expect(page.locator('.event-list-entry .title')).toHaveText(RECORDED_TITLES)
  await expect(page.getByRole('button', { name: CLEAR_RECORDINGS })).toHaveAttribute('aria-pressed', 'true')

  await page.getByRole('button', { name: CLEAR_RECORDINGS }).click()
  await expect.poll(() => getAllHashParams(page, 'recordings')).toEqual([])
  await expectUnrelatedParamsPreserved(page)

  await page.getByRole('button', { name: SHOW_RECORDINGS }).click()
  await expect.poll(() => getAllHashParams(page, 'recordings')).toEqual(['true'])
  await expectUnrelatedParamsPreserved(page)
  await expect(page.locator('.event-list-entry .title')).toHaveText(RECORDED_TITLES)
})
