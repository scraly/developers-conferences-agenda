import React from 'react';
import {useSearchParams} from 'react-router-dom';
import {useYearEvents} from 'app.hooks';
import {getMonthName, getMonthNames} from 'utils';
import slugify from 'slugify';
import EventView from 'components/EventView/EventView';

const ListView = () => {
  let events = useYearEvents();
  const [searchParams] = useSearchParams();
  const search = Object.fromEntries(searchParams);

  // Sort events based on the selected sort option
  events = events.sort((a, b) => {
    if (search.sort === 'cfp') {
      if (!a.cfp?.untilDate || !b.cfp?.untilDate) return 0;
      return new Date(a.cfp.untilDate) - new Date(b.cfp.untilDate);
    }
    return new Date(a.date[0]) - new Date(b.date[0]);
  });

  const eventsByMonth = events.reduce((acc, cur) => {
    let monthKey;
    if (search.sort === 'cfp' && cur.cfp?.untilDate) {
      monthKey = getMonthName(new Date(cur.cfp.untilDate).getMonth());
    } else {
      monthKey = getMonthName(new Date(cur.date[0]).getMonth());
    }

    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(cur);

    // Only add to next month if it's not CFP sort and has multiple dates
    if (search.sort !== 'cfp' && cur.date.length > 1) {
      const nextMonth = getMonthName(new Date(cur.date[1]).getMonth());
      if (monthKey !== nextMonth) {
        if (!acc[nextMonth]) {
          acc[nextMonth] = [];
        }
        acc[nextMonth].push(cur);
      }
    }
    return acc;
  }, {});

  // Get the month names in the correct order based on sort type
  const monthOrder = Object.keys(eventsByMonth).sort((a, b) => {
    const monthA = getMonthNames().indexOf(a);
    const monthB = getMonthNames().indexOf(b);
    return monthA - monthB;
  });

  return (
    <>
      {monthOrder.map(month => (
        <React.Fragment key={month}>
          <h3>
            {month}
            {search.sort === 'cfp' ? ' CFP Deadlines' : ' Events'}:
          </h3>
          {eventsByMonth[month].map((e, _) => (
            <EventView event={e} key={`${month}_ev_${slugify(JSON.stringify(e))}`} />
          ))}
        </React.Fragment>
      ))}
    </>
  );
};

export default ListView;
