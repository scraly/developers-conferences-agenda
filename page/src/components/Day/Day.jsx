import {useCustomContext} from 'app.context';
import {filterEvents} from 'utils';

const Day = ({date}) => {
  const {userState, userDispatch} = useCustomContext()
  let intensity = '';
  let invisible = 'invisible';

  let events = date && window.dev_events &&
      window.dev_events[date.getFullYear()] &&
      window.dev_events[date.getFullYear()][date.getMonth()] &&
      window.dev_events[date.getFullYear()][date.getMonth()][date.getDate()] || []

  events = filterEvents(events, userState.filters.callForPapers, userState.filters.closedCaptions, userState.filters.country, userState.filters.query)

  if (date) {
    if (events.length > 0) {
      intensity = ` intensity-${Math.min(
        events.length,
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
        userDispatch({type: 'displayDate', payload: {date: date, month: -1, year: null}})
      }
    >
      {date?.getDate() || ''}
    </div>
  );
};

export default Day;
