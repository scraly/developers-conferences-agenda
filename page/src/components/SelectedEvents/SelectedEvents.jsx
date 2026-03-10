import {useRef, useEffect} from 'react';
import {useNavigate, useSearchParams, useParams} from 'react-router-dom';

import 'styles/SelectedEvents.css';
import EventDisplay from '../EventDisplay/EventDisplay';
import EventCount from '../EventCount/EventCount'
import {formatDate, getTranslatedMonthName} from '../../utils';
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
  let currentMonth = Number.isNaN(parsedMonth) ? -1 : parsedMonth;

  if (currentMonth === -1 && currentDate) {
    currentMonth = currentDate.getMonth();
  }

  const resolvedMonth = currentMonth !== -1 ? currentMonth : (currentDate ? currentDate.getMonth() : 0);

  const scrollToRef = useRef();

  const yearEvents = useYearEvents()
  const monthEvents = useMonthEvents(yearEvents, resolvedMonth)
  const dayEvents = useDayEvents(monthEvents, currentDate)
  const events = currentMonth != -1 ?  monthEvents : dayEvents;

  useEffect(() => {
    setTimeout(() => {
      scrollToRef.current?.scrollIntoView({behavior: 'smooth'});
    }, 100);
  }, [date, month, year]);

  let previous = '',
    next = '';
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
      const previousDayMonth = new Date(today - day).getMonth();
      previous = (
        <ArrowLeftCircle
          onClick={() =>
            navigate(`/${year}/calendar/${previousDayMonth}/${today - day}?${searchParams.toString()}`)
          }
        />
      );
    }
    if (today !== lastDay) {
      const nextDayMonth = new Date(today + day).getMonth();
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
            <span>{getTranslatedMonthName(currentMonth, t) || formatDate(currentDate)}</span>
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
