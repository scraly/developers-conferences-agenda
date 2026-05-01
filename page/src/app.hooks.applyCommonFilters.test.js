import { describe, it, expect } from 'vitest'
import { applyCommonFilters, parseDimensionParams, TAG_FILTER_CONFIG } from './app.hooks.js'

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

  // T006: Multi-value tag filtering (topic, tech, language, type with OR logic)
  describe('per-dimension multi-value tag filtering', () => {
    const tagEvents = [
      createEvent({
        name: 'Frontend JS Conf',
        tags: [
          { key: 'topic', value: 'Frontend' },
          { key: 'tech', value: 'JavaScript' },
          { key: 'type', value: 'Conference' },
          { key: 'language', value: 'English' }
        ]
      }),
      createEvent({
        name: 'DevOps Python Summit',
        tags: [
          { key: 'topic', value: 'DevOps' },
          { key: 'tech', value: 'Python' },
          { key: 'type', value: 'Conference' },
          { key: 'language', value: 'English' }
        ]
      }),
      createEvent({
        name: 'Full Stack Conf',
        tags: [
          { key: 'topic', value: 'Frontend' },
          { key: 'topic', value: 'DevOps' },
          { key: 'tech', value: 'JavaScript' },
          { key: 'type', value: 'Meetup' }
        ]
      }),
      createEvent({
        name: 'PHP World',
        tags: [
          { key: 'tech', value: 'PHP' },
          { key: 'topic', value: 'Backend' },
          { key: 'type', value: 'Conference' }
        ]
      }),
      createEvent({ name: 'Untagged Event', tags: [] })
    ]

    it('should filter by single topic value (TS-001)', () => {
      const result = applyCommonFilters(tagEvents, { topic: 'Frontend' }, mockRegionsMap)

      expect(result).toHaveLength(2)
      expect(result.map(e => e.name)).toContain('Frontend JS Conf')
      expect(result.map(e => e.name)).toContain('Full Stack Conf')
    })

    it('should filter by multiple topic values with OR logic (TS-001)', () => {
      const result = applyCommonFilters(tagEvents, { topic: 'Frontend,DevOps' }, mockRegionsMap)

      expect(result).toHaveLength(3)
      expect(result.map(e => e.name)).toContain('Frontend JS Conf')
      expect(result.map(e => e.name)).toContain('DevOps Python Summit')
      expect(result.map(e => e.name)).toContain('Full Stack Conf')
    })

    it('should filter by multiple tech values with OR logic (TS-002)', () => {
      const result = applyCommonFilters(tagEvents, { tech: 'JavaScript,TypeScript' }, mockRegionsMap)

      expect(result).toHaveLength(2)
      expect(result.map(e => e.name)).toContain('Frontend JS Conf')
      expect(result.map(e => e.name)).toContain('Full Stack Conf')
    })

    it('should filter by multiple language values with OR logic (TS-003)', () => {
      const result = applyCommonFilters(tagEvents, { language: 'English' }, mockRegionsMap)

      expect(result).toHaveLength(2)
      expect(result.map(e => e.name)).toContain('Frontend JS Conf')
      expect(result.map(e => e.name)).toContain('DevOps Python Summit')
    })

    it('should not filter by type dimension (not in current data)', () => {
      // type is not in TAG_FILTER_CONFIG.allowed — filter is a no-op
      const result = applyCommonFilters(tagEvents, { type: 'Conference,Meetup' }, mockRegionsMap)

      expect(result).toHaveLength(5) // all events returned, filter ignored
    })

    it('should exclude events without tags when dimension filter is active', () => {
      const result = applyCommonFilters(tagEvents, { topic: 'Frontend' }, mockRegionsMap)

      expect(result.map(e => e.name)).not.toContain('Untagged Event')
    })
  })

  // T007: Multi-value country and region filtering
  describe('per-dimension multi-value country and region filtering', () => {
    const geoEvents = [
      createEvent({ name: 'Spanish Event', country: 'ES' }),
      createEvent({ name: 'French Event', country: 'FR' }),
      createEvent({ name: 'German Event', country: 'DE' }),
      createEvent({ name: 'US Event', country: 'US' }),
      createEvent({ name: 'Japan Event', country: 'JP' })
    ]

    const fullRegionsMap = {
      'ES': 'Europe',
      'FR': 'Europe',
      'DE': 'Europe',
      'US': 'North America',
      'CA': 'North America',
      'JP': 'Asia',
      'CN': 'Asia'
    }

    it('should filter by multiple countries with OR logic (TS-004)', () => {
      const result = applyCommonFilters(geoEvents, { country: 'FR,DE' }, fullRegionsMap)

      expect(result).toHaveLength(2)
      expect(result.map(e => e.name)).toContain('French Event')
      expect(result.map(e => e.name)).toContain('German Event')
    })

    it('should filter by multiple regions with OR logic (TS-005)', () => {
      const result = applyCommonFilters(geoEvents, { region: 'Europe,Asia' }, fullRegionsMap)

      expect(result).toHaveLength(4)
      expect(result.map(e => e.name)).toContain('Spanish Event')
      expect(result.map(e => e.name)).toContain('French Event')
      expect(result.map(e => e.name)).toContain('German Event')
      expect(result.map(e => e.name)).toContain('Japan Event')
    })

    it('should filter by single country (backward compat)', () => {
      const result = applyCommonFilters(geoEvents, { country: 'ES' }, fullRegionsMap)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Spanish Event')
    })

    it('should filter by single region (backward compat)', () => {
      const result = applyCommonFilters(geoEvents, { region: 'Europe' }, fullRegionsMap)

      expect(result).toHaveLength(3)
    })
  })

  // T008: Cross-filter AND logic and empty-filter defaults
  describe('cross-filter AND logic and empty-filter defaults', () => {
    const crossEvents = [
      createEvent({
        name: 'Frontend in France',
        country: 'FR',
        tags: [{ key: 'topic', value: 'Frontend' }]
      }),
      createEvent({
        name: 'Frontend in US',
        country: 'US',
        tags: [{ key: 'topic', value: 'Frontend' }]
      }),
      createEvent({
        name: 'DevOps in France',
        country: 'FR',
        tags: [{ key: 'topic', value: 'DevOps' }]
      }),
      createEvent({
        name: 'Unfiltered',
        country: 'JP',
        tags: []
      })
    ]

    const crossRegionsMap = {
      'FR': 'Europe',
      'US': 'North America',
      'JP': 'Asia'
    }

    it('should AND across different filter dimensions (TS-008)', () => {
      const result = applyCommonFilters(crossEvents, {
        topic: 'Frontend',
        country: 'FR'
      }, crossRegionsMap)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Frontend in France')
    })

    it('should show all events when no filters applied (TS-009)', () => {
      const result = applyCommonFilters(crossEvents, {}, crossRegionsMap)

      expect(result).toHaveLength(4)
    })

    it('should return empty when filters exclude everything', () => {
      const result = applyCommonFilters(crossEvents, {
        topic: 'NonExistent'
      }, crossRegionsMap)

      expect(result).toHaveLength(0)
    })
  })

  // T009: Region-to-country cascading, deselect behavior, and trim
  describe('region cascading and trim behavior', () => {
    it('should trim country selections to available countries when region changes (TS-033)', () => {
      // This tests the parseDimensionParams + cascading logic
      const dims = parseDimensionParams(
        { region: 'Europe', country: 'FR,JP' },
        ['region', 'country']
      )

      expect(dims.region.included).toEqual(['Europe'])
      expect(dims.country.included).toEqual(['FR', 'JP'])
      // Trimming is handled by the UI hook (useAvailableCountries), not by applyCommonFilters
      // applyCommonFilters will simply not match JP with Europe region
    })

    it('should filter events by region and country together (TS-006, TS-007)', () => {
      const events = [
        createEvent({ name: 'French Event', country: 'FR' }),
        createEvent({ name: 'German Event', country: 'DE' }),
        createEvent({ name: 'US Event', country: 'US' })
      ]
      const regMap = { 'FR': 'Europe', 'DE': 'Europe', 'US': 'North America' }

      // Region=Europe narrows, then country=FR further narrows
      const result = applyCommonFilters(events, {
        region: 'Europe',
        country: 'FR'
      }, regMap)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('French Event')
    })

    it('should show all countries when no region filter is set (TS-010)', () => {
      const events = [
        createEvent({ name: 'French Event', country: 'FR' }),
        createEvent({ name: 'US Event', country: 'US' })
      ]
      const regMap = { 'FR': 'Europe', 'US': 'North America' }

      const result = applyCommonFilters(events, {}, regMap)

      expect(result).toHaveLength(2)
    })
  })

  describe('legacy tags param migration', () => {
    it('should parse legacy tags=key:value and filter by tech dimension', () => {
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

      const result = applyCommonFilters(events, { tags: 'tech:JavaScript' }, mockRegionsMap)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('JS Event')
    })

    it('should parse legacy tags with multiple key:value pairs and distribute to dimensions', () => {
      const events = [
        createEvent({
          name: 'JS Frontend',
          tags: [
            { key: 'tech', value: 'JavaScript' },
            { key: 'topic', value: 'Frontend' }
          ]
        }),
        createEvent({
          name: 'JS Backend',
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

      // Legacy format: tags=tech:JavaScript,topic:Frontend (AND logic)
      const result = applyCommonFilters(events, {
        tags: 'tech:JavaScript,topic:Frontend'
      }, mockRegionsMap)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('JS Frontend')
    })

    it('should handle legacy tags as array format', () => {
      const events = [
        createEvent({
          name: 'JS Event',
          tags: [{ key: 'tech', value: 'JavaScript' }]
        })
      ]

      const result = applyCommonFilters(events, {
        tags: ['tech:JavaScript']
      }, mockRegionsMap)

      expect(result).toHaveLength(1)
    })
  })

  // T019: Exclusion logic tests
  describe('per-dimension exclusion filtering', () => {
    const exclEvents = [
      createEvent({
        name: 'Frontend JS',
        country: 'FR',
        tags: [
          { key: 'topic', value: 'Frontend' },
          { key: 'tech', value: 'JavaScript' }
        ]
      }),
      createEvent({
        name: 'PHP World',
        country: 'DE',
        tags: [
          { key: 'tech', value: 'PHP' },
          { key: 'topic', value: 'Backend' }
        ]
      }),
      createEvent({
        name: 'Python DevOps',
        country: 'FR',
        tags: [
          { key: 'tech', value: 'Python' },
          { key: 'topic', value: 'DevOps' }
        ]
      }),
      createEvent({
        name: 'German JS',
        country: 'DE',
        tags: [
          { key: 'tech', value: 'JavaScript' },
          { key: 'topic', value: 'Frontend' }
        ]
      })
    ]

    const exclRegionsMap = { 'FR': 'Europe', 'DE': 'Europe', 'US': 'North America' }

    it('should exclude events matching tech_not value (TS-012)', () => {
      const result = applyCommonFilters(exclEvents, { tech_not: 'PHP' }, exclRegionsMap)

      expect(result).toHaveLength(3)
      expect(result.map(e => e.name)).not.toContain('PHP World')
    })

    it('should combine include and exclude correctly (TS-013)', () => {
      const result = applyCommonFilters(exclEvents, {
        topic: 'Frontend',
        tech_not: 'PHP'
      }, exclRegionsMap)

      expect(result).toHaveLength(2)
      expect(result.map(e => e.name)).toContain('Frontend JS')
      expect(result.map(e => e.name)).toContain('German JS')
    })

    it('should handle multi-exclusion across dimensions (TS-014)', () => {
      const result = applyCommonFilters(exclEvents, {
        tech_not: 'PHP',
        country_not: 'DE'
      }, exclRegionsMap)

      expect(result).toHaveLength(2)
      expect(result.map(e => e.name)).toContain('Frontend JS')
      expect(result.map(e => e.name)).toContain('Python DevOps')
    })

    it('should exclude country (TS-015)', () => {
      const result = applyCommonFilters(exclEvents, {
        country_not: 'DE'
      }, exclRegionsMap)

      expect(result).toHaveLength(2)
      expect(result.map(e => e.name)).not.toContain('PHP World')
      expect(result.map(e => e.name)).not.toContain('German JS')
    })

    it('should handle same value in include and exclude — exclude wins (TS-029)', () => {
      // Include Frontend AND exclude Frontend in tech — event should be excluded
      const result = applyCommonFilters(exclEvents, {
        tech: 'JavaScript',
        tech_not: 'JavaScript'
      }, exclRegionsMap)

      expect(result).toHaveLength(0)
    })

    it('should handle multiple exclusion values in one dimension', () => {
      const result = applyCommonFilters(exclEvents, {
        tech_not: 'PHP,Python'
      }, exclRegionsMap)

      expect(result).toHaveLength(2)
      expect(result.map(e => e.name)).toContain('Frontend JS')
      expect(result.map(e => e.name)).toContain('German JS')
    })
  })

  // T025: Online / In Person filter tests
  describe('online and inPerson filters', () => {
    const onlineEvents = [
      createEvent({ name: 'Online Only', location: 'Online', country: 'Online' }),
      createEvent({ name: 'Hybrid', location: 'Barcelona & Online', country: 'ES' }),
      createEvent({ name: 'In-Person', location: 'Paris', country: 'FR' })
    ]

    const onlineRegionsMap = { 'ES': 'Europe', 'FR': 'Europe' }

    it('should show only online/hybrid events when only online checked', () => {
      const result = applyCommonFilters(onlineEvents, { online: 'true' }, onlineRegionsMap)

      expect(result).toHaveLength(2)
      expect(result.map(e => e.name)).toContain('Online Only')
      expect(result.map(e => e.name)).toContain('Hybrid')
    })

    it('should hide pure-online events when only inPerson checked (TS-017)', () => {
      const result = applyCommonFilters(onlineEvents, { inPerson: 'true' }, onlineRegionsMap)

      expect(result).toHaveLength(2)
      expect(result.map(e => e.name)).not.toContain('Online Only')
    })

    it('should keep hybrid events visible with inPerson (TS-018)', () => {
      const result = applyCommonFilters(onlineEvents, { inPerson: 'true' }, onlineRegionsMap)

      expect(result.map(e => e.name)).toContain('Hybrid')
    })

    it('should show all events when both online and inPerson checked', () => {
      const result = applyCommonFilters(onlineEvents, { online: 'true', inPerson: 'true' }, onlineRegionsMap)

      expect(result).toHaveLength(3)
    })

    it('should show all events when neither checked (TS-019)', () => {
      const result = applyCommonFilters(onlineEvents, {}, onlineRegionsMap)

      expect(result).toHaveLength(3)
    })
  })

  // T030: Any/All mode tests
  describe('any/all mode filtering', () => {
    const modeEvents = [
      createEvent({
        name: 'Frontend Only',
        tags: [{ key: 'topic', value: 'Frontend' }]
      }),
      createEvent({
        name: 'DevOps Only',
        tags: [{ key: 'topic', value: 'DevOps' }]
      }),
      createEvent({
        name: 'Both',
        tags: [
          { key: 'topic', value: 'Frontend' },
          { key: 'topic', value: 'DevOps' }
        ]
      })
    ]

    it('should use OR logic in any mode (default) (TS-021)', () => {
      const result = applyCommonFilters(modeEvents, {
        topic: 'Frontend,DevOps'
      }, mockRegionsMap)

      expect(result).toHaveLength(3)
    })

    it('should use AND logic in all mode (TS-022)', () => {
      const result = applyCommonFilters(modeEvents, {
        topic: 'Frontend,DevOps',
        topic_mode: 'all'
      }, mockRegionsMap)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Both')
    })

    it('should handle single value in all mode same as any (TS-030)', () => {
      const resultAny = applyCommonFilters(modeEvents, {
        topic: 'Frontend'
      }, mockRegionsMap)
      const resultAll = applyCommonFilters(modeEvents, {
        topic: 'Frontend',
        topic_mode: 'all'
      }, mockRegionsMap)

      expect(resultAny).toHaveLength(resultAll.length)
    })

    it('should apply mode independently per dimension (TS-025)', () => {
      const events = [
        createEvent({
          name: 'Europe Event',
          country: 'FR',
          tags: [{ key: 'topic', value: 'Frontend' }, { key: 'topic', value: 'DevOps' }]
        }),
        createEvent({
          name: 'Asia Event',
          country: 'JP',
          tags: [{ key: 'topic', value: 'Frontend' }]
        })
      ]
      const regMap = { 'FR': 'Europe', 'JP': 'Asia' }

      // Topic in ALL mode + region in ANY mode
      const result = applyCommonFilters(events, {
        topic: 'Frontend,DevOps',
        topic_mode: 'all',
        region: 'Europe,Asia'
      }, regMap)

      // Only Europe Event has both Frontend AND DevOps
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Europe Event')
    })

    it('should default to any mode (TS-036)', () => {
      const result = applyCommonFilters(modeEvents, {
        topic: 'Frontend,DevOps'
        // no topic_mode specified
      }, mockRegionsMap)

      // any mode = OR = all 3 events
      expect(result).toHaveLength(3)
    })
  })

  // T041: Performance assertion (SC-008)
  describe('performance', () => {
    it('should filter 500 events within 100ms (SC-008)', () => {
      const largeEventSet = Array.from({ length: 500 }, (_, i) => {
        const topics = ['Frontend', 'Backend', 'DevOps', 'Mobile', 'Data']
        const techs = ['JavaScript', 'Python', 'Java', 'Go', 'Rust']
        const countries = ['ES', 'FR', 'DE', 'US', 'JP']
        return createEvent({
          name: `Event ${i}`,
          country: countries[i % countries.length],
          tags: [
            { key: 'topic', value: topics[i % topics.length] },
            { key: 'tech', value: techs[i % techs.length] },
            { key: 'type', value: i % 2 === 0 ? 'Conference' : 'Meetup' }
          ]
        })
      })

      const regMap = { 'ES': 'Europe', 'FR': 'Europe', 'DE': 'Europe', 'US': 'North America', 'JP': 'Asia' }

      const start = performance.now()
      applyCommonFilters(largeEventSet, {
        topic: 'Frontend,DevOps',
        tech_not: 'Java',
        country: 'ES,FR',
        region: 'Europe',
        topic_mode: 'any'
      }, regMap)
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(100)
    })
  })
})
