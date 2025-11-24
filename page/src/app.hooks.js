import {useParams, useSearchParams} from 'react-router-dom'
import allEvents from 'misc/all-events.json'
import regions from 'misc/regions.json'
import {useCallback, useMemo} from 'react'
import {isFavorite} from './utils/favorites'

export const useHasYearEvents = (year) => {
  return useMemo(() => Boolean(allEvents.find((e) => new Date(e.date[0]).getFullYear() === parseInt(year, 10))), [year])
}

export const useCountries = () => {
  return useMemo(() => {
    const countries = new Set(allEvents.map((e) => e.country))

    return Array.from(countries)
      .filter((c) => c != 'Online' && c != '')
      .sort()
  }, [])
}

export const useCountryToRegionMap = () => {
  return useMemo(() => {
    let results = {}
    Object.keys(regions).forEach((region) => {
      regions[region].forEach((country) => (results[country] = region))
    })
    return results
  }, [])
}

export const useRegionsMap = () => {
  return useMemo(() => {
    return regions
  }, [])
}

export const useRegions = () => {
  return useMemo(() => {
    return Object.keys(regions)
  }, [])
}

export const useTags = () => {
  return useMemo(() => {
    const tagsByKey = {}
    allEvents.forEach((e) => {
      if (e.tags && Array.isArray(e.tags)) {
        e.tags.forEach((tag) => {
          if (typeof tag === 'object' && tag.key && tag.value) {
            if (!tagsByKey[tag.key]) {
              tagsByKey[tag.key] = new Set()
            }
            tagsByKey[tag.key].add(tag.value)
          }
        })
      }
    })

    // Convert sets to sorted arrays
    const result = {}
    Object.keys(tagsByKey).forEach(key => {
      result[key] = Array.from(tagsByKey[key]).sort()
    })

    return result
  }, [])
}

export const useTagKeys = () => {
  return useMemo(() => {
    const keys = new Set()
    allEvents.forEach((e) => {
      if (e.tags && Array.isArray(e.tags)) {
        e.tags.forEach((tag) => {
          if (typeof tag === 'object' && tag.key) {
            keys.add(tag.key)
          }
        })
      }
    })
    return Array.from(keys).sort()
  }, [])
}

export const useYearEvents = () => {
  const { year } = useParams()
  const [searchParams] = useSearchParams()
  const search = Object.fromEntries(searchParams)
  const regionsMap = useCountryToRegionMap()
  const yearEvents = useMemo(() => allEvents.filter((e) => e.date[0] && new Date(e.date[0]).getFullYear() === parseInt(year, 10)), [year])

  return useMemo(() => {
    let result = yearEvents

    if (search.callForPapers === 'true') {
      result = result.filter((e) => isCfpOpen(e.cfp?.untilDate))
    }

    // Apply CFP until date filter
    if (search.untilDate) {
      result = filterEventsByCfpUntilDate(result, search.untilDate)
    }

    // Apply common filters
    result = applyCommonFilters(result, search, regionsMap)

    return result
  }, [yearEvents, searchParams, regionsMap])
}

/**
 * Filter events to show only those with CFPs closing in the selected year
 * Results are sorted by CFP deadline (earliest first)
 * @param {Array} events - Array of events to filter
 * @param {number|string} year - The year to filter by
 * @returns {Array} Filtered and sorted events
 */
export const filterCfpEventsByYear = (events, year) => {
  const currentYear = parseInt(year, 10)

  return events
    .filter(e => {
      if (!e.cfp || !e.cfp.untilDate) return false
      if (!isCfpOpen(e.cfp.untilDate)) return false

      const cfpYear = new Date(e.cfp.untilDate).getFullYear()

      // Only show CFPs that close in the selected year
      return cfpYear === currentYear
    })
    .sort((a, b) => {
      const dateA = new Date(a.cfp.untilDate).getTime()
      const dateB = new Date(b.cfp.untilDate).getTime()
      return dateA - dateB
    })
}

