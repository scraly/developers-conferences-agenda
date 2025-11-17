import { describe, it, expect } from 'vitest'
import { applyCommonFilters } from './app.hooks.js'

/**
 * Tests the common search filter logic that applies to both
 * useYearEvents and useCfpEvents hooks.
 */

describe('applyCommonFilters', () => {
  const createEvent = (overrides = {}) => ({
    name: 'Test Conference',
    hyperlink: 'https://example.com',
    location: 'Barcelona',
    country: 'ES',
    date: ['2025-07-08'],
    closedCaptions: false,
    scholarship: false,
    sponsoring: false,
    tags: [],
    ...overrides
  })

  const mockRegionsMap = {
    'ES': 'Europe',
    'US': 'North America',
    'JP': 'Asia'
  }

  describe('closedCaptions filter', () => {
    it('should filter events with closed captions when enabled', () => {
      const events = [
        createEvent({ name: 'With CC', closedCaptions: true }),
        createEvent({ name: 'Without CC', closedCaptions: false })
      ]

      const result = applyCommonFilters(events, { closedCaptions: 'true' }, mockRegionsMap)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('With CC')
    })

    it('should show all events when filter is disabled', () => {
      const events = [
        createEvent({ name: 'With CC', closedCaptions: true }),
        createEvent({ name: 'Without CC', closedCaptions: false })
      ]

      const result = applyCommonFilters(events, {}, mockRegionsMap)

      expect(result).toHaveLength(2)
    })
  })

  describe('scholarship filter', () => {
    it('should filter events with scholarships when enabled', () => {
      const events = [
        createEvent({ name: 'With Scholarship', scholarship: true }),
        createEvent({ name: 'Without Scholarship', scholarship: false })
      ]

      const result = applyCommonFilters(events, { scholarship: 'true' }, mockRegionsMap)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('With Scholarship')
    })
  })

  describe('online filter', () => {
    it('should filter online events when enabled', () => {
      const events = [
        createEvent({ name: 'Online Event', location: 'Online' }),
        createEvent({ name: 'In-Person Event', location: 'Barcelona' })
      ]

      const result = applyCommonFilters(events, { online: 'true' }, mockRegionsMap)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Online Event')
    })

    it('should match partial "Online" in location', () => {
      const events = [
        createEvent({ name: 'Hybrid', location: 'Barcelona & Online' }),
        createEvent({ name: 'In-Person', location: 'Madrid' })
      ]

      const result = applyCommonFilters(events, { online: 'true' }, mockRegionsMap)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Hybrid')
    })
  })

  describe('country filter', () => {
    it('should filter by country', () => {
      const events = [
        createEvent({ name: 'Spanish Event', country: 'ES' }),
        createEvent({ name: 'US Event', country: 'US' }),
        createEvent({ name: 'Japanese Event', country: 'JP' })
      ]

      const result = applyCommonFilters(events, { country: 'ES' }, mockRegionsMap)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Spanish Event')
    })
  })

  describe('region filter', () => {
    it('should filter by region using regionsMap', () => {
      const events = [
        createEvent({ name: 'Spanish Event', country: 'ES' }),
        createEvent({ name: 'US Event', country: 'US' }),
        createEvent({ name: 'Japanese Event', country: 'JP' })
      ]

      const result = applyCommonFilters(events, { region: 'Europe' }, mockRegionsMap)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Spanish Event')
    })

    it('should filter multiple countries in same region', () => {
      const regionsMap = {
        'ES': 'Europe',
        'FR': 'Europe',
        'US': 'North America'
      }

      const events = [
        createEvent({ name: 'Spanish Event', country: 'ES' }),
        createEvent({ name: 'French Event', country: 'FR' }),
        createEvent({ name: 'US Event', country: 'US' })
      ]

      const result = applyCommonFilters(events, { region: 'Europe' }, regionsMap)

      expect(result).toHaveLength(2)
      expect(result.map(e => e.name)).toEqual(['Spanish Event', 'French Event'])
    })
  })

  describe('query (text search) filter', () => {
    it('should search in name, hyperlink, and location (case-insensitive)', () => {
      const events = [
        createEvent({ name: 'DevBcn 2025', hyperlink: 'https://example.com', location: 'Madrid' }),
        createEvent({ name: 'ReactConf 2025', hyperlink: 'https://reactconf.com', location: 'Paris' }),
        createEvent({ name: 'PyConES', hyperlink: 'https://pycones.es', location: 'Barcelona' })
      ]

      // Search in name (case-insensitive)
      const resultName = applyCommonFilters(events, { query: 'devbcn' }, mockRegionsMap)
      expect(resultName).toHaveLength(1)
      expect(resultName[0].name).toBe('DevBcn 2025')

      // Search in hyperlink
      const resultLink = applyCommonFilters(events, { query: 'reactconf' }, mockRegionsMap)
      expect(resultLink).toHaveLength(1)
      expect(resultLink[0].name).toBe('ReactConf 2025')

      // Search in location
      const resultLocation = applyCommonFilters(events, { query: 'barcelona' }, mockRegionsMap)
      expect(resultLocation).toHaveLength(1)
      expect(resultLocation[0].name).toBe('PyConES')
    })
  })

  describe('sponsoring filter', () => {
    it('should filter events with sponsoring opportunities', () => {
      const events = [
        createEvent({ name: 'With Sponsoring', sponsoring: true }),
        createEvent({ name: 'Without Sponsoring', sponsoring: false })
      ]

      const result = applyCommonFilters(events, { sponsoring: 'true' }, mockRegionsMap)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('With Sponsoring')
    })
  })

  describe('tags filter (multiselect)', () => {
    it('should filter by single tag', () => {
      const events = [
        createEvent({
          name: 'JavaScript Event',
          tags: [{ key: 'tech', value: 'JavaScript' }]
        }),
        createEvent({
          name: 'Python Event',
          tags: [{ key: 'tech', value: 'Python' }]
        })
      ]

      const result = applyCommonFilters(events, { tags: ['tech:JavaScript'] }, mockRegionsMap)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('JavaScript Event')
    })

    it('should filter by multiple tags (AND logic)', () => {
      const events = [
        createEvent({
          name: 'JS Frontend Event',
          tags: [
            { key: 'tech', value: 'JavaScript' },
            { key: 'topic', value: 'Frontend' }
          ]
        }),
        createEvent({
          name: 'JS Backend Event',
          tags: [
            { key: 'tech', value: 'JavaScript' },
            { key: 'topic', value: 'Backend' }
          ]
        }),
        createEvent({
          name: 'Python Event',
          tags: [{ key: 'tech', value: 'Python' }]
        })
      ]

      const result = applyCommonFilters(events, {
        tags: ['tech:JavaScript', 'topic:Frontend']
      }, mockRegionsMap)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('JS Frontend Event')
    })

    it('should handle tags as comma-separated string', () => {
      const events = [
        createEvent({
          name: 'JavaScript Event',
          tags: [{ key: 'tech', value: 'JavaScript' }]
        })
      ]

      const result = applyCommonFilters(events, { tags: 'tech:JavaScript' }, mockRegionsMap)

      expect(result).toHaveLength(1)
    })

    it('should handle events without tags', () => {
      const events = [
        createEvent({ name: 'No Tags', tags: [] }),
        createEvent({ name: 'With Tags', tags: [{ key: 'tech', value: 'JavaScript' }] })
      ]

      const result = applyCommonFilters(events, { tags: ['tech:JavaScript'] }, mockRegionsMap)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('With Tags')
    })
  })

  describe('individual tag filters (legacy)', () => {
    it('should filter by tech tag', () => {
      const events = [
        createEvent({
          name: 'JS Event',
          tags: [{ key: 'tech', value: 'JavaScript' }]
        }),
        createEvent({
          name: 'Python Event',
          tags: [{ key: 'tech', value: 'Python' }]
        })
      ]

      const result = applyCommonFilters(events, { tech: 'JavaScript' }, mockRegionsMap)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('JS Event')
    })

    it('should filter by topic tag', () => {
      const events = [
        createEvent({
          name: 'Frontend Event',
          tags: [{ key: 'topic', value: 'Frontend' }]
        }),
        createEvent({
          name: 'Backend Event',
          tags: [{ key: 'topic', value: 'Backend' }]
        })
      ]

      const result = applyCommonFilters(events, { topic: 'Frontend' }, mockRegionsMap)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Frontend Event')
    })
  })

  describe('combined filters', () => {
    it('should apply multiple filters together', () => {
      const events = [
        createEvent({
          name: 'DevBcn 2025',
          country: 'ES',
          closedCaptions: true,
          scholarship: true,
          tags: [{ key: 'tech', value: 'JavaScript' }]
        }),
        createEvent({
          name: 'Other Event',
          country: 'ES',
          closedCaptions: false,
          scholarship: true,
          tags: [{ key: 'tech', value: 'Python' }]
        }),
        createEvent({
          name: 'US Event',
          country: 'US',
          closedCaptions: true,
          scholarship: true,
          tags: [{ key: 'tech', value: 'JavaScript' }]
        })
      ]

      const result = applyCommonFilters(events, {
        country: 'ES',
        closedCaptions: 'true',
        scholarship: 'true'
      }, mockRegionsMap)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('DevBcn 2025')
    })

    it('should return all events when no filters applied', () => {
      const events = [
        createEvent({ name: 'Event 1' }),
        createEvent({ name: 'Event 2' }),
        createEvent({ name: 'Event 3' })
      ]

      const result = applyCommonFilters(events, {}, mockRegionsMap)

      expect(result).toHaveLength(3)
    })
  })
})
