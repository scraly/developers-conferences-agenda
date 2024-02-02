import {useParams, useSearchParams} from 'react-router-dom';
import allEvents from 'misc/all-events.json';
import {useMemo} from 'react';

export const useHasYearEvents = year => {
  return useMemo(
    () => Boolean(allEvents.find(e => new Date(e.date[0]).getFullYear() === parseInt(year, 10))),
    [year]
  );
};

export const useCountries = () => {
  return useMemo(() => {
    const countries = new Set(allEvents.map(e => e.country));

    return Array.from(countries)
      .filter(c => c != 'Online' && c != '')
      .sort();
  }, []);
};

export const useYearEvents = () => {
  const {year} = useParams();
  const [searchParams] = useSearchParams();
  const search = Object.fromEntries(searchParams);
  const yearEvents = useMemo(
    () =>
      allEvents.filter(e => e.date[0] && new Date(e.date[0]).getFullYear() === parseInt(year, 10)),
    [year]
  );

  const filteredEvents = useMemo(() => {
    let result = yearEvents;
    if (search.closedCaptions === 'true') {
      result = result.filter(e => e.closedCaptions);
    }

    if (search.scholarship === 'true') {
      result = result.filter(e => e.scholarship);
    }

    if (search.callForPapers === 'true') {
      result = result.filter(e => e.cfp && new Date(e.cfp.untilDate) > new Date());
    }

    if (search.online === 'true') {
      result = result.filter(e => e.location.indexOf('Online') !== -1);
    }

    if (search.country) {
      result = result.filter(e => e.country === search.country);
    }

    if (search.query) {
      result = result.filter(
        e =>
          e.name.toLowerCase().includes(search.query.toLowerCase()) ||
          e.hyperlink.toLowerCase().includes(search.query.toLowerCase()) ||
          e.location.toLowerCase().includes(search.query.toLowerCase())
      );
    }
    return result;
  }, [yearEvents, searchParams]);

  return filteredEvents;
};

export const useMonthEvents = (yearEvents, month = null) => {
  const filterMonth = month;
  return useMemo(() => {
    let result = yearEvents;
    if (filterMonth !== -1) {
      result = result.filter(
        e =>
          (e.date[0] && new Date(e.date[0]).getMonth() === filterMonth) ||
          (e.date[1] && new Date(e.date[1]).getMonth() === filterMonth)
      );
    }
    return result;
  }, [filterMonth, yearEvents]);
};

export const useDayEvents = (monthEvents, day = null) => {
  const filterDay = day;

  return useMemo(() => {
    let result = monthEvents;
    if (filterDay) {
      result = result.filter(
        e =>
          (e.date[0] && new Date(e.date[0]).getDate() === filterDay.getDate()) ||
          (e.date[1] && new Date(e.date[1]).getDate() === filterDay.getDate())
      );
    }
    return result;
  }, [filterDay, monthEvents]);
};
