import {useRef, useEffect} from 'react';
import {useNavigate, useSearchParams, useParams} from 'react-router-dom';

import 'styles/SelectedEvents.css';
import EventDisplay from '../EventDisplay/EventDisplay';
import EventCount from '../EventCount/EventCount'
import {createUTCDate, formatDate, getTranslatedMonthName, getUTCMonth, getUTCYear} from '../../utils';
import {useMonthEvents, useDayEvents, useYearEvents} from 'app.hooks';
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';
import { useTranslation } from 'contexts/LanguageContext';

const SelectedEvents = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {year, month, date} = useParams();

  const parsedDate = parseInt(date, 10);
  const currentDate = Number.isNaN(parsedDate) ? undefined : new Date(parsedDate);

  const parsedMonth = parseInt(month, 10);
  const isDayView = parsedMonth === -1 && !!currentDate;
  let currentMonth = Number.isNaN(parsedMonth) ? -1 : parsedMonth;

  if (currentMonth === -1 && currentDate) {
    currentMonth = getUTCMonth(currentDate);
  }

  const resolvedMonth = currentMonth !== -1 ? currentMonth : (currentDate ? getUTCMonth(currentDate) : 0);

  const scrollToRef = useRef();

  const yearEvents = useYearEvents()
  const monthEvents = useMonthEvents(yearEvents, resolvedMonth)
  const dayEvents = useDayEvents(monthEvents, currentDate)
  const events = isDayView ? dayEvents : monthEvents;

  useEffect(() => {
    setTimeout(() => {
      scrollToRef.current?.scrollIntoView({behavior: 'smooth'});
    }, 100);
  }, [date, month, year]);

  let previous = '',
    next = '';
  if (!isDayView && currentMonth !== -1 && year) {
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
  } else if (isDayView && currentDate) {
    const dateYear = getUTCYear(currentDate);
    const firstDay = createUTCDate(dateYear, 0, 1).getTime();
    const lastDay = createUTCDate(dateYear, 11, 31).getTime();
    const today = currentDate.getTime();
    const day = 24 * 60 * 60 * 1000;
    if (today !== firstDay) {
      const previousDayMonth = getUTCMonth(new Date(today - day));
      previous = (
        <ArrowLeftCircle
          onClick={() =>
            navigate(`/${year}/calendar/${previousDayMonth}/${today - day}?${searchParams.toString()}`)
          }
        />
      );
    }
    if (today !== lastDay) {
      const nextDayMonth = getUTCMonth(new Date(today + day));
      next = (
        <ArrowRightCircle
          onClick={() =>
            navigate(`/${year}/calendar/${nextDayMonth}/${today + day}?${searchParams.toString()}`)
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
            <span>{isDayView ? formatDate(currentDate) : getTranslatedMonthName(currentMonth, t)}</span>
            {next}
            </h3>
            <EventCount events={events} />
            <div className="eventsGridDisplay">
              {events.length ? (
                events.map((e, i) => <EventDisplay key={`ev_${i}`} {...e} />)
              ) : (
                <p>{t('event.noEventFoundForDay')}</p>
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
