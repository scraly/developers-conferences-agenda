import {useCustomContext} from 'app.context';

const Day = ({date, events}) => {
  const userDispatch = useCustomContext().userDispatch;

  const invisible = date?.getDate() ? '' : ' invisible';
  const intensity = ` intensity-${Math.min(events?.length ?? 0, 10)}`;

  return (
    <div
      className={'date' + invisible + intensity}
      onClick={() =>
        userDispatch({type: 'define', payload: {events, selectedDate: date, month: false}})
      }
    >
      {date?.getDate() || ''}
    </div>
  );
};

export default Day;
