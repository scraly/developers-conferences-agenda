import { test, expect } from '@playwright/test'

const LIST_URL = '/#/2026/list'

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

const recordingsCheckbox = page => page.getByLabel('Recordings available', { exact: true })

const expectOnlyRecordingEditions = async (page) => {
  await expect(page.locator('.event-list-entry').first()).toBeVisible()
  await expect(page.locator('.event-list-entry:not(:has(.recording-link))')).toHaveCount(0)
}

test('recordings checkbox filters recording editions without losing ordering or duplicating entries', async ({ page }) => {
  await page.goto(LIST_URL)
  const titles = page.locator('.event-list-entry .title')
  await expect(titles.first()).toBeVisible()
  const initialTitles = await titles.allTextContents()

  await openFilters(page)
  const checkbox = recordingsCheckbox(page)
  await expect(checkbox).toBeVisible()
  await expect(checkbox).not.toBeChecked()
  await expect.poll(() => getHashParam(page, 'recordings')).toBeNull()

  await checkbox.click()
  await expectOnlyRecordingEditions(page)
  expect((await titles.allTextContents()).length).toBeLessThan(initialTitles.length)
  await expect.poll(() => getHashParam(page, 'recordings')).toBe('true')

  await checkbox.click()

  await expect(titles).toHaveCount(initialTitles.length)
  expect(await titles.allTextContents()).toEqual(initialTitles)
  await expect(checkbox).not.toBeChecked()
  await expect.poll(() => getHashParam(page, 'recordings')).toBeNull()
})

test('recordings checkbox preserves the query, unrelated empty parameters, and repeated parameters', async ({ page }) => {
  await page.goto(`${LIST_URL}?query=Sunny%20Tech&custom=one&empty=&custom=two`)
  const titles = page.locator('.event-list-entry .title')
  await expect(titles).toHaveText(['Sunny Tech'])

  await openFilters(page)
  const checkbox = recordingsCheckbox(page)
  await checkbox.click()
  await expect.poll(() => getHashParam(page, 'recordings')).toBe('true')
  await expect.poll(() => getHashParam(page, 'query')).toBe('Sunny Tech')
  await expectUnrelatedParamsPreserved(page)
  await expect(titles).toHaveText(['Sunny Tech'])

  await checkbox.click()

  await expect.poll(() => getHashParam(page, 'recordings')).toBeNull()
  await expect.poll(() => getHashParam(page, 'query')).toBe('Sunny Tech')
  await expectUnrelatedParamsPreserved(page)
})

test('Clear All removes recordings and other filters but preserves sorting and unrelated parameters', async ({ page }) => {
  await page.goto(`${LIST_URL}?recordings=true&query=Sunny%20Tech&country=France&sort=attendees&custom=one&empty=&custom=two`)
  await openFilters(page)
  await expect(recordingsCheckbox(page)).toBeChecked()

  await page.getByRole('button', { name: 'Clear All Filters' }).click()

  for (const key of ['recordings', 'query', 'country']) {
    await expect.poll(() => getHashParam(page, key)).toBeNull()
  }
  await expect.poll(() => getHashParam(page, 'sort')).toBe('attendees')
  await expectUnrelatedParamsPreserved(page)
  await expect(recordingsCheckbox(page)).not.toBeChecked()
  await expect(page.locator('#filter-query')).toHaveValue('')
})

test('deep links restore the checkbox and filter recording editions only', async ({ page }) => {
  await page.goto(`${LIST_URL}?recordings=true`)
  await expectOnlyRecordingEditions(page)
  await openFilters(page)
  await expect(recordingsCheckbox(page)).toBeChecked()

  await page.reload()
  await expectOnlyRecordingEditions(page)
  await expect(recordingsCheckbox(page)).toBeChecked()

  await page.goto(LIST_URL)
  const unfilteredCount = await page.locator('.eventCount').textContent()
  await page.goto(`${LIST_URL}?recordings=false`)
  await expect(page.locator('.eventCount')).toHaveText(unfilteredCount)
  await expect(recordingsCheckbox(page)).not.toBeChecked()
})

test('calendar and map expose the filter, consume the filtered year, and preserve state across views', async ({ page }) => {
  await page.goto(`${LIST_URL}?recordings=true&custom=one&empty=&custom=two`)
  await expectOnlyRecordingEditions(page)
  const recordingEventCount = await page.locator('.eventCount').textContent()

  await page.goto('/#/2026/calendar?recordings=true&custom=one&empty=&custom=two')
  await expect(page.locator('.eventCount').first()).toHaveText(recordingEventCount)
  await openFilters(page)
  await expect(recordingsCheckbox(page)).toBeChecked()

  await page.goto('/#/2026/map?recordings=true&custom=one&empty=&custom=two')
  await expect(page.locator('.eventCount')).toHaveText(recordingEventCount)
  await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible()
  await openFilters(page)
  await expect(recordingsCheckbox(page)).toBeChecked()

  await page.locator('.view-selector.list-view').click()
  await expectOnlyRecordingEditions(page)
  await expect.poll(() => getHashParam(page, 'recordings')).toBe('true')
  await expectUnrelatedParamsPreserved(page)
})

