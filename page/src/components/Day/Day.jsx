import {useDayEvents} from 'app.hooks';
import {useNavigate, useSearchParams, useParams} from 'react-router-dom';

const Day = ({date, events}) => {
  const dayEvents = useDayEvents(events, date);
  const navigate = useNavigate();
  const {year} = useParams();
  const [searchParams] = useSearchParams();

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
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <div
      className={`date${invisible}${intensity}`}
      onClick={() => navigate(`/${year}/calendar/-1/${date.getTime()}?${searchParams.toString()}`)}
    >
      {date?.getDate() || ''}
    </div>
  );
};

export default Day;
