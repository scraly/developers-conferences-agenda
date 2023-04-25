import {useMemo, useRef, useState} from 'react';

import 'styles/SelectedEvents.css';
import EventDisplay from '../EventDisplay/EventDisplay';
import {formatDate, getMonthName} from '../../utils';
import {useCustomContext} from 'app.context';

const SelectedEvents = ({year, month, date}) => {
  const userDispatch = useCustomContext().userDispatch;
  const [events, setEvents] = useState(null);
  const scrollToRef = useRef();

  useMemo(() => {
    let events = [];
    if (month !== -1 && year && window.dev_events[year] && window.dev_events[year][month]) {
      Object.values(window.dev_events[year][month]).map(day => day.map(d => events.push(d)));
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
    events = [...new Map(events.map(item => [item.name, item])).values()];
    setEvents(
      events.length ? (
        events.map((e, i) => <EventDisplay key={`ev_${i}`} {...e} />)
      ) : (
        <p>No event found for that day</p>
      )
    );
    scrollToRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [year, month, date]);

  let previous = '',
    next = '';
  if (month !== -1 && year) {
    if (month > 0)
      previous = (
        <button
          onClick={() =>
            userDispatch({type: 'displayDate', payload: {date, month: month - 1, year}})
          }
        >
          ◀️
        </button>
      );
    if (month < 11)
      next = (
        <button
          onClick={() =>
            userDispatch({type: 'displayDate', payload: {date, month: month + 1, year}})
          }
        >
          ▶️
        </button>
      );
  } else if (date) {
    const dateYear = date.getFullYear();
    const firstDay = new Date(dateYear, 0, 1).getTime();
    const lastDay = new Date(dateYear, 12, 0).getTime();
    const today = date.getTime();
    const day = 24 * 60 * 60 * 1000;
    if (today !== firstDay) {
      previous = (
        <button
          onClick={() =>
            userDispatch({
              type: 'displayDate',
              payload: {date: new Date(today - day), month, year},
            })
          }
        >
          ◀️
        </button>
      );
    }
    if (today !== lastDay) {
      next = (
        <button
          onClick={() =>
            userDispatch({
              type: 'displayDate',
              payload: {date: new Date(today + day), month, year},
            })
          }
        >
          ▶️
        </button>
      );
    }
  }

  return (
    <>
      {date ? (
        <>
          <h3 className="eventDateDisplay" ref={scrollToRef}>
            {previous}
            {getMonthName(month) || formatDate(date)}
            {next}
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