test.describe('recordings filter availability', () => {
  for (const { view, visible } of [
    { view: 'list', visible: true },
    { view: 'calendar', visible: true },
    { view: 'map', visible: true },
    { view: 'cfp', visible: false },
    { view: 'cfp-companion', visible: false },
  ]) {
    test(`${visible ? 'shows' : 'hides'} the filter in ${view}`, async ({ page }) => {
      await page.goto(`/#/2026/${view}`)
      await openFilters(page)
      await expect(page.locator('.recordings-toggle-button')).toHaveCount(0)

      if (visible) {
        await expect(recordingsCheckbox(page)).toBeVisible()
      } else {
        await expect(recordingsCheckbox(page)).toHaveCount(0)
      }
    })
  }
})

test.describe('recordings query parameter scope', () => {
  for (const { view, viewSelector, titleSelector } of [
    { view: 'cfp', viewSelector: '.view-selector.cfp-view', titleSelector: '.cfpView .title' },
    { view: 'cfp-companion', viewSelector: '.view-selector.cfp-companion-view', titleSelector: '.cfp-companion-view .title' },
  ]) {
    test(`ignores recordings when navigating from list to ${view}`, async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-01-01T12:00:00Z'))
      const titles = page.locator(titleSelector)

      await page.goto(`/#/2026/${view}`)
      await expect(titles.first()).toBeVisible()
      const unfilteredTitles = await titles.allTextContents()

      await page.goto(`${LIST_URL}?recordings=true`)
      await expectOnlyRecordingEditions(page)
      await page.locator(viewSelector).click()

      await expect.poll(() => getHashParam(page, 'recordings')).toBe('true')
      await expect(titles).toHaveText(unfilteredTitles)
      await openFilters(page)
      await expect(recordingsCheckbox(page)).toHaveCount(0)
    })
  }
})

test('recordings composes with other filters and recovers when the other filter is disabled', async ({ page }) => {
  await page.goto(`${LIST_URL}?recordings=true`)
  await expectOnlyRecordingEditions(page)
  const recordingEventCount = await page.locator('.eventCount').textContent()

  await page.goto(`${LIST_URL}?recordings=true&online=true`)
  await expect(page.locator('.eventCount')).not.toHaveText(recordingEventCount)
  await expectOnlyRecordingEditions(page)

  await openFilters(page)
  const checkbox = recordingsCheckbox(page)
  await expect(checkbox).toBeChecked()
  await page.getByLabel('Online', { exact: true }).click()

  await expect(page.locator('.eventCount')).toHaveText(recordingEventCount)
  await expectOnlyRecordingEditions(page)
  await expect(checkbox).toBeChecked()
  await expect.poll(() => getHashParam(page, 'recordings')).toBe('true')
  await expect.poll(() => getHashParam(page, 'online')).toBe('false')
})

test('noncanonical recording values leave the checkbox and results unfiltered', async ({ page }) => {
  await page.goto(LIST_URL)
  const unfilteredCount = await page.locator('.eventCount').textContent()

  for (const value of ['false', '1', 'TRUE', '']) {
    await page.goto(`${LIST_URL}?recordings=${value}`)
    await expect(page.locator('.eventCount')).toHaveText(unfilteredCount)

    await openFilters(page)
    await expect(recordingsCheckbox(page)).not.toBeChecked()
  }
})

test('duplicate recording parameters use the last value and normalize when toggled', async ({ page }) => {
  await page.goto(`${LIST_URL}?recordings=false&recordings=true&custom=one&empty=&custom=two`)
  await expectOnlyRecordingEditions(page)

  await openFilters(page)
  const checkbox = recordingsCheckbox(page)
  await expect(checkbox).toBeChecked()
  await checkbox.click()
  await expect.poll(() => getAllHashParams(page, 'recordings')).toEqual([])
  await expect(checkbox).not.toBeChecked()
  await expectUnrelatedParamsPreserved(page)

  await checkbox.click()
  await expect.poll(() => getAllHashParams(page, 'recordings')).toEqual(['true'])
  await expectUnrelatedParamsPreserved(page)
  await expectOnlyRecordingEditions(page)
})
