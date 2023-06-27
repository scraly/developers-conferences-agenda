import Day from 'components/Day/Day';
import Week from 'components/Week/Week';
import {useMemo, useState} from 'react';

import 'styles/Calendar.css';
import {daysToWeeks} from './Calendar.utils';
import {useCustomContext} from 'app.context';
import {getMonthName} from 'utils';

const DaysName = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const Calendar = ({year, month, days}) => {
  const [daysEvents, setDaysEvents] = useState(null);
  const userDispatch = useCustomContext().userDispatch;

  useMemo(() => {
    setDaysEvents(
      daysToWeeks(days).map((week, w) => (
        <Week key={`week_${w}`}>
          {week.map((day, d) => {
            return <Day key={`day_${d}`} date={day} />;
          })}
        </Week>
      ))
    );
  }, [days]);

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
      <div className="weeks">{daysEvents}</div>
    </div>
  );
};

export default Calendar;
