import { test, expect } from '@playwright/test'

const LIST_URL = '/#/2026/list'
const ALL_THINGS_AI = 'All Things AI 2026'

const allThingsAiEntry = (page) =>
  page.locator('.event-list-entry').filter({ hasText: ALL_THINGS_AI }).first()

test('multi-recording event shows a count badge and opens the popup', async ({ page }) => {
  await page.goto(`${LIST_URL}?query=All%20Things%20AI`)
  const entry = allThingsAiEntry(page)
  await expect(entry).toBeVisible()

  const trigger = entry.locator('.rec-trigger')
  await expect(trigger.locator('.badge')).toHaveText('3')
  await expect(entry.locator('.rec-menu')).toHaveCount(0)

  await trigger.click()
  const menu = page.locator('.rec-menu')
  await expect(menu).toBeVisible()
  await expect(menu.locator('.rec-menu-head')).toContainText('Recordings')
  await expect(menu.locator('.event-name')).toHaveText(ALL_THINGS_AI)

  const items = menu.locator('.rec-item')
  await expect(items).toHaveCount(3)
  await expect(items.locator('.rec-label')).toHaveText([
    'Deep Thoughts',
    'Keynotes',
    'AI in the Enterprise'
  ])
  // Each label must point to the playlist of the same name (guards the label swap).
  await expect(items.nth(0)).toHaveAttribute('href', /list=PLSSFNrVNTBEP91SCvJRYwHffK8xBwNRd7/)
  await expect(items.nth(1)).toHaveAttribute('href', /list=PLSSFNrVNTBEO8bWYH00t76gWZuylq7JWu/)
  await expect(items.nth(2)).toHaveAttribute('href', /list=PLSSFNrVNTBEONRa58mrz7q6Jz91nl6VUt/)
  await expect(items.locator('.rec-host').first()).toHaveText('youtube.com · playlist')
  await expect(items.locator('.ext')).toHaveCount(3)
  await expect(menu.locator('.rec-foot')).toHaveCount(0)
  await expect(items.first()).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(page.locator('.rec-menu')).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test('popup closes on an outside click', async ({ page }) => {
  await page.goto(`${LIST_URL}?query=All%20Things%20AI`)
  const entry = allThingsAiEntry(page)
  await entry.locator('.rec-trigger').click()
  await expect(page.locator('.rec-menu')).toBeVisible()

  await page.mouse.click(10, 10)
  await expect(page.locator('.rec-menu')).toHaveCount(0)
})

test('single-recording event shows a direct link without a badge', async ({ page }) => {
  await page.goto(`${LIST_URL}?query=NODES%20AI`)
  const entry = page.locator('.event-list-entry').filter({ hasText: 'NODES AI' }).first()
  await expect(entry).toBeVisible()

  await expect(entry.locator('.rec-trigger')).toHaveCount(0)
  await expect(entry.locator('.badge')).toHaveCount(0)
  const link = entry.locator('a.recording-link')
  await expect(link).toHaveCount(1)
  await expect(link).toHaveAttribute('href', /youtube\.com/)
})

test('popup opens next to its trigger on a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 })
  await page.goto(`${LIST_URL}?query=All%20Things%20AI`)
  const entry = allThingsAiEntry(page)
  const trigger = entry.locator('.rec-trigger')
  await trigger.click()

  const menu = page.locator('.rec-menu')
  await expect(menu).toBeVisible()
  await expect(menu).toHaveCSS('position', 'fixed')
  const [bounds, triggerBounds] = await Promise.all([menu.boundingBox(), trigger.boundingBox()])
  const opensBelow = Math.abs(bounds.y - (triggerBounds.y + triggerBounds.height + 8)) < 1
  const opensAbove = Math.abs(bounds.y + bounds.height - (triggerBounds.y - 8)) < 1
  expect(opensBelow || opensAbove).toBe(true)
  expect(triggerBounds.x + triggerBounds.width / 2).toBeGreaterThanOrEqual(bounds.x)
  expect(triggerBounds.x + triggerBounds.width / 2).toBeLessThanOrEqual(bounds.x + bounds.width)
  expect(bounds.x).toBeGreaterThanOrEqual(0)
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390)
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(800)
  await expect(menu.locator('.rec-item')).toHaveCount(3)
})

test('popup opens immediately above a trigger near the viewport bottom', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto(LIST_URL)
  await expect(page.locator('.listView h1').filter({ hasText: 'November Events:' })).toBeInViewport()
  const trigger = page.locator('.event-list-entry').filter({ hasText: 'Web Summit Lisbon' }).locator('.rec-trigger')
  const initialTop = await trigger.evaluate(element => element.getBoundingClientRect().top)
  await page.evaluate(top => window.scrollBy({ top: top - innerHeight + 100, behavior: 'instant' }), initialTop)
  await trigger.click()

  const menu = page.locator('.rec-menu')
  await expect(menu).toBeVisible()
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const [bounds, triggerBounds] = await Promise.all([menu.boundingBox(), trigger.boundingBox()])
  expect(Math.abs(bounds.y + bounds.height - (triggerBounds.y - 8))).toBeLessThan(1)
  expect(bounds.y).toBeGreaterThanOrEqual(0)
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(1280)
})

test('phone map popup stays open and scrolls long recording lists', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 667 })
  await page.goto('/#/2025/map?query=IndiaFOSS')
  await page.locator('.leaflet-marker-icon').click()
  await page.locator('.leaflet-popup .rec-trigger').click()

  const menu = page.locator('.rec-menu')
  await expect(menu).toBeVisible()
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  await expect(menu).toBeVisible()
  await expect(menu.locator('.rec-item')).toHaveCount(11)

  const lastItem = menu.locator('.rec-item').last()
  await lastItem.scrollIntoViewIfNeeded()
  await expect(lastItem).toBeVisible()
  await expect(menu).toBeVisible()
})

test('recording popup is not clipped by the map popup', async ({ page }) => {
  await page.goto('/#/2025/map?query=IndiaFOSS')
  await page.locator('.leaflet-marker-icon').click()

  const popup = page.locator('.leaflet-popup')
  await expect(popup).toBeVisible()
  await popup.locator('.rec-trigger').click()

  const menu = page.locator('.rec-menu')
  await expect(menu).toBeVisible()
  await expect(menu).toHaveCSS('position', 'fixed')
  await expect(menu.locator('.rec-item')).toHaveCount(11)

  // Focusing the first item must not scroll Leaflet and immediately close the
  // recordings popup. Flush animation frames so any focus-induced scroll runs.
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  await expect(menu).toBeVisible()

  // An item below the map popup's 350 px content limit must be hit-testable,
  // not hidden behind a clipping ancestor.
  const itemIsTopmost = await menu.locator('.rec-item').nth(2).evaluate((item) => {
    const rect = item.getBoundingClientRect()
    const hit = document.elementFromPoint(rect.left + 10, rect.top + rect.height / 2)
    return hit === item || item.contains(hit)
  })
  expect(itemIsTopmost).toBe(true)
})
