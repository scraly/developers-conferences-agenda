import {useRef, useEffect} from 'react';
import {useNavigate, useSearchParams, useParams} from 'react-router-dom';
import EventCount from '../EventCount/EventCount';
import {formatDate, getMonthName} from '../../utils';
import {useMonthEvents, useDayEvents, useYearEvents} from 'app.hooks';
import {ArrowLeftCircle, ArrowRightCircle} from 'lucide-react';
import EventView from 'components/EventView/EventView';
import slugify from 'slugify';

const SelectedEvents = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {year, month, date} = useParams();

  let currentMonth = Number.parseInt(month, 10);
  if (Number.isNaN(month)) {
    currentMonth = -1;
  }

  let currentDate;
  if (date !== undefined) {
    currentDate = new Date(Number.parseInt(date, 10));
  }

  const scrollToRef = useRef();

  const yearEvents = useYearEvents();
  const monthEvents = useMonthEvents(
    yearEvents,
    currentMonth !== -1 ? currentMonth : currentDate.getMonth()
  );
  const dayEvents = useDayEvents(monthEvents, currentDate);
  const events = currentMonth !== -1 ? monthEvents : dayEvents;

  useEffect(() => {
    setTimeout(() => {
      scrollToRef.current?.scrollIntoView({behavior: 'smooth'});
    }, 100);
  }, []);

  let previous = '';
  let next = '';
  if (currentMonth !== -1 && year) {
    if (currentMonth > 0)
      previous = (
        <ArrowLeftCircle
          onClick={() =>
            navigate(`/${year}/calendar/${currentMonth - 1}/0?${searchParams.toString()}`)
          }
        />
      );
    if (currentMonth < 11)
      next = (
        <ArrowRightCircle
          onClick={() =>
            navigate(`/${year}/calendar/${currentMonth + 1}/0?${searchParams.toString()}`)
          }
        />
      );
  } else if (currentDate) {
    const dateYear = currentDate.getFullYear();
    const firstDay = new Date(dateYear, 0, 1).getTime();
    const lastDay = new Date(dateYear, 12, 0).getTime();
    const today = currentDate.getTime();
    const day = 24 * 60 * 60 * 1000;
    if (today !== firstDay) {
      previous = (
        <ArrowLeftCircle
          onClick={() =>
            navigate(`/${year}/calendar/${currentMonth}/${today - day}?${searchParams.toString()}`)
          }
        />
      );
    }
    if (today !== lastDay) {
      next = (
        <ArrowRightCircle
          onClick={() =>
            navigate(`/${year}/calendar/${currentMonth}/${today + day}?${searchParams.toString()}`)
          }
        />
      );
    }
  }

  return (
    <>
      {currentDate ? (
        <>
          <h3 className="eventDateDisplay" ref={scrollToRef}>
            {previous}
            <span>{getMonthName(currentMonth) || formatDate(currentDate)}</span>
            {next}
          </h3>
          <EventCount events={events} />
          <div className="eventsGridDisplay">
            {events.length ? (
              events.map((e, i) => <EventView event={e} key={`ev_${slugify(JSON.stringify(e))}`} />)
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
