import { describe, expect, it } from 'vitest'

import { createUTCDate, formatDate, getUTCDateValue, isSameUTCDate, isUTCDateInRange } from './utils.js'

describe('UTC date helpers', () => {
  it('formats UTC event timestamps without shifting the day', () => {
    const eventDate = new Date(Date.UTC(2025, 5, 11))

    expect(formatDate(eventDate)).toBe('2025-06-11')
  })

  it('matches the same UTC day across date instances', () => {
    const calendarDay = createUTCDate(2025, 5, 11)
    const eventDay = Date.UTC(2025, 5, 11)

    expect(isSameUTCDate(calendarDay, eventDay)).toBe(true)
    expect(getUTCDateValue(calendarDay)).toBe(getUTCDateValue(eventDay))
  })

  it('keeps multiday events visible on every UTC day in the range', () => {
    const selectedDay = createUTCDate(2025, 5, 11)
    const startDate = Date.UTC(2025, 5, 11)
    const endDate = Date.UTC(2025, 5, 14)

    expect(isUTCDateInRange(selectedDay, startDate, endDate)).toBe(true)
    expect(isUTCDateInRange(createUTCDate(2025, 5, 14), startDate, endDate)).toBe(true)
    expect(isUTCDateInRange(createUTCDate(2025, 5, 10), startDate, endDate)).toBe(false)
  })
})