import {useDayEvents, useMonthEvents, useYearEvents} from 'app.hooks';
import {useParams} from 'react-router-dom';
import 'styles/SelectedEvents.css';
import {formatDate, getMonthName} from '../../utils';
import EventCount from '../EventCount/EventCount';
import EventDisplay from '../EventDisplay/EventDisplay';

const SelectedEvents = ({onClose}) => {
  const {month, date} = useParams();

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
