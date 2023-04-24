import {useMemo, useState} from 'react';

import Calendar from 'components/Calendar/Calendar';

import 'styles/CalendarGrid.css';
import {DayRange, getEventsOnDate} from './CalendarGrid.utils';

const CalendarGrid = ({year}) => {
  const [months, setMonths] = useState([]);

  useMemo(() => {
    // Iterate month
    let months = [];
    for (let m = 0; m < 12; m++) {
      let days = [];
      // Iterate days
      let startDate = new Date(Date.UTC(year, m));
      let endDate = new Date(Date.UTC(year, m + 1));
      for (const dayDate of DayRange(startDate, endDate)) {
        days.push({
          date: dayDate,
          events: getEventsOnDate(dayDate),
        });
      }

      months.push({
        days,
        month: m,
      });
    }
    setMonths(months.map((m, i) => <Calendar key={`month_${i}`} {...m} />));
  }, [year]);

  return <div className="calendarGrid">{months}</div>;
};

export default CalendarGrid;
