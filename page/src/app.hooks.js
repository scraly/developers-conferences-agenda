import allEvents from 'misc/all-events.json';
import {useMemo} from 'react';
import {useCustomContext} from 'app.context';

export const useHasYearEvents = (year) => {
  return useMemo(() => Boolean(allEvents.find(e => new Date(e.date[0]).getFullYear() === year)), [year]);
}

export const useCountries = () => {
  return useMemo(() => {
      const countries = new Set(allEvents.map(e => e.country));

      return Array.from(countries).filter((c) => c != "Online" && c != "").sort();
  }, []);
}

export const useYearEvents = () => {
  const {userState} = useCustomContext();
  const yearEvents = useMemo(() => allEvents.filter(e => e.date[0] && new Date(e.date[0]).getFullYear() === userState.year), [userState.year]);

  const filteredEvents = useMemo(() => {
      let result = yearEvents;
      if (userState.filters.closedCaptions) {
        result = result.filter(e => e.closedCaptions);
      }

      if (userState.filters.callForPapers) {
        result = result.filter(e => e.cfp && new Date(e.cfp.untilDate) > new Date());
      }

      if (userState.filters.online) {
        result = result.filter(e => e.location.indexOf('Online') !== -1);
      }

      if (userState.filters.country) {
        result = result.filter(e => e.country === userState.filters.country);
      }

      if (userState.filters.query) {
        result = result.filter(
          e =>
            e.name.toLowerCase().includes(userState.filters.query.toLowerCase()) ||
            e.hyperlink.toLowerCase().includes(userState.filters.query.toLowerCase()) ||
            e.location.toLowerCase().includes(userState.filters.query.toLowerCase())
        );
      }
      return result
  }, [yearEvents, userState.filters]);

  return filteredEvents;
}

export const useMonthEvents = (yearEvents, month = null) => {
  const {userState} = useCustomContext();
  const filterMonth = month === null ? userState.month : month;
  return useMemo(() => {
    let result = yearEvents;
    if (filterMonth !== -1) {
        result = result.filter(e => e.date[0] && new Date(e.date[0]).getMonth() === filterMonth || e.date[1] && new Date(e.date[1]).getMonth() === filterMonth);
    }
    return result
  }, [filterMonth, yearEvents]);
}

export const useDayEvents = (monthEvents, day = null) => {
  const {userState} = useCustomContext();
  const filterDay = day || userState.date;

  return useMemo(() => {
      let result = monthEvents
      if (filterDay) {
          result = result.filter(e => e.date[0] && new Date(e.date[0]).getDate() === filterDay.getDate() || e.date[1] && new Date(e.date[1]).getDate() === filterDay.getDate());
      }
      return result
  }, [filterDay, monthEvents]);
}
