import {useMemo, useRef, useState} from 'react';

import 'styles/SelectedEvents.css';
import EventDisplay from '../EventDisplay/EventDisplay';
import {formatDate} from './SelectedEvents.utils';

const SelectedEvents = ({events, date}) => {
  const [evnts, setEvnts] = useState(null);
  const scrollToRef = useRef();

  useMemo(() => {
    setEvnts(
      events?.length ? (
        events.map((e, i) => <EventDisplay key={`ev_${i}`} {...e} />)
      ) : (
        <p>No event found for that day</p>
      )
    );
    scrollToRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [events]);

  return (
    <>
      {date ? (
        <>
          <h3 className="eventDateDisplay" ref={scrollToRef}>
            {formatDate(date)}
          </h3>
          <div className="eventsGridDisplay">{evnts}</div>
        </>
      ) : (
        ''
      )}
    </>
  );
};

export default SelectedEvents;
