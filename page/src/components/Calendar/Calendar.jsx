import Day from 'components/Day/Day';
import Week from 'components/Week/Week';
import {useMemo} from 'react';

import 'styles/Calendar.css';
import {daysToWeeks} from './Calendar.utils';
import {useCustomContext} from 'app.context';
import {useYearEvents, useMonthEvents} from 'app.hooks';
import {getMonthName} from 'utils';

const DaysName = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const Calendar = ({year, month, days}) => {
  const userDispatch = useCustomContext().userDispatch;
  const yearEvents = useYearEvents()
  const monthEvents = useMonthEvents(yearEvents, month)

  const weeks = useMemo(() => daysToWeeks(days), [days]);
  const weeksAndDays = useMemo(() => weeks.map((week, w) => {
      return {id: w, days: week.map((day, d) => ({day: day, id: d}))}
  }), [weeks]);

  return (
    <div>
      <div
        className="header"
        onClick={() =>
          userDispatch({
            type: 'displayDate',
            payload: {date: new Date(), month: month, year: year},
          })
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
