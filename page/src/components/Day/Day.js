import {useCustomContext} from 'app.context';
import {useMemo, useState} from 'react';

const Day = ({date}) => {
  const context = useCustomContext();
  const [intensity, setIntensity] = useState('');
  const [invisible, setInvible] = useState('invisible');

  useMemo(() => {
    if (date) {
      if (
        window.dev_events[date.getFullYear()] &&
        window.dev_events[date.getFullYear()][date.getMonth()] &&
        window.dev_events[date.getFullYear()][date.getMonth()][date.getDate()]
      ) {
        setIntensity(
          ` intensity-${Math.min(
            window.dev_events[date.getFullYear()][date.getMonth()][date.getDate()].length,
            10
          )}`
        );
      }
      setInvible('');
    }
  }, [date]);

  return (
    <div
      className={'date' + invisible + intensity}
      onClick={() =>
        context.userDispatch({type: 'displayDate', payload: {date: date, month: null, year: null}})
      }
    >
      {date?.getDate() || ''}
    </div>
  );
};

export default Day;
