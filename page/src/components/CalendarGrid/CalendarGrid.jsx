import {useMemo} from 'react';

import Calendar from 'components/Calendar/Calendar';

import 'styles/CalendarGrid.css';

const CalendarGrid = ({year}) => {
  const months = useMemo(() => {
    // Iterate month
    let months = [];
    for (let m = 0; m < 12; m++) {
      const days = [];
      const nbDays = new Date(year, m + 1, 0).getDate();
      for (let i = 1; i <= nbDays; i++) {
        days.push(new Date(Date.UTC(year, m, i)));
      }
      months.push({month: m, days});
    }
    return months;
  }, [year]);

  return (
    <div className="calendarGrid">
      {months.map((m) => <Calendar days={m.days} key={`month_${m.month}`} month={m.month} />)}
    </div>
  );
};

export default CalendarGrid;
