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

    expect(getCfpSpeakerStatus(eventId)).toBe('applied')
  })

  it('replaces a status with the newly selected one', () => {
    setCfpSpeakerStatus(eventId, 'applied')
    setCfpSpeakerStatus(eventId, 'accepted')

    expect(getCfpSpeakerStatus(eventId)).toBe('accepted')
  })

  it('removes a status when it is selected again', () => {
    setCfpSpeakerStatus(eventId, 'rejected')
    setCfpSpeakerStatus(eventId, 'rejected')

    expect(getCfpSpeakerStatus(eventId)).toBeUndefined()
  })
})