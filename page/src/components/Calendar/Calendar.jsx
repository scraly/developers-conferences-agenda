import Day from 'components/Day/Day';
import Week from 'components/Week/Week';
import {useMemo} from 'react';
import {useNavigate, useSearchParams, useParams} from 'react-router-dom';

import 'styles/Calendar.css';
import {daysToWeeks} from './Calendar.utils';
import {useYearEvents, useMonthEvents} from 'app.hooks';
import {getMonthName} from 'utils';

const DaysName = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const Calendar = ({month, days}) => {
  const pageView = "calendar";
  const yearEvents = useYearEvents(pageView)
  const monthEvents = useMonthEvents(yearEvents, month)
  const navigate = useNavigate();
  const {year} = useParams();
  const [searchParams] = useSearchParams();

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
        <span>{getMonthName(month)}</span>
      </div>
      <div className="dayList">
        {DaysName.map((d, i) => (
          <span key={`d_${i}`}>{d}</span>
        ))}
      </div>
      <div className="weeks">
        {weeksAndDays.map((week) => (
            <Week key={`week_${week.id}`}>
                {week.days.map((day) => (<Day key={`day_${day.id}`} date={day.day} events={monthEvents}/>))}
            </Week>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
