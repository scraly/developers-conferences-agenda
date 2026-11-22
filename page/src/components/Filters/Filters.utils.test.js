import { describe, expect, it } from 'vitest'
import { getFilterParamKeys, hasActiveFilters } from './Filters.utils'

describe('hasActiveFilters', () => {
  it('returns false without selected values', () => {
    expect(hasActiveFilters({})).toBe(false)
  })

  it.each([
    'query',
    'untilDate',
    'minAttendees',
    'tags',
    'cfpStatus',
    'topic',
    'tech',
    'language',
    'country',
    'region',
    'topic_not',
    'country_not'
  ])('detects a selected value for the valid %s filter', key => {
    expect(hasActiveFilters({ [key]: 'selected' })).toBe(true)
  })

  it.each([
    'callForPapers',
    'closedCaptions',
    'scholarship',
    'sponsoring',
    'favorites',
    'recordings',
    'online',
    'inPerson'
  ])('detects only checked values for the valid %s filter', key => {
    expect(hasActiveFilters({ [key]: true })).toBe(true)
    expect(hasActiveFilters({ [key]: 'true' })).toBe(true)
    expect(hasActiveFilters({ [key]: false })).toBe(false)
    expect(hasActiveFilters({ [key]: 'false' })).toBe(false)
  })

  it('detects zero as a selected value', () => {
    expect(hasActiveFilters({ minAttendees: '0' })).toBe(true)
    expect(hasActiveFilters({ minAttendees: 0 })).toBe(true)
  })

  it('allows false as free-text query content', () => {
    expect(hasActiveFilters({ query: 'false' })).toBe(true)
  })

  it('detects multiple checked filters', () => {
    expect(hasActiveFilters({ online: 'true', inPerson: 'true' })).toBe(true)
  })

  it('ignores empty values', () => {
    expect(hasActiveFilters({
      query: '',
      tags: ',',
      favorites: null
    })).toBe(false)
  })

  it('ignores view settings, modes, and unknown or obsolete parameters', () => {
    expect(hasActiveFilters({
      sort: 'attendees',
      topic_mode: 'all',
      utm_source: 'newsletter',
      someFutureFilter: 'true',
      notOnline: 'true'
    })).toBe(false)
  })
})

describe('getFilterParamKeys', () => {
  it('preserves the existing Clear All parameter set', () => {
    const keys = getFilterParamKeys()

    expect(keys.has('query')).toBe(true)
    expect(keys.has('recordings')).toBe(true)
    expect(keys.has('topic')).toBe(true)
    expect(keys.has('topic_not')).toBe(true)
    expect(keys.has('topic_mode')).toBe(true)
    expect(keys.has('notOnline')).toBe(true)
    expect(keys.has('sort')).toBe(false)
    expect(keys.has('utm_source')).toBe(false)
  })
})
