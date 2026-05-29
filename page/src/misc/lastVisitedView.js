export const LAST_VISITED_VIEW_KEY = 'dca:lastVisitedView'
export const DEFAULT_VIEW = 'list'

const VALID_VIEWS = ['cfp', 'calendar', 'list', 'map']
const VALID_VIEWS_SET = new Set(VALID_VIEWS)

export const isValidView = (view) => VALID_VIEWS_SET.has(view)

export const extractViewFromPath = (pathname = '') => {
  if (typeof pathname !== 'string') {
    return null
  }

  const match = pathname.match(/^\/\d{4}\/(cfp|calendar|list|map)(?:\/|$)/)
  return match ? match[1] : null
}

export const getLastVisitedView = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_VIEW
  }

  try {
    const view = window.localStorage.getItem(LAST_VISITED_VIEW_KEY)
    return isValidView(view) ? view : DEFAULT_VIEW
  } catch {
    return DEFAULT_VIEW
  }
}

export const setLastVisitedView = (view) => {
  if (!isValidView(view) || typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(LAST_VISITED_VIEW_KEY, view)
  } catch {
    // Ignore storage failures (private mode, blocked storage, etc.)
  }
}