import { beforeEach, describe, expect, it, vi } from 'vitest'

import { filterEventsBySpeakerStatus, setCfpSpeakerStatus } from '../../utils/cfpSpeakerStatuses'

describe('CFP Companion status filtering', () => {
  const storage = new Map()
  const events = [
    { name: 'Pending Conference', date: ['2026-06-01'] },
    { name: 'Accepted Conference', date: ['2026-06-02'] },
    { name: 'Rejected Conference', date: ['2026-06-03'] },
    { name: 'Untracked Conference', date: ['2026-06-04'] }
  ]

  beforeEach(() => {
    storage.clear()
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(key => storage.get(key) || null),
      setItem: vi.fn((key, value) => storage.set(key, value))
    })
    setCfpSpeakerStatus('Pending Conference-2026-06-01', 'applied')
    setCfpSpeakerStatus('Accepted Conference-2026-06-02', 'accepted')
    setCfpSpeakerStatus('Rejected Conference-2026-06-03', 'rejected')
  })

  it('filters events by their speaker status', () => {
    expect(filterEventsBySpeakerStatus(events, ['pending']).map(event => event.name)).toEqual(['Pending Conference'])
    expect(filterEventsBySpeakerStatus(events, ['accepted']).map(event => event.name)).toEqual(['Accepted Conference'])
    expect(filterEventsBySpeakerStatus(events, ['rejected']).map(event => event.name)).toEqual(['Rejected Conference'])
  })

  it('combines selected statuses and shows all events without a filter', () => {
    expect(filterEventsBySpeakerStatus(events, ['accepted', 'rejected']).map(event => event.name)).toEqual([
      'Accepted Conference',
      'Rejected Conference'
    ])
    expect(filterEventsBySpeakerStatus(events, [])).toEqual(events)
  })
})