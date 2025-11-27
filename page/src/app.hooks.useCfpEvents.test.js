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

    // Does NOT show - CFP closes in 2025, not in 2026
    expect(result).toHaveLength(0)
  })

  it('should show CFPs closing in the selected year (2026), sorted by deadline', () => {
    const events = [
      createEvent('Conference Nov 2026', '2026-11-15T00:00:00Z', '2026-11-20T00:00:00Z'),
      createEvent('Conference Jan 2026', '2026-01-31T00:00:00Z', '2026-06-15T00:00:00Z')
    ]

    const result = filterCfpEventsByYear(events, '2026')

    // Both should show - CFPs close in 2026, sorted by deadline (earliest first)
    expect(result).toHaveLength(2)
    expect(result.map(e => e.name)).toEqual([
      'Conference Jan 2026',
      'Conference Nov 2026'
    ])
  })

  it('should NOT show CFPs closing after the selected year (2027 when viewing 2026)', () => {
    // When viewing 2026, should NOT show CFPs closing in 2027
    // Only show CFPs closing in the selected year (2026)
    const events = [
      createEvent('Conference 2027', '2027-01-15T00:00:00Z', '2027-06-20T00:00:00Z')
    ]

    const result = filterCfpEventsByYear(events, '2026')

    // Should NOT show - CFP closes in 2027, not in 2026
    expect(result).toHaveLength(0)
  })

  it('should NOT show already closed CFPs', () => {
    const events = [
      createEvent('Past Conference', '2025-10-15T00:00:00Z', '2026-05-01T00:00:00Z')
    ]

    const result = filterCfpEventsByYear(events, '2026')

    // Should not show - CFP already closed in October 2025
    expect(result).toHaveLength(0)
  })

  it('should show conferences in future years if CFP closes in selected year', () => {
    // When viewing CFP for 2025, should show conferences happening in 2026
    // if their CFP closes in 2025 (CFP filtered by when it closes, not when event happens)
    const events = [
      createEvent('Conference (CFP Dec 2025)', '2025-12-31T00:00:00Z', '2026-06-20T00:00:00Z'),  // Show - CFP in 2025, still open
      createEvent('Conference (CFP Nov 20, 2025)', '2025-11-20T00:00:00Z', '2026-03-15T00:00:00Z'),  // Show - CFP in 2025, still open
      createEvent('Conference (CFP Jan 2026)', '2026-01-15T00:00:00Z', '2026-06-20T00:00:00Z'),      // Don't show - CFP in 2026
      createEvent('Conference (CFP Oct 2025)', '2025-10-15T00:00:00Z', '2026-02-20T00:00:00Z'),      // Don't show - expired
      createEvent('Conference (CFP Dec 2024)', '2024-12-31T00:00:00Z', '2025-05-01T00:00:00Z')       // Don't show - CFP in 2024
    ]

    const result = filterCfpEventsByYear(events, '2025')

    // Should show 2 conferences with CFPs closing in 2025 (both open and in correct year)
    expect(result).toHaveLength(2)
    expect(result.map(e => e.name)).toEqual([
      'Conference (CFP Nov 20, 2025)',
      'Conference (CFP Dec 2025)'
    ])
  })

  it('should handle edge cases - events without CFP data', () => {
    // Corner case: Events without CFP data should not appear in CFP view
    const events = [
      { name: 'No CFP Event', date: ['2026-06-01'], location: 'Test', country: 'ES' },
      createEvent('Valid CFP', '2025-12-15T00:00:00Z', '2026-03-01T00:00:00Z')
    ]

    const result = filterCfpEventsByYear(events, '2025')

    // Should only show the valid CFP event
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Valid CFP')
  })

  it('should handle edge cases - events with missing untilDate', () => {
    // Corner case: Events with empty CFP object (missing untilDate)
    const events = [
      { name: 'Invalid CFP', cfp: {}, date: ['2026-06-01'], location: 'Test', country: 'ES' },
      createEvent('Valid CFP', '2025-11-25T00:00:00Z', '2026-03-01T00:00:00Z')
    ]

    const result = filterCfpEventsByYear(events, '2025')

    // Should only show the valid CFP event
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Valid CFP')
  })
})
