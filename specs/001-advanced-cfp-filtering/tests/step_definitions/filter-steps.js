/**
 * Step definitions for Advanced CFP Filtering feature files.
 *
 * Maps Gherkin steps to test helpers used by:
 *   - Vitest unit tests (page/src/app.hooks.applyCommonFilters.test.js)
 *   - Playwright E2E tests (page/e2e/cfp-filters.spec.js)
 *
 * This file provides reusable test data factories and assertion helpers
 * that bind the feature scenarios to the actual test implementations.
 */

import { applyCommonFilters, TAG_FILTER_CONFIG } from '../../../../page/src/app.hooks.js'

// --- Test Data Factories (Background / Given steps) ---

export const createEvent = (overrides = {}) => ({
  name: 'Test Conference',
  hyperlink: 'https://example.com',
  location: 'Barcelona',
  country: 'ES',
  date: ['2025-07-08'],
  closedCaptions: false,
  scholarship: false,
  sponsoring: false,
  tags: [],
  cfp: { untilDate: '2026-12-31' },
  ...overrides
})

export const mockRegionsMap = {
  'ES': 'Europe',
  'FR': 'Europe',
  'DE': 'Europe',
  'US': 'North America',
  'CA': 'North America',
  'JP': 'Asia',
  'CN': 'Asia',
  'KR': 'Asia',
  'BR': 'South America',
  'AU': 'Oceania'
}

export const sampleEvents = {
  frontendJS: createEvent({
    name: 'Frontend JS Conf',
    country: 'FR',
    tags: [
      { key: 'topic', value: 'Frontend' },
      { key: 'tech', value: 'JavaScript' },
      { key: 'type', value: 'Conference' },
      { key: 'language', value: 'English' }
    ]
  }),
  devopsPython: createEvent({
    name: 'DevOps Python Summit',
    country: 'DE',
    tags: [
      { key: 'topic', value: 'DevOps' },
      { key: 'tech', value: 'Python' },
      { key: 'type', value: 'Conference' },
      { key: 'language', value: 'English' }
    ]
  }),
  frontendDevOps: createEvent({
    name: 'Full Stack Conf',
    country: 'ES',
    tags: [
      { key: 'topic', value: 'Frontend' },
      { key: 'topic', value: 'DevOps' },
      { key: 'tech', value: 'JavaScript' },
      { key: 'type', value: 'Conference' }
    ]
  }),
  phpConf: createEvent({
    name: 'PHP World',
    country: 'DE',
    tags: [
      { key: 'tech', value: 'PHP' },
      { key: 'topic', value: 'Backend' },
      { key: 'type', value: 'Conference' }
    ]
  }),
  onlineOnly: createEvent({
    name: 'Online Summit',
    location: 'Online',
    country: 'Online',
    tags: [{ key: 'topic', value: 'Frontend' }]
  }),
  hybrid: createEvent({
    name: 'Hybrid Conf',
    location: 'Barcelona & Online',
    country: 'ES',
    tags: [{ key: 'topic', value: 'Frontend' }]
  }),
  meetup: createEvent({
    name: 'JS Meetup',
    country: 'US',
    tags: [
      { key: 'type', value: 'Meetup' },
      { key: 'tech', value: 'JavaScript' }
    ]
  }),
  frenchEvent: createEvent({
    name: 'Conf Francophone',
    country: 'FR',
    tags: [{ key: 'language', value: 'French' }]
  }),
  japanEvent: createEvent({
    name: 'Tokyo Dev',
    country: 'JP',
    tags: [
      { key: 'tech', value: 'TypeScript' },
      { key: 'topic', value: 'Frontend' }
    ]
  }),
  noTags: createEvent({
    name: 'Untagged Event',
    country: 'US',
    tags: []
  })
}

// --- When step helpers ---

export const applyFilter = (events, searchParams) => {
  return applyCommonFilters(events, searchParams, mockRegionsMap)
}

// Build search params for per-dimension filtering
export const buildSearchParams = ({
  topic, topic_not, topic_mode,
  tech, tech_not, tech_mode,
  language, language_not, language_mode,
  type, type_not, type_mode,
  country, country_not, country_mode,
  region, region_not, region_mode,
  notOnline, online,
  tags, // legacy format
  ...rest
} = {}) => {
  const params = { ...rest }
  if (topic) params.topic = Array.isArray(topic) ? topic.join(',') : topic
  if (topic_not) params.topic_not = Array.isArray(topic_not) ? topic_not.join(',') : topic_not
  if (topic_mode) params.topic_mode = topic_mode
  if (tech) params.tech = Array.isArray(tech) ? tech.join(',') : tech
  if (tech_not) params.tech_not = Array.isArray(tech_not) ? tech_not.join(',') : tech_not
  if (tech_mode) params.tech_mode = tech_mode
  if (language) params.language = Array.isArray(language) ? language.join(',') : language
  if (language_not) params.language_not = Array.isArray(language_not) ? language_not.join(',') : language_not
  if (language_mode) params.language_mode = language_mode
  if (type) params.type = Array.isArray(type) ? type.join(',') : type
  if (type_not) params.type_not = Array.isArray(type_not) ? type_not.join(',') : type_not
  if (type_mode) params.type_mode = type_mode
  if (country) params.country = Array.isArray(country) ? country.join(',') : country
  if (country_not) params.country_not = Array.isArray(country_not) ? country_not.join(',') : country_not
  if (country_mode) params.country_mode = country_mode
  if (region) params.region = Array.isArray(region) ? region.join(',') : region
  if (region_not) params.region_not = Array.isArray(region_not) ? region_not.join(',') : region_not
  if (region_mode) params.region_mode = region_mode
  if (notOnline) params.notOnline = notOnline
  if (online) params.online = online
  if (tags) params.tags = tags
  return params
}

// --- Then step assertion helpers ---

export const expectEventsToMatch = (result, expectedNames) => {
  const names = result.map(e => e.name).sort()
  return names.sort().join(',') === expectedNames.sort().join(',')
}

export const expectNoResults = (result) => {
  return result.length === 0
}

export const expectAllEvents = (result, allEvents) => {
  return result.length === allEvents.length
}

// --- Tag filter config assertions ---

export const isAllowedDimension = (key) => {
  return TAG_FILTER_CONFIG.allowed.includes(key)
}

export const isBlockedDimension = (key) => {
  return TAG_FILTER_CONFIG.blocked.includes(key)
}
