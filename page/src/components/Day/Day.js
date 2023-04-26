import {useCustomContext} from 'app.context';

const Day = ({date}) => {
  const userDispatch = useCustomContext().userDispatch;
  let intensity = '';
  let invisible = 'invisible';

  if (date) {
    if (
      window.dev_events &&
      window.dev_events[date.getFullYear()] &&
      window.dev_events[date.getFullYear()][date.getMonth()] &&
      window.dev_events[date.getFullYear()][date.getMonth()][date.getDate()]
    ) {
      intensity = ` intensity-${Math.min(
        window.dev_events[date.getFullYear()][date.getMonth()][date.getDate()].length,
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