export const useCfpEvents = () => {
  const { year } = useParams()
  const [searchParams] = useSearchParams()
  const search = Object.fromEntries(searchParams)
  const regionsMap = useCountryToRegionMap()

  return useMemo(() => {
    // Filter by year first
    let result = filterCfpEventsByYear(allEvents, year)

    // Apply CFP until date filter
    if (search.untilDate) {
      result = filterEventsByCfpUntilDate(result, search.untilDate)
    }

    // Apply common filters
    result = applyCommonFilters(result, search, regionsMap)

    return result
  }, [year, searchParams, regionsMap])
}

/**
 * Filter events by CFP until a particular date
 * Results are sorted by CFP deadline (earliest first)
 * @param {Array} events - Array of events to filter
 * @param {string} untilDate - Filter date string (YYYY-MM-DD)
 * @returns {Array} Filtered and sorted events
 */
export const filterEventsByCfpUntilDate = (events, untilDate) => {
  if (!untilDate) return events

  const filterDate = new Date(untilDate)
  filterDate.setHours(23, 59, 59, 999) // End of the selected day

  return events
    .filter((e) => {
      if (!e.cfp || !e.cfp.untilDate) return false
      const cfpDeadline = new Date(e.cfp.untilDate)
      // CFP must still be open today AND close on or before the filter date
      return isCfpOpen(e.cfp.untilDate) && cfpDeadline <= filterDate
    })
    .sort((a, b) => {
      const dateA = new Date(a.cfp.untilDate).getTime()
      const dateB = new Date(b.cfp.untilDate).getTime()
      return dateA - dateB
    })
}

/**
 * Check if a CFP is still open (with 24h buffer)
 * @param {string} cfpUntilDate - CFP closing date string
 * @returns {boolean} True if CFP is still open
 */
export const isCfpOpen = (cfpUntilDate) => {
  if (!cfpUntilDate) return false
  const cfpDeadline = new Date(cfpUntilDate)
  const cfpDeadlineWithBuffer = new Date(cfpDeadline.getTime() + 24 * 60 * 60 * 1000)
  return cfpDeadlineWithBuffer > new Date()
}

/**
 * Apply common search filters to events
 * @param {Array} events - Array of events to filter
 * @param {Object} search - Search parameters object
 * @param {Object} regionsMap - Map of countries to regions
 * @returns {Array} Filtered events
 */
export const applyCommonFilters = (events, search, regionsMap) => {
  let result = events

  if (search.closedCaptions === 'true') {
    result = result.filter((e) => e.closedCaptions)
  }

  if (search.scholarship === 'true') {
    result = result.filter((e) => e.scholarship)
  }

  if (search.online === 'true') {
    result = result.filter((e) => e.location.indexOf('Online') !== -1)
  }

  if (search.country) {
    result = result.filter((e) => e.country === search.country)
  }

  if (search.region) {
    result = result.filter((e) => regionsMap[e.country] === search.region)
  }

  if (search.query) {
    result = result.filter(
        (e) =>
            e.name.toLowerCase().includes(search.query.toLowerCase()) ||
            e.hyperlink.toLowerCase().includes(search.query.toLowerCase()) ||
            e.location.toLowerCase().includes(search.query.toLowerCase())
    )
  }

  if (search.favorites === 'true') {
    result = result.filter((e) => {
      const eventId = `${e.name}-${e.date[0]}`
      return isFavorite(eventId)
    })
  }

  if (search.sponsoring === 'true') {
    result = result.filter((e) => e.sponsoring)
  }

  // Handle multiselect tags filter (AND logic - all selected tags must match)
  if (search.tags) {
    const selectedTags = Array.isArray(search.tags) ? search.tags : search.tags.split(',')
    if (selectedTags.length > 0 && selectedTags[0] !== '') {
      result = result.filter((e) => {
        if (!e.tags || !Array.isArray(e.tags)) return false
        return selectedTags.every(selectedTag => {
          const [key, value] = selectedTag.split(':')
          return e.tags.some((tag) => {
            return typeof tag === 'object' && tag.key === key && tag.value === value
          })
        })
      })
    }
  }

  // Handle individual tag filters by key (legacy support)
  const tagKeys = ['tech', 'topic', 'type', 'language']
  tagKeys.forEach(key => {
    if (search[key]) {
      result = result.filter((e) => {
        if (!e.tags || !Array.isArray(e.tags)) return false
        return e.tags.some((tag) => {
          return typeof tag === 'object' && tag.key === key && tag.value === search[key]
        })
      })
    }
  })


  return result
}

