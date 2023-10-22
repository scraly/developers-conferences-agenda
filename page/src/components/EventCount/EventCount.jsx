import {useMemo} from 'react';
import {filterEvents} from '../../utils';
import {useCustomContext} from 'app.context';

const getCountText = count => {
  if (count) {
    const plural = count > 1 ? 's' : '';
    return `${count} event${plural}`;
  }
  return 'no event';
};

const EventCount = ({events}) => {
  const {userState} = useCustomContext();
  const filteredEvents = useMemo(() => filterEvents(events, userState.filters.callForPapers, userState.filters.closedCaptions, userState.filters.country, userState.filters.query), [userState, events]);
  return <p className="eventCount">{getCountText(filteredEvents.length)}</p>;
};
export default EventCount;
