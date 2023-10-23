import {useRef, useEffect} from 'react';

import 'styles/SelectedEvents.css';
import EventDisplay from '../EventDisplay/EventDisplay';
import EventCount from '../EventCount/EventCount'
import {formatDate, getMonthName} from '../../utils';
import {useCustomContext} from 'app.context';
import {useMonthEvents, useDayEvents, useYearEvents} from 'app.hooks';
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';

const SelectedEvents = ({year, month, date}) => {
  const {userState, userDispatch} = useCustomContext();

  const scrollToRef = useRef();

  const yearEvents = useYearEvents()
  const monthEvents = useMonthEvents(yearEvents, userState.month != -1 ? userState.month : userState.date.getMonth())
  const dayEvents = useDayEvents(monthEvents, userState.date)
  const events = userState.month != -1 ?  monthEvents : dayEvents;

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
            <div className="eventsGridDisplay">
              {events.length ? (
                events.map((e, i) => <EventDisplay key={`ev_${i}`} {...e} />)
              ) : (
                <p>No event found for that day</p>
              )}
          </div>
        </>
      ) : (
        ''
      )}
    </>
  );
};

export default SelectedEvents;
