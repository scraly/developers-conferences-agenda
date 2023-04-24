import Day from 'components/Day/Day';
import Week from 'components/Week/Week';
import {useMemo, useState} from 'react';

import 'styles/Calendar.css';
import {daysToWeeks} from './Calendar.utils';
import {useCustomContext} from 'app.context';

const MonthsName = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DaysName = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const Calendar = ({month, days}) => {
  const [daysEvents, setDaysEvents] = useState(null);
  const [events, setEvents] = useState([]);
  const userDispatch = useCustomContext().userDispatch;

  useMemo(() => {
    const events = [];
    setDaysEvents(
      daysToWeeks(days).map((week, w) => (
        <Week key={`week_${w}`}>
          {week.map((day, i) => {
            if (day.events) {
              day.events.map(e => events.push(e));
            }
            return <Day key={`day_${i}`} date={day.date} events={day.events} />;
          })}
        </Week>
      ))
    );
    setEvents([...new Map(events.map(item => [item.name, item])).values()]);
  }, [days]);

  return (
    <div>
      <div
        className="header"
        onClick={() =>
          userDispatch({
            type: 'define',
            payload: {events, selectedDate: new Date(), month: MonthsName[month]},
          })
        }
      >
        <span>{MonthsName[month]}</span>
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
