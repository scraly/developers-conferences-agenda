import {useMemo, useRef, useState, useEffect} from 'react';

import 'styles/SelectedEvents.css';
import EventDisplay from '../EventDisplay/EventDisplay';
import EventCount from '../EventCount/EventCount'
import {filterEvents, formatDate, getMonthName} from '../../utils';
import {useCustomContext} from 'app.context';
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';

const SelectedEvents = ({year, month, date}) => {
  const {userState, userDispatch} = useCustomContext();
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

    events = filterEvents(events, userState.filters.callForPapers, userState.filters.closedCaptions, userState.filters.query)

    events = [...new Map(events.map(item => [item.name, item])).values()];
    setEvents(
      events.length ? (
        events.map((e, i) => <EventDisplay key={`ev_${i}`} {...e} />)
      ) : (
        <p>No event found for that day</p>
      )
    );
  }, [year, month, date, userState.filters]);

  useEffect(() => {
    setTimeout(() => {
      scrollToRef.current?.scrollIntoView({behavior: 'smooth'});
    }, 100);
  }, [date, month, year]);

  let previous = '',
    next = '';
  if (month !== -1 && year) {
    if (month > 0)
      previous = (
        <ArrowLeftCircle
          onClick={() =>
            userDispatch({type: 'displayDate', payload: {date, month: month - 1, year}})
          }
        />
      );
    if (month < 11)
      next = (
        <ArrowRightCircle
          onClick={() =>
            userDispatch({type: 'displayDate', payload: {date, month: month + 1, year}})
          }
        />
      );
  } else if (date) {
    const dateYear = date.getFullYear();
    const firstDay = new Date(dateYear, 0, 1).getTime();
    const lastDay = new Date(dateYear, 12, 0).getTime();
    const today = date.getTime();
    const day = 24 * 60 * 60 * 1000;
    if (today !== firstDay) {
      previous = (
        <ArrowLeftCircle
          onClick={() =>
            userDispatch({
              type: 'displayDate',
              payload: {date: new Date(today - day), month, year},
            })
          }
        />
      );
    }
    if (today !== lastDay) {
      next = (
        <ArrowRightCircle
          onClick={() =>
            userDispatch({
              type: 'displayDate',
              payload: {date: new Date(today + day), month, year},
            })
          }
        />
      );
    }
  }

  return (
    <>
      {date ? (
        <>
          <h3 className="eventDateDisplay" ref={scrollToRef}>
            {previous}
            <span>{getMonthName(month) || formatDate(date)}</span>
            {next}
            </h3>
            <EventCount events={events} />
          <div className="eventsGridDisplay">{events}</div>
        </>
      ) : (
        ''
      )}
    </>
  );
};

export default SelectedEvents;
