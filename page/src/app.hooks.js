import allEvents from 'misc/all-events.json';
import {useMemo} from 'react';
import {useCustomContext} from 'app.context';

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

export const useMonthEvents = () => {
  const {userState} = useCustomContext();
  const yearEvents = useYearEvents();
  let result = yearEvents;
  if (userState.month !== -1) {
      result = yearEvents.filter(e => e.date[0] && new Date(e.date[0]).getMonth() === userState.month || e.date[1] && new Date(e.date[1]).getMonth() === userState.month);
  }
  return result;
}

export const useDayEvents = (day = null) => {
  const {userState} = useCustomContext();
  const yearEvents = useYearEvents();
  const filterDay = day || userState.date;

  let result = yearEvents
  if (filterDay) {
      result = result.filter(e => e.date[0] && new Date(e.date[0]).getMonth() === filterDay.getMonth() || e.date[1] && new Date(e.date[1]).getMonth() === filterDay.getMonth());
      result = result.filter(e => e.date[0] && new Date(e.date[0]).getDate() === filterDay.getDate() || e.date[1] && new Date(e.date[1]).getDate() === filterDay.getDate());
  }
  return result;
}
