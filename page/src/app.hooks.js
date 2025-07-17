import { useParams, useSearchParams } from 'react-router-dom'
import allEvents from 'misc/all-events.json'
import regions from 'misc/regions.json'
import { useMemo } from 'react'
import { isFavorite } from './utils/favorites'

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

export const useYearEvents = () => {
  const { year } = useParams()
  const [searchParams] = useSearchParams()
  const search = Object.fromEntries(searchParams)
  const regionsMap = useCountryToRegionMap()
  const yearEvents = useMemo(() => allEvents.filter((e) => e.date[0] && new Date(e.date[0]).getFullYear() === parseInt(year, 10)), [year])

  const filteredEvents = useMemo(() => {
    let result = yearEvents
    if (search.closedCaptions === 'true') {
      result = result.filter((e) => e.closedCaptions)
    }

    if (search.scholarship === 'true') {
      result = result.filter((e) => e.scholarship)
    }

    if (search.callForPapers === 'true') {
      result = result.filter((e) => e.cfp && new Date(e.cfp.untilDate + 24 * 60 * 60 * 1000) > new Date())
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

    if (search.untilDate) {
      // Display only opened callForPapers <= untilDate
      result = result.filter((e) => e.cfp && new Date(e.cfp.untilDate) <= new Date(search.untilDate))
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
        const eventId = `${e.name}-${e.date[0]}`;
        return isFavorite(eventId);
      });
    }

    return result
  }, [yearEvents, searchParams])

  return filteredEvents
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
