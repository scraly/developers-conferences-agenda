import 'styles/ListView.css';
import {ArrowRight} from 'lucide-react';

import {useYearEvents} from 'app.hooks';
import {getMonthName, getMonthNames, getMonthNameShort} from 'utils';

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

  const formatDate = dates => {
    const startDate = `${new Date(dates[0]).getDate()}-${getMonthNameShort(new Date(dates[0]).getMonth())}`;
    let endDate = '';
    if (dates.length > 1) {
      endDate = new Date(dates[1]).getDate();
      endDate = `${new Date(dates[1]).getDate()}-${getMonthNameShort(new Date(dates[1]).getMonth())}`;
    }
    if (endDate) {
      return (
        <span>
          {startDate}
          <ArrowRight />
          {endDate}
        </span>
      );
    }
    return <span>{startDate}</span>;
  };

  return (
    <div className="listView">
      {getMonthNames()
        .filter(m => eventsByMonth[m])
        .map(month => (
          <>
            <h1>{month}</h1>
            {eventsByMonth[month].map((e, i) => (
              <div key={`${month}_ev_${i}`} className='event-list-entry'>
                {formatDate(e.date)}
                <b>{e.name}</b>
                {e.hyperlink ? <a href={e.hyperlink}>{new URL(e.hyperlink).hostname}</a> : ''}
                <span>{e.location}</span>
                <span dangerouslySetInnerHTML={{__html: e.misc}}></span>
                {e.closedCaptions && <span><img alt="Closed Captions" src="https://img.shields.io/static/v1?label=CC&message=Closed%20Captions&color=blue" /></span>}
              </div>
            ))}
          </>
        ))}
    </div>
  );
};

export default ListView;
