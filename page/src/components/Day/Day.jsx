import {useDayEvents} from 'app.hooks';
import {useNavigate, useSearchParams, useParams} from 'react-router-dom';

export function dayEventFilterFactory(search, date) {
    // TODO: Make these boolean searchParams boolean, not strings.
    let { showEventsMode0, showEventsMode1, showEventsMode2 } = search;
  if (showEventsMode0 === undefined) {
    showEventsMode0 = 'true';
  }

  return function (event) {
    const start = new Date(event.date[0]);
    const end = new Date(event.date[1]);
    const hrs = 1000 * 60 * 60 * 24 - 1000; // 24 hours - 1 second
    // edgeOfDay is crucial to prevent excess marks from appearing because of
    // events ending above 00:00:00.000.
    // For example, an event is expected to end at 11am. 0am < 11am will be evaluated as 'true'.
    // but to mark the end of an event is the work of mode2, not mode1.
    const edgeOfDay = end ? date.getTime() + hrs : 0;

    if (showEventsMode0 == 'true' && start.toDateString() == date.toDateString()) return true;
    if (showEventsMode1 == 'true' && end && start < date && edgeOfDay < end) return true;
    // TODO: One-day events ends at the same day, it should be included as well.
    if (showEventsMode2 == 'true' && end && end.toDateString() == date.toDateString()) return true;
    // if (showEventsMode2 == 'true' && event.date.length == 1 && start.toDateString() == date.toDateString()) return true;

    return false;
  };
}

const Day = ({date, events}) => {
  const dayEvents = useDayEvents(events, date)
  const navigate = useNavigate();
  const {year} = useParams();
  const [searchParams] = useSearchParams();
  const search = Object.fromEntries(searchParams);

  let intensity = '';
  let invisible = 'invisible';

  if (date) {
    if (dayEvents.length > 0) {
      intensity = ` intensity-${Math.min(
        dayEvents.filter(dayEventFilterFactory(search, date)).length,
        7
      )}`;
    }
    invisible = '';
  } else {
    intensity = '';
    invisible = 'invisible';
  }

  return (
    <div
      className={'date' + invisible + intensity}
      onClick={() =>
        navigate(`/${year}/calendar/-1/${date.getTime()}?${searchParams.toString()}`)
      }
    >
      {date?.getDate() || ''}
    </div>
  );
};

export default Day;
