import React from 'react';
import 'styles/ListView.css';

import {useYearEvents} from 'app.hooks';
import {getMonthName, getMonthNames} from 'utils';
import ShortDate from 'components/ShortDate/ShortDate';

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
              <div className='event-list-entry' key={`${month}_ev_${i}`}>
                <ShortDate dates={e.date} />
                <b>{e.name}</b>
                {e.hyperlink ? <a href={e.hyperlink}>{new URL(e.hyperlink).hostname}</a> : ''}
                <span>{e.location}</span>
                <span dangerouslySetInnerHTML={{__html: e.misc}} />
                {e.closedCaptions ? <span><img alt="Closed Captions" src="https://img.shields.io/static/v1?label=CC&message=Closed%20Captions&color=blue" /></span> : null}
              </div>
            ))}
          </React.Fragment>
        ))}
    </div>
  );
};

export default ListView;
