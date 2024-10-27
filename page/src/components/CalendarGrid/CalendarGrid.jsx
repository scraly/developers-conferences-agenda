import {useMemo} from 'react';
import Calendar from 'components/Calendar/Calendar';
import 'styles/CalendarGrid.css';

const CalendarGrid = ({year, openModal}) => {
  const months = useMemo(() => {
    // Iterate month
    let months = [];
    for (let m = 0; m < 12; m++) {
      const days = [];
      const nbDays = new Date(year, m + 1, 0).getDate();
      for (let i = 1; i <= nbDays; i++) {
        days.push(new Date(year, m, i));
      }
      months.push({month: m, days});
    }
    return months;
  }, [year]);

  // Function to handle day click
  const handleDayClick = (day, events) => {
    openModal(day, events);
  };

  return (
    <div className="calendarGrid">
      {months.map(m => (
        <Calendar
          key={`month_${m.month}`}
          month={m.month}
          days={m.days}
          openModal={handleDayClick}
        />
      ))}
    </div>
  );
};

export default CalendarGrid;
