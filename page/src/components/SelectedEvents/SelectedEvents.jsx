import {useRef, useEffect, useState, useCallback} from 'react';
import {useNavigate, useSearchParams, useParams} from 'react-router-dom';
import 'styles/SelectedEvents.css';
import EventDisplay from '../EventDisplay/EventDisplay';
import EventCount from '../EventCount/EventCount';
import {formatDate, getMonthName} from '../../utils';
import {useMonthEvents, useDayEvents, useYearEvents} from 'app.hooks';
import {ArrowLeftCircle, ArrowRightCircle} from 'lucide-react';

const SelectedEvents = ({onClose}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {year, month, date} = useParams();
  const [page, setPage] = useState(1); // Pagination for infinite scroll
  const [hasMore, setHasMore] = useState(true);

  let currentMonth = parseInt(month, 10);
  if (Number.isNaN(currentMonth)) {
    currentMonth = -1;
  }

  let currentDate;
  if (date !== undefined) {
    currentDate = new Date(parseInt(date, 10));
  }

  const yearEvents = useYearEvents();
  const monthEvents = useMonthEvents(
    yearEvents,
    currentMonth !== -1 ? currentMonth : currentDate.getMonth()
  );
  const dayEvents = useDayEvents(monthEvents, currentDate);
  const events = currentMonth !== -1 ? monthEvents : dayEvents;

  // Infinite scroll handler
  const observer = useRef();
  const lastEventElementRef = useCallback(
    node => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          setPage(prevPage => prevPage + 1); // Load more events
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore]
  );

  // Fake loading more events
  useEffect(() => {
    // Assuming fetchMoreEvents would get the next set of events
    if (page > 1) {
      // Simulate API call for more events
      const moreEvents = []; // Replace this with actual API call logic
      if (moreEvents.length === 0) {
        setHasMore(false);
      } else {
        // Append fetched events to the existing events
        // setEvents([...events, ...moreEvents]);
      }
    }
  }, [page]);

  return (
    <div className="modal-content">
      <div className="modal-header">
        <h3 className="modal-title">{getMonthName(currentMonth) || formatDate(currentDate)}</h3>
        <button className="close-button" onClick={onClose}>
          X
        </button>
      </div>

      <EventCount events={events} />
      <div className="eventsGridDisplay">
        {events.length ? (
          events.map((e, i) => (
            <EventDisplay
              key={`ev_${i}`}
              {...e}
              ref={i === events.length - 1 ? lastEventElementRef : null} // Last element for infinite scroll
            />
          ))
        ) : (
          <p>No events found for this day</p>
        )}
      </div>
    </div>
  );
};

export default SelectedEvents;
