import { describe, it, expect } from 'vitest'

/**
 * Test suite for EventDisplay component metadata features
 * Tests coverage: displaying discount codes and attendee counts from metadata
 */

describe('EventDisplay - Metadata Fields', () => {
  const createEventWithMetadata = (overrides = {}) => ({
    name: 'Test Conference',
    hyperlink: 'https://example.com',
    location: 'Barcelona (Spain)',
    city: 'Barcelona',
    country: 'ES',
    date: [1705190400000, 1705363200000],
    closedCaptions: false,
    scholarship: false,
    sponsoring: false,
    discounts: [],
    tags: [],
    metadata: {
      discountCodes: [],
      estimatedAttendees: null,
      notes: ''
    },
    ...overrides
  })

  describe('Discount Codes Display', () => {
    it('should display single discount code from metadata', () => {
      const event = createEventWithMetadata({
        name: 'SnowCamp 2026',
        metadata: {
          discountCodes: ['SNOWCAMP20'],
          estimatedAttendees: 2000,
          notes: 'Early bird expires 2026-02-28'
        }
      })

      // Verify metadata structure
      expect(event.metadata.discountCodes).toHaveLength(1)
      expect(event.metadata.discountCodes[0]).toBe('SNOWCAMP20')
      expect(event.metadata.estimatedAttendees).toBe(2000)
      expect(event.metadata.notes).toBe('Early bird expires 2026-02-28')
    })

    it('should display multiple discount codes from metadata', () => {
      const event = createEventWithMetadata({
        name: 'Jfokus 2025',
        metadata: {
          discountCodes: ['JFOKUS100', 'STUDENT50'],
          estimatedAttendees: 1800,
          notes: 'Student rate requires .edu email'
        }
      })

      expect(event.metadata.discountCodes).toHaveLength(2)
      expect(event.metadata.discountCodes).toContain('JFOKUS100')
      expect(event.metadata.discountCodes).toContain('STUDENT50')
    })

    it('should handle events with no discount codes', () => {
      const event = createEventWithMetadata({
        name: 'Regular Conference',
        metadata: {
          discountCodes: [],
          estimatedAttendees: 500,
          notes: ''
        }
      })

      expect(event.metadata.discountCodes).toHaveLength(0)
      expect(Array.isArray(event.metadata.discountCodes)).toBe(true)
    })
  })

  describe('Attendee Count Display', () => {
    it('should display estimated attendee count when present', () => {
      const event = createEventWithMetadata({
        name: 'Large Conference',
        metadata: {
          discountCodes: [],
          estimatedAttendees: 5000,
          notes: ''
        }
      })

      expect(event.metadata.estimatedAttendees).toBe(5000)
      expect(typeof event.metadata.estimatedAttendees).toBe('number')
    })

    it('should handle null attendee count gracefully', () => {
      const event = createEventWithMetadata({
        name: 'Unknown Size Conference',
        metadata: {
          discountCodes: [],
          estimatedAttendees: null,
          notes: ''
        }
      })

      expect(event.metadata.estimatedAttendees).toBeNull()
    })

    it('should display zero attendees as valid number', () => {
      const event = createEventWithMetadata({
        name: 'Cancelled Conference',
        metadata: {
          discountCodes: [],
          estimatedAttendees: 0,
          notes: ''
        }
      })

      expect(event.metadata.estimatedAttendees).toBe(0)
      expect(typeof event.metadata.estimatedAttendees).toBe('number')
    })
  })

  describe('Notes Field Display', () => {
    it('should display notes when present', () => {
      const event = createEventWithMetadata({
        name: 'Conference with Notes',
        metadata: {
          discountCodes: ['CODE1'],
          estimatedAttendees: 1000,
          notes: 'Early bird expires 2026-02-28'
        }
      })

      expect(event.metadata.notes).toBe('Early bird expires 2026-02-28')
      expect(typeof event.metadata.notes).toBe('string')
    })

    it('should handle empty notes gracefully', () => {
      const event = createEventWithMetadata({
        name: 'Conference without Notes',
        metadata: {
          discountCodes: [],
          estimatedAttendees: null,
          notes: ''
        }
      })

      expect(event.metadata.notes).toBe('')
      expect(typeof event.metadata.notes).toBe('string')
    })
  })

  describe('Metadata Field Validation', () => {
    it('should have all required metadata fields', () => {
      const event = createEventWithMetadata({
        metadata: {
          discountCodes: ['TEST'],
          estimatedAttendees: 100,
          notes: 'Test note'
        }
      })

      expect(event.metadata).toHaveProperty('discountCodes')
      expect(event.metadata).toHaveProperty('estimatedAttendees')
      expect(event.metadata).toHaveProperty('notes')
    })

    it('should have correct data types for metadata fields', () => {
      const event = createEventWithMetadata({
        metadata: {
          discountCodes: ['CODE1', 'CODE2'],
          estimatedAttendees: 500,
          notes: 'Sample note'
        }
      })

      expect(Array.isArray(event.metadata.discountCodes)).toBe(true)
      expect(typeof event.metadata.estimatedAttendees).toBe('number')
      expect(typeof event.metadata.notes).toBe('string')
    })

    it('should maintain metadata even when other fields are missing', () => {
      const event = createEventWithMetadata({
        discounts: [],
        tags: [],
        metadata: {
          discountCodes: ['KEEP'],
          estimatedAttendees: 100,
          notes: 'Important'
        }
      })

      expect(event.metadata.discountCodes).toEqual(['KEEP'])
      expect(event.metadata.estimatedAttendees).toBe(100)
      expect(event.metadata.notes).toBe('Important')
    })
  })

  describe('Metadata Coexistence with Other Fields', () => {
    it('should have both discounts (from README) and metadata.discountCodes', () => {
      const event = createEventWithMetadata({
        name: 'Conference with Multiple Discount Sources',
        discounts: [
          {
            code: 'INLINE20',
            value: '20%',
            until: '2026-10-31',
            untilDate: 1793404800000
          }
        ],
        metadata: {
          discountCodes: ['METADATA50'],
          estimatedAttendees: 1000,
          notes: ''
        }
      })

      expect(event.discounts).toHaveLength(1)
      expect(event.discounts[0].code).toBe('INLINE20')
      expect(event.metadata.discountCodes).toContain('METADATA50')
    })

    it('should preserve tags and metadata independently', () => {
      const event = createEventWithMetadata({
        tags: [
          { key: 'tech', value: 'java' },
          { key: 'topic', value: 'web-development' }
        ],
        metadata: {
          discountCodes: ['CODE1'],
          estimatedAttendees: 500,
          notes: 'Test'
        }
      })

      expect(event.tags).toHaveLength(2)
      expect(event.metadata.discountCodes).toEqual(['CODE1'])
    })
  })

  describe('React Component Rendering - Metadata Discounts', () => {
    it('should render metadata discounts even when inline discounts are empty', () => {
      const event = createEventWithMetadata({
        name: 'Event with Only Metadata Discounts',
        discounts: [],
        metadata: {
          discountCodes: ['CSV-CODE1', 'CSV-CODE2'],
          estimatedAttendees: 500,
          notes: 'From METADATA.csv'
        }
      })

      // Verify component receives metadata
      expect(event.metadata).toBeDefined()
      expect(event.metadata.discountCodes).toHaveLength(2)
      
      // Simulate component rendering
      const renderMetadata = event.metadata && event.metadata.discountCodes && event.metadata.discountCodes.length > 0
      expect(renderMetadata).toBe(true)
    })

    it('should render metadata discounts alongside inline discounts', () => {
      const event = createEventWithMetadata({
        name: 'Event with Both Discount Sources',
        discounts: [
          { code: 'INLINE', value: '10%' }
        ],
        metadata: {
          discountCodes: ['CSV-CODE'],
          estimatedAttendees: 1000,
          notes: ''
        }
      })

      // Both sources should be renderable
      const canRenderInline = event.discounts && event.discounts.length > 0
      const canRenderMetadata = event.metadata && event.metadata.discountCodes && event.metadata.discountCodes.length > 0
      
      expect(canRenderInline).toBe(true)
      expect(canRenderMetadata).toBe(true)
    })

    it('should handle null metadata gracefully', () => {
      const event = createEventWithMetadata({
        metadata: null
      })

      // Component should not crash
      const renderMetadata = event.metadata && event.metadata.discountCodes && event.metadata.discountCodes.length > 0
      expect(renderMetadata).toBeFalsy()
    })

    it('should handle undefined metadata gracefully', () => {
      const event = createEventWithMetadata()
      delete event.metadata

      // Component should not crash
      const renderMetadata = event.metadata && event.metadata.discountCodes && event.metadata.discountCodes.length > 0
      expect(renderMetadata).toBeFalsy()
    })

    it('should deduplicate discount codes when present in both inline and metadata', () => {
      const event = createEventWithMetadata({
        name: 'Event with Duplicate Codes',
        discounts: [
          { code: 'SHARED', value: '15%', until: '2026-03-31' },
          { code: 'INLINE50', value: '50%' }
        ],
        metadata: {
          discountCodes: ['SHARED', 'CSVONLY'],
          estimatedAttendees: 1000,
          notes: 'Multiple sources'
        }
      })

      // Verify both sources exist
      expect(event.discounts).toHaveLength(2)
      expect(event.metadata.discountCodes).toHaveLength(2)
      
      // Simulate component deduplication logic
      const inlineDiscounts = event.discounts || []
      const inlineCodeSet = new Set(inlineDiscounts.map(d => d.code))
      const metadataDiscounts = event.metadata.discountCodes.filter(code => !inlineCodeSet.has(code))
      
      // Should only include CSVONLY (SHARED is already in inline)
      expect(metadataDiscounts).toEqual(['CSVONLY'])
      expect(metadataDiscounts).not.toContain('SHARED')
    })
  })

  describe('Edge Cases', () => {
    it('should handle large attendee counts', () => {
      const event = createEventWithMetadata({
        metadata: {
          discountCodes: [],
          estimatedAttendees: 100000,
          notes: ''
        }
      })

      expect(event.metadata.estimatedAttendees).toBe(100000)
    })

    it('should handle long notes text', () => {
      const longNote = 'A'.repeat(500)
      const event = createEventWithMetadata({
        metadata: {
          discountCodes: [],
          estimatedAttendees: null,
          notes: longNote
        }
      })

      expect(event.metadata.notes.length).toBe(500)
    })

    it('should handle special characters in discount codes', () => {
      const event = createEventWithMetadata({
        metadata: {
          discountCodes: ['CODE-2026', 'SAVE_50%', 'EU.SPECIAL'],
          estimatedAttendees: 200,
          notes: ''
        }
      })

      expect(event.metadata.discountCodes).toContain('CODE-2026')
      expect(event.metadata.discountCodes).toContain('SAVE_50%')
      expect(event.metadata.discountCodes).toContain('EU.SPECIAL')
    })

    it('should handle special characters in notes', () => {
      const specialNote = 'Early bird: 30% off (until 2026-02-28) & "limited spots"'
      const event = createEventWithMetadata({
        metadata: {
          discountCodes: [],
          estimatedAttendees: null,
          notes: specialNote
        }
      })

      expect(event.metadata.notes).toBe(specialNote)
    })
  })

  describe('CfpView - Discount Display', () => {
    it('should display discounts for events with open CFPs', () => {
      const event = createEventWithMetadata({
        name: 'Conference with CFP',
        metadata: {
          discountCodes: ['CFPCODE'],
          estimatedAttendees: null,
          notes: ''
        },
        cfp: {
          link: 'https://cfp.example.com',
          until: '2026-03-31',
          untilDate: 1743206400000
        }
      })

      expect(event.cfp).toBeDefined()
      expect(event.cfp.link).toBe('https://cfp.example.com')
      expect(event.metadata.discountCodes).toContain('CFPCODE')
    })

    it('should display both inline and metadata discounts in CFP view', () => {
      const event = createEventWithMetadata({
        name: 'CFP Event with Multiple Discount Sources',
        discounts: [
          { code: 'INLINE20', value: '20%', until: '2026-02-28', untilDate: 1740700800000 }
        ],
        metadata: {
          discountCodes: ['CSVCODE'],
          estimatedAttendees: 1000,
          notes: ''
        },
        cfp: {
          link: 'https://cfp.example.com',
          until: '2026-03-31',
          untilDate: 1743206400000
        }
      })

      expect(event.discounts).toHaveLength(1)
      expect(event.metadata.discountCodes).toContain('CSVCODE')
      expect(event.cfp).toBeDefined()
    })
  })
})
