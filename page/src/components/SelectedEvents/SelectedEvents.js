import {useMemo, useRef, useState} from 'react';

import 'styles/SelectedEvents.css';
import EventDisplay from '../EventDisplay/EventDisplay';
import {formatDate, getMonthName} from '../../utils';

const SelectedEvents = ({year, month, date}) => {
  const [events, setEvents] = useState(null);
  const scrollToRef = useRef();

  useMemo(() => {
    const events = [];
    if (month && year && window.dev_events[year] && window.dev_events[month]) {
      Object.values(window.dev_events[month]).map(e => events.push(e));
    } else if (
      date &&
      window.dev_events[date.getFullYear()] &&
      window.dev_events[date.getFullYear()][date.getMonth()] &&
      window.dev_events[date.getFullYear()][date.getMonth()][date.getDate()]
    ) {
      window.dev_events[date.getFullYear()][date.getMonth()][date.getDate()].map(e =>
        events.push(e)
      );
    }
    setEvents(
      events.length ? (
        [...new Map(events.map(item => [item.name, item])).values()].map((e, i) => (
          <EventDisplay key={`ev_${i}`} {...e} />
        ))
      ) : (
        <p>No event found for that day</p>
      )
    );
    scrollToRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [year, month, date]);

  return (
    <>
      {date ? (
        <>
          <h3 className="eventDateDisplay" ref={scrollToRef}>
            {getMonthName(month) || formatDate(date)}
          </h3>
          <div className="eventsGridDisplay">{events}</div>
        </>
      ) : (
        ''
      )}
    </>
  );
};

export default SelectedEvents;
