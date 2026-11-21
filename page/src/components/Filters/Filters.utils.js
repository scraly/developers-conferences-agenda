import { TAG_FILTER_CONFIG } from 'app.hooks'

// Name valid filters explicitly so view, tracking, and obsolete URL parameters do not
// activate the indicator, and boolean flags stay distinct from free-text filter values.
const DIMENSIONS = [...TAG_FILTER_CONFIG.allowed, 'country', 'region']
const VALUE_FILTER_PARAMS = new Set(['query', 'untilDate', 'minAttendees', 'tags', 'cfpStatus'])
const BOOLEAN_FILTER_PARAMS = new Set([
  'callForPapers',
  'closedCaptions',
  'scholarship',
  'sponsoring',
  'favorites',
  'recordings',
  'online',
  'inPerson'
])
const DIMENSION_PARAMS = DIMENSIONS.flatMap(dimension => [dimension, `${dimension}_not`])
const ACTIVE_FILTER_PARAMS = new Set([
  ...VALUE_FILTER_PARAMS,
  ...BOOLEAN_FILTER_PARAMS,
  ...DIMENSION_PARAMS
])

export const getFilterParamKeys = () => {
  const keys = new Set([...ACTIVE_FILTER_PARAMS, 'notOnline'])
  DIMENSIONS.forEach(dimension => keys.add(`${dimension}_mode`))
  return keys
}

const hasSelectedValue = (value) => {
  if (value === undefined || value === null || value === false) {
    return false
  }

  return String(value).split(',').some(item => item.trim() !== '')
}

export const hasActiveFilters = (search = {}) => (
  Object.entries(search).some(([key, value]) => {
    if (!ACTIVE_FILTER_PARAMS.has(key)) {
      return false
    }

    if (BOOLEAN_FILTER_PARAMS.has(key)) {
      return value === true || value === 'true'
    }

    return hasSelectedValue(value)
  })
)
