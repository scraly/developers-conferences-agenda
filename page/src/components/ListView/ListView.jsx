import React from 'react';
import { useSearchParams } from "react-router-dom";
import 'styles/ListView.css';

import {useYearEvents} from 'app.hooks';
import {getMonthName, getMonthNames} from 'utils';
import ShortDate from 'components/ShortDate/ShortDate';

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
    <div className="listView">
      {monthOrder.map(month => (
        <React.Fragment key={month}>
          <h1>{month}{search.sort === 'cfp' ? ' CFP Deadlines' : ' Events'}</h1>
          {eventsByMonth[month].map((e, i) => (
            <div key={`${month}_ev_${i}`} className='event-list-entry'>
              <ShortDate dates={e.date} />
              <b>{e.name}</b>
              {e.hyperlink ? <a href={e.hyperlink}>{new URL(e.hyperlink).hostname}</a> : ''}
              <span>{e.location}</span>
              <span dangerouslySetInnerHTML={{__html: e.misc}}></span>
              {e.closedCaptions && <span><img alt="Closed Captions" src="https://img.shields.io/static/v1?label=CC&message=Closed%20Captions&color=blue" /></span>}
              {search.sort === 'cfp' && e.cfp?.untilDate && (
              )}
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ListView;
