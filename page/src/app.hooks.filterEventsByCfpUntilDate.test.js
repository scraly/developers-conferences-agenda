import { describe, it, expect, beforeEach, vi } from 'vitest'
import { filterEventsByCfpUntilDate } from './app.hooks.js'

/**
 * Tests the CFP date filtering logic that shows only CFPs that are:
 * 1. Currently open (not expired)
 * 2. Close on or before the selected date
 */

describe('filterEventsByCfpUntilDate', () => {
  let mockToday

  beforeEach(() => {
    // Mock today's date as February 20, 2025
    mockToday = new Date('2025-02-20T12:00:00Z')
    vi.setSystemTime(mockToday)
  })

  const createEvent = (name, cfpClosesDate, eventDate) => ({
    name,
    cfp: {
      untilDate: cfpClosesDate,
      until: cfpClosesDate
    },
    date: [eventDate],
    location: 'Test Location',
    country: 'ES'
  })

  it('should return all events when no filter date is provided', () => {
    const events = [
      createEvent('DevBcn 2025', '2025-02-28', '2025-07-08'),
      createEvent('Conference 2', '2025-03-15', '2025-08-01')
    ]

    const result = filterEventsByCfpUntilDate(events, null)

    expect(result).toHaveLength(2)
  })

  it('should show CFPs closing on or before the filter date', () => {
    const events = [
      createEvent('CFP on Feb 28', '2025-02-28', '2025-07-08'),
      createEvent('CFP on Feb 27', '2025-02-27', '2025-06-15'),
      createEvent('CFP on Feb 20 (today)', '2025-02-20', '2025-05-20')
    ]

    const result = filterEventsByCfpUntilDate(events, '2025-02-28')

    // Should show all 3: on date, before date, and today (with 24h buffer)
    expect(result).toHaveLength(3)
    expect(result.map(e => e.name)).toEqual([
      'CFP on Feb 28',
      'CFP on Feb 27',
      'CFP on Feb 20 (today)'
    ])
  })

  it('should hide CFP closing after the filter date', () => {
    const events = [
      createEvent('Conference Closing March 10', '2025-03-10', '2025-08-30')
    ]

    const result = filterEventsByCfpUntilDate(events, '2025-02-28')

    expect(result).toHaveLength(0)
  })

  it('should hide CFP that already closed', () => {
    const events = [
      createEvent('Past Conference', '2025-02-10', '2025-06-01')
    ]

    const result = filterEventsByCfpUntilDate(events, '2025-02-28')

    expect(result).toHaveLength(0)
  })

  it('should handle events without CFP data', () => {
    const events = [
      { name: 'No CFP Event', date: ['2025-06-01'], location: 'Test', country: 'ES' }
    ]

    const result = filterEventsByCfpUntilDate(events, '2025-03-20')

    expect(result).toHaveLength(0)
  })

  it('should handle events with missing untilDate', () => {
    const events = [
      { name: 'Invalid CFP', cfp: {}, date: ['2025-06-01'], location: 'Test', country: 'ES' }
    ]

    const result = filterEventsByCfpUntilDate(events, '2025-03-20')

    expect(result).toHaveLength(0)
  })

  it('should show CFPs closing by March 5 and hide those after', () => {
    const events = [
      createEvent('Closes Feb 28', '2025-02-28', '2025-07-08'),
      createEvent('Closes Feb 27', '2025-02-27', '2025-06-15'),
      createEvent('Closes today (Feb 20)', '2025-02-20', '2025-05-20'),
      createEvent('Closes March 20', '2025-03-20', '2025-09-13')
    ]

    const result = filterEventsByCfpUntilDate(events, '2025-03-05')

    expect(result).toHaveLength(3)
    expect(result.map(e => e.name)).toEqual([
      'Closes Feb 28',
      'Closes Feb 27',
      'Closes today (Feb 20)'
    ])
  })

  it('should correctly filter mixed set of CFPs', () => {
    const events = [
      createEvent('Open & Closes by Feb 28', '2025-02-28', '2025-07-01'),
      createEvent('Open but Closes after Feb 28', '2025-03-25', '2025-08-01'),
      createEvent('Closed before today', '2025-02-10', '2025-06-01'),
      createEvent('Open & Closes on Feb 27', '2025-02-27', '2025-07-01')
    ]

    const result = filterEventsByCfpUntilDate(events, '2025-02-28')

    expect(result).toHaveLength(2)
    expect(result.map(e => e.name)).toEqual([
      'Open & Closes by Feb 28',
      'Open & Closes on Feb 27'
    ])
  })
})
