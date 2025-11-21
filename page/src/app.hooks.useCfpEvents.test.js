import { describe, it, expect, beforeEach, vi } from 'vitest'
import { filterCfpEventsByYear } from './app.hooks.js'

/**
 * The CFP view should show events with open CFPs where:
 * - The CFP deadline has not yet passed (relative to today)
 * - The CFP closes in the selected year or later
 */

describe('useCfpEvents - CFP year filtering', () => {
  let mockToday

  beforeEach(() => {
    // Mock today's date as November 17, 2025
    mockToday = new Date('2025-11-17T12:00:00Z')
    vi.setSystemTime(mockToday)
  })

  const createEvent = (name, cfpClosesDate, eventDate) => ({
    name,
    cfp: {
      untilDate: cfpClosesDate,
      until: new Date(cfpClosesDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    },
    date: [eventDate],
    location: 'Test Location',
    country: 'ES',
    hyperlink: 'https://test.com',
    tags: []
  })

  it('should NOT show DevBcn 2025 when viewing 2026 (CFP closed in previous year)', () => {
    // CFP closes in Feb 2025, event happens in July 2025, viewing year 2026
    // This should NOT show because CFP closes in previous year (2025)
    const events = [
      createEvent('DevBcn 2025', '2025-02-28T00:00:00Z', '2025-07-08T00:00:00Z')
    ]

    const result = filterCfpEventsByYear(events, '2026')

    // Does NOT show - CFP closes in 2025, not in 2026+
    expect(result).toHaveLength(0)
  })

  it('should show CFPs closing in the selected year (2026)', () => {
    const events = [
      createEvent('Conference Jan 2026', '2026-01-31T00:00:00Z', '2026-06-15T00:00:00Z'),
      createEvent('Conference Nov 2026', '2026-11-15T00:00:00Z', '2026-11-20T00:00:00Z')
    ]

    const result = filterCfpEventsByYear(events, '2026')

    // Both should show - CFPs close in 2026
    expect(result).toHaveLength(2)
  })

  it('should show CFPs closing after the selected year (2027 when viewing 2026)', () => {
    // When viewing 2026, should show CFPs closing in 2027 (they're open longer)
    const events = [
      createEvent('Conference 2027', '2027-01-15T00:00:00Z', '2027-06-20T00:00:00Z')
    ]

    const result = filterCfpEventsByYear(events, '2026')

    // Should show - CFP closes in 2027 (>= 2026)
    expect(result).toHaveLength(1)
  })

  it('should NOT show already closed CFPs', () => {
    const events = [
      createEvent('Past Conference', '2025-10-15T00:00:00Z', '2026-05-01T00:00:00Z')
    ]

    const result = filterCfpEventsByYear(events, '2026')

    // Should not show - CFP already closed in October 2025
    expect(result).toHaveLength(0)
  })
})
