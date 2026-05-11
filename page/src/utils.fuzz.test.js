import fc from 'fast-check'
import { describe, expect, it } from 'vitest'

import { createUTCDate, formatDate, getUTCDateValue, isSameUTCDate, isUTCDateInRange } from './utils.js'

describe('property-based fuzzing for UTC date helpers', () => {
  it('`isSameUTCDate()` is reflexive for generated UTC timestamps', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('1970-01-01T00:00:00.000Z'), max: new Date('2100-12-31T23:59:59.999Z') }),
        (date) => {
          const utcDate = createUTCDate(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate()
          )

          expect(isSameUTCDate(utcDate, utcDate)).toBe(true)
        }
      ),
      { numRuns: 500 }
    )
  })

  it('`isUTCDateInRange()` always includes the range boundaries', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1970, max: 2100 }),
        fc.integer({ min: 0, max: 11 }),
        fc.integer({ min: 1, max: 28 }),
        fc.integer({ min: 0, max: 30 }),
        (year, month, day, extraDays) => {
          const start = createUTCDate(year, month, day)
          const end = createUTCDate(year, month, Math.min(day + extraDays, 28))

          expect(isUTCDateInRange(start, start, end)).toBe(true)
          expect(isUTCDateInRange(end, start, end)).toBe(true)
        }
      ),
      { numRuns: 500 }
    )
  })

  it('`formatDate()` remains consistent with `getUTCDateValue()` for generated dates', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1970, max: 2100 }),
        fc.integer({ min: 0, max: 11 }),
        fc.integer({ min: 1, max: 28 }),
        (year, month, day) => {
          const date = createUTCDate(year, month, day)
          const formatted = formatDate(date)

          expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/)
          expect(getUTCDateValue(date)).toBe(Date.UTC(year, month, day))
        }
      ),
      { numRuns: 500 }
    )
  })
})
