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

  it('should show CFP closing on the filter date', () => {
    const events = [
      createEvent('DevBcn 2025', '2025-02-28', '2025-07-08')
    ]

    const result = filterEventsByCfpUntilDate(events, '2025-02-28')

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('DevBcn 2025')
  })

  it('should show CFP closing before the filter date', () => {
    const events = [
      createEvent('Conference on Feb 27', '2025-02-27', '2025-06-15')
    ]

    const result = filterEventsByCfpUntilDate(events, '2025-02-28')

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Conference on Feb 27')
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

  it('should filter multiple events correctly', () => {
    const events = [
      createEvent('DevBcn 2025', '2025-02-28', '2025-07-08'),
      createEvent('Conference Closing March 20', '2025-03-20', '2025-09-13'),
      createEvent('Conference on Feb 27', '2025-02-27', '2025-06-15'),
      createEvent('Past Conference', '2025-02-10', '2025-06-01')
    ]

    const result = filterEventsByCfpUntilDate(events, '2025-02-28')

    expect(result).toHaveLength(2)
    expect(result.map(e => e.name)).toEqual([
      'DevBcn 2025',
      'Conference on Feb 27'
    ])
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

  it('should show CFP closing today with 24h buffer', () => {
    const events = [
      createEvent('Conference Closing Today', '2025-02-20', '2025-05-20')
    ]

    const result = filterEventsByCfpUntilDate(events, '2025-02-28')

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Conference Closing Today')
  })

  it('should correctly apply 24-hour buffer to CFP deadline', () => {
    const events = [
      createEvent('CFP Closing Today', '2025-02-20', '2025-06-01')
    ]

    // With 24h buffer, CFP closing on Feb 20 should still be open on Feb 20
    const result = filterEventsByCfpUntilDate(events, '2025-02-20')

    expect(result).toHaveLength(1)
  })

  it('should show all CFPs closing between today and March 5', () => {
    const events = [
      createEvent('DevBcn 2025', '2025-02-28', '2025-07-08'),
      createEvent('Conference on Feb 27', '2025-02-27', '2025-06-15'),
      createEvent('Conference Closing Today', '2025-02-20', '2025-05-20')
    ]

    const result = filterEventsByCfpUntilDate(events, '2025-03-05')

    expect(result).toHaveLength(3)
  })

  it('should hide CFP closing after March 5', () => {
    const events = [
      createEvent('Conference Closing March 20', '2025-03-20', '2025-09-13')
    ]

    const result = filterEventsByCfpUntilDate(events, '2025-03-05')

    expect(result).toHaveLength(0)
  })

  it('should show all currently open CFPs closing by April 30', () => {
    const events = [
      createEvent('DevBcn 2025', '2025-02-28', '2025-07-08'),
      createEvent('Conference Closing March 20', '2025-03-20', '2025-09-13'),
      createEvent('Conference on Feb 27', '2025-02-27', '2025-06-15'),
      createEvent('Conference Closing March 25', '2025-03-25', '2025-08-30')
    ]

    const result = filterEventsByCfpUntilDate(events, '2025-04-30')

    expect(result).toHaveLength(4)
    expect(result.map(e => e.name)).toEqual([
      'DevBcn 2025',
      'Conference Closing March 20',
      'Conference on Feb 27',
      'Conference Closing March 25'
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
