import React from 'react';
import 'styles/ListView.css';

import {useYearEvents} from 'app.hooks';
import {getMonthName, getMonthNames} from 'utils';
import ShortDate from 'components/ShortDate/ShortDate';
import { EventListEntry } from './Entry';

const ListView = () => {
  let events = useYearEvents();

  const eventsByMonth = events.reduce((acc, cur) => {
    const currentMonth = getMonthName(new Date(cur.date[0]).getMonth());
    if (!acc[currentMonth]) {
      acc[currentMonth] = [];
    }
    acc[currentMonth].push(cur);
    if (cur.date.length > 1) {
      const nextMonth = getMonthName(new Date(cur.date[1]).getMonth());
      if (currentMonth !== nextMonth) {
        if (!acc[nextMonth]) {
          acc[nextMonth] = [];
        }
        acc[nextMonth].push(cur);
      }
    }
    return acc;
  }, {});

  return (
    <div className="listView">
      {getMonthNames()
        .filter(m => eventsByMonth[m])
        .map(month => (
          <React.Fragment key={month}>
            <h1>{month}</h1>
            {eventsByMonth[month].map((e, i) => (
              <EventListEntry key={`${month}_ev_${i}`} event={e} />
            ))}
          </React.Fragment>
        ))}
    </div>
  );
};

export default ListView;
