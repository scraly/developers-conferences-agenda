import { beforeEach, describe, expect, it } from 'vitest'
import {
  DEFAULT_VIEW,
  LAST_VISITED_VIEW_KEY,
  extractViewFromPath,
  getLastVisitedView,
  setLastVisitedView
} from './lastVisitedView'

describe('lastVisitedView', () => {
  const createStorage = () => {
    let store = {}

    return {
      clear: () => {
        store = {}
      },
      getItem: (key) => store[key] ?? null,
      setItem: (key, value) => {
        store[key] = String(value)
      }
    }
  }

  beforeEach(() => {
    global.window = { localStorage: createStorage() }
    window.localStorage.clear()
  })

  describe('extractViewFromPath', () => {
    it('returns the view for supported routes', () => {
      expect(extractViewFromPath('/2026/list')).toBe('list')
      expect(extractViewFromPath('/2026/calendar')).toBe('calendar')
      expect(extractViewFromPath('/2026/cfp')).toBe('cfp')
      expect(extractViewFromPath('/2026/map')).toBe('map')
      expect(extractViewFromPath('/2026/calendar/4/123456')).toBe('calendar')
    })

    it('returns null for unsupported paths', () => {
      expect(extractViewFromPath('/')).toBeNull()
      expect(extractViewFromPath('/2026')).toBeNull()
      expect(extractViewFromPath('/2026/unknown')).toBeNull()
    })
  })

  describe('storage helpers', () => {
    it('returns default view when there is no stored value', () => {
      expect(getLastVisitedView()).toBe(DEFAULT_VIEW)
    })

    it('stores and retrieves a valid view', () => {
      setLastVisitedView('map')
      expect(getLastVisitedView()).toBe('map')
    })

    it('ignores invalid values and keeps default fallback', () => {
      setLastVisitedView('invalid-view')
      expect(window.localStorage.getItem(LAST_VISITED_VIEW_KEY)).toBeNull()
      expect(getLastVisitedView()).toBe(DEFAULT_VIEW)
    })
  })
})
