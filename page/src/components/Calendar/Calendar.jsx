import Day from 'components/Day/Day';
import Week from 'components/Week/Week';
import {useMemo} from 'react';
import {useParams} from 'react-router-dom';

import {useMonthEvents, useYearEvents} from 'app.hooks';
import 'styles/Calendar.css';
import {getMonthName} from 'utils';
import {daysToWeeks} from './Calendar.utils';

const DaysName = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const Calendar = ({month, days, openModal}) => {
  const yearEvents = useYearEvents();
  const monthEvents = useMonthEvents(yearEvents, month);
  const {year} = useParams();

  const weeks = useMemo(() => daysToWeeks(days), [days]);
  const weeksAndDays = useMemo(
    () =>
      weeks.map((week, w) => {
        return {id: w, days: week.map((day, d) => ({day: day, id: d}))};
      }),
    [weeks]
  );

  return (
    <div>
      <div
        className="header"
        onClick={() => openModal(getMonthName(month) + ' ' + year, monthEvents)}
      >
        <span>{getMonthName(month)}</span>
      </div>
      <div className="dayList">
        {DaysName.map((d, i) => (
          <span key={`d_${i}`}>{d}</span>
        ))}
      </div>
      <div className="weeks">
        {weeksAndDays.map(week => (
          <Week key={`week_${week.id}`}>
            {week.days.map(day => (
              <Day
                key={`day_${day.id}`}
                date={day.day}
                events={monthEvents}
                openModal={openModal}
              />
            ))}
          </Week>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
