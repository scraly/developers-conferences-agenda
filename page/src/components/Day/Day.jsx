import {useDayEvents} from 'app.hooks';
import {useCustomContext} from 'app.context';

const Day = ({date}) => {
  const {userDispatch} = useCustomContext()
  const events = useDayEvents(date)

  let intensity = '';
  let invisible = 'invisible';

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
        userDispatch({type: 'displayDate', payload: {date: date, month: -1, year: date.getFullYear()}})
      }
    >
      {date?.getDate() || ''}
    </div>
  );
};

export default Day;
