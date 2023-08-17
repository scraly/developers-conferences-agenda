const getCountText = count => {
  if (count) {
    const plural = count > 1 ? 's' : '';
    return `${count} event${plural}`;
  }
  return 'no event';
};

const EventCount = ({events}) => {
  return <p className="eventCount">{getCountText(events.length)}</p>;
};
export default EventCount;
