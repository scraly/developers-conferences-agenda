import Day from 'components/Day/Day';
import Week from 'components/Week/Week';
import {useMemo} from 'react';
import {useNavigate, useSearchParams, useParams} from 'react-router-dom';

import 'styles/Calendar.css';
import {daysToWeeks} from './Calendar.utils';
import {useYearEvents, useMonthEvents} from 'app.hooks';
import {getMonthName, getTranslatedMonthName} from 'utils';
import {useTranslation} from 'contexts/LanguageContext';


const Calendar = ({month, days}) => {
  const yearEvents = useYearEvents()
  const monthEvents = useMonthEvents(yearEvents, month)
  const navigate = useNavigate();
  const {year} = useParams();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const DaysName = [
    t('calendar.daysMo'),
    t('calendar.daysTu'),
    t('calendar.daysWe'),
    t('calendar.daysTh'),
    t('calendar.daysFr'),
    t('calendar.daysSa'),
    t('calendar.daysSu')
  ];

  const weeks = useMemo(() => daysToWeeks(days), [days]);
  const weeksAndDays = useMemo(() => weeks.map((week, w) => {
      return {id: w, days: week.map((day, d) => ({day: day, id: d}))}
  }), [weeks]);

  return (
    <div>
      <div
        className="header"
        onClick={() =>
          navigate(`/${year}/calendar/${month}/0?${searchParams.toString()}`)
        }
      >
        <span>{getTranslatedMonthName(month, t)}</span>
      </div>
      <div className="dayList">
        {DaysName.map((d, i) => (
          <span key={`d_${i}`}>{d}</span>
        ))}
      </div>
      <div className="weeks">
        {weeksAndDays.map((week) => (
            <Week key={`week_${week.id}`}>
                {week.days.map((day) => (<Day date={day.day} events={monthEvents} key={`day_${day.id}`}/>))}
            </Week>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
