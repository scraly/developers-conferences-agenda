import {useMemo, useState} from 'react';

import Calendar from 'components/Calendar/Calendar';

import 'styles/CalendarGrid.css';

const CalendarGrid = ({year}) => {
  const [months, setMonths] = useState([]);

  useMemo(() => {
    // Iterate month
    let months = [];
    for (let m = 0; m < 12; m++) {
      const days = [];
      const nbDays = new Date(year, m + 1, 0).getDate();
      for (let i = 1; i <= nbDays; i++) {
        days.push(new Date(year, m, i));
      }
      months.push(<Calendar key={`month_${m}`} year={year} month={m} days={days} />);
    }
    setMonths(months);
  }, [year]);

  return <div className="calendarGrid">{months}</div>;
};

export default CalendarGrid;
