const getCountText = (events, onlineOnlyEvents) => {
  const count = events.length - onlineOnlyEvents.length;
  if (count > 0) {
    const plural = count > 1 ? 's' : '';
    let result = `${count} event${plural}`;
    if (onlineOnlyEvents.length > 0) {
      const plural = onlineOnlyEvents.length > 1 ? 's' : '';
      result += ` (omitted ${onlineOnlyEvents.length} online only event${plural})`;
    }
    return result;
  }
  return 'no event';
};

const EventCount = ({events, isMap}) => {
  if (isMap) {
    const onlineOnlyEvents = events.filter(e => e.location === 'Online');
    return getCountText(events, onlineOnlyEvents);
  }
  return getCountText(events, []);
};
export default EventCount;