export const useMonthEvents = (yearEvents, month = null) => {
  const filterMonth = month
  return useMemo(() => {
    let result = yearEvents
    if (filterMonth !== -1) {
      result = result.filter(
        (e) =>
          (e.date[0] && new Date(e.date[0]).getMonth() === filterMonth) || (e.date[1] && new Date(e.date[1]).getMonth() === filterMonth)
      )
    }
    return result
  }, [filterMonth, yearEvents])
}

export const useDayEvents = (monthEvents, day = null) => {
  const filterDay = day

  return useMemo(() => {
    let result = monthEvents
    if (filterDay) {
      result = result.filter((e) => {
        let retval = false

        if (e.date[0] && e.date[1] == null) {
          const startDate = new Date(e.date[0])
          retval = startDate.getDate() === filterDay.getDate()
        }

        if (e.date[1] && e.date[0] == null) {
          const endDate = new Date(e.date[1])
          retval = retval || endDate.getDate() === filterDay.getDate()
        }

        if (e.date[0] && e.date[1]) {
          const startDate = new Date(e.date[0])
          const endDate = new Date(e.date[1])
          retval = retval || (filterDay >= startDate && endDate >= filterDay)
        }

        return retval
      })
    }
    return result
  }, [filterDay, monthEvents])
}

export const useFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const search = Object.fromEntries(searchParams);
    return {
      ...search,
      tags: search.tags ? (Array.isArray(search.tags) ? search.tags : search.tags.split(',')) : []
    };
  }, [searchParams]);

  const updateFilter = useCallback((key, value) => {
    const currentSearch = Object.fromEntries(searchParams);
    if (value === '' || value === null || value === undefined) {
      delete currentSearch[key];
    } else {
      currentSearch[key] = value;
    }
    setSearchParams(currentSearch);
  }, [searchParams, setSearchParams]);

  const addTag = useCallback((key, value) => {
    const tagString = `${key}:${value}`;
    const currentTags = filters.tags;

    if (!currentTags.includes(tagString)) {
      const newTags = [...currentTags, tagString];
      updateFilter('tags', newTags.join(','));
    }
  }, [filters.tags, updateFilter]);

  const removeTag = useCallback((key, value) => {
    const tagString = `${key}:${value}`;
    const currentTags = filters.tags;
    const newTags = currentTags.filter(tag => tag !== tagString);

    if (newTags.length === 0) {
      updateFilter('tags', '');
    } else {
      updateFilter('tags', newTags.join(','));
    }
  }, [filters.tags, updateFilter]);

  const toggleTag = useCallback((key, value) => {
    const tagString = `${key}:${value}`;
    const currentTags = filters.tags;

    if (currentTags.includes(tagString)) {
      removeTag(key, value);
    } else {
      addTag(key, value);
    }
  }, [filters.tags, addTag, removeTag]);

  const isTagSelected = useCallback((key, value) => {
    const tagString = `${key}:${value}`;
    return filters.tags.includes(tagString);
  }, [filters.tags]);

  return {
    filters,
    updateFilter,
    addTag,
    removeTag,
    toggleTag,
    isTagSelected
  };
};
