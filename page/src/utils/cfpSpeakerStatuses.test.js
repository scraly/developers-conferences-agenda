import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getCfpSpeakerStatus, setCfpSpeakerStatus } from './cfpSpeakerStatuses'

describe('CFP speaker statuses', () => {
  const eventId = 'Test Conference-2026-06-01'
  const storage = new Map()

  beforeEach(() => {
    storage.clear()
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(key => storage.get(key) || null),
      setItem: vi.fn((key, value) => storage.set(key, value))
    })
  })

  it('stores a speaker status for an event', () => {
    setCfpSpeakerStatus(eventId, 'applied')

    expect(getCfpSpeakerStatus(eventId)).toEqual({ applied: true, outcome: undefined })
  })

  it('keeps an application when an outcome is selected', () => {
    setCfpSpeakerStatus(eventId, 'applied')
    setCfpSpeakerStatus(eventId, 'accepted')

    expect(getCfpSpeakerStatus(eventId)).toEqual({ applied: true, outcome: 'accepted' })
  })

  it('replaces an outcome and clears it when selected again', () => {
    setCfpSpeakerStatus(eventId, 'accepted')
    setCfpSpeakerStatus(eventId, 'rejected')

    expect(getCfpSpeakerStatus(eventId)).toEqual({ applied: false, outcome: 'rejected' })

    setCfpSpeakerStatus(eventId, 'rejected')

    expect(getCfpSpeakerStatus(eventId)).toEqual({ applied: false, outcome: undefined })
  })
})