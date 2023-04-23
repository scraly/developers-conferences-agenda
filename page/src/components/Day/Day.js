import {useCustomContext} from 'app.context';

const Day = ({date, events}) => {
  const userDispatch = useCustomContext().userDispatch;

  let invisible = date?.getDate() ? '' : ' invisible';
  let intensity = events?.length ?? 0;

  if (intensity > 10) intensity = 10;
  intensity = ` intensity-${intensity}`;

  return (
    <div
      className={'date' + invisible + intensity}
      onClick={() => userDispatch({type: 'define', payload: {events, selectedDate: date}})}
    >
      {date?.getDate() || ''}
    </div>
  );
};

export default Day;
