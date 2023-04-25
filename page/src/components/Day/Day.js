import {useCustomContext} from 'app.context';
import {useMemo, useState} from 'react';

const Day = ({date}) => {
  const userDispatch = useCustomContext().userDispatch;
  const [intensity, setIntensity] = useState('');
  const [invisible, setInvisible] = useState('invisible');

  useMemo(() => {
    if (date) {
      if (
        window.dev_events &&
        window.dev_events[date.getFullYear()] &&
        window.dev_events[date.getFullYear()][date.getMonth()] &&
        window.dev_events[date.getFullYear()][date.getMonth()][date.getDate()]
      ) {
        setIntensity(
          ` intensity-${Math.min(
            window.dev_events[date.getFullYear()][date.getMonth()][date.getDate()].length,
            7
          )}`
        );
      }
      setInvisible('');
    } else {
      setIntensity('');
      setInvisible('invisible');
    }
  }, [date]);

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
