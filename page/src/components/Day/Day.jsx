import {useDayEvents} from 'app.hooks';
import { formatDate } from 'utils';

const Day = ({date, events, openModal}) => {
  const dayEvents = useDayEvents(events, date);

  let intensity = '';
  let invisible = 'invisible';

  if (date) {
    if (dayEvents.length > 0) {
      intensity = ` intensity-${Math.min(dayEvents.length, 7)}`;
    }
    invisible = '';
  } else {
    intensity = '';
    invisible = 'invisible';
  }

  return (
    <div
      className={`date ${invisible} ${intensity}`}
      onClick={() => openModal(formatDate(date), dayEvents)} 
    >
      {date?.getDate() || ''}
    </div>
  );
};

export default Day;
