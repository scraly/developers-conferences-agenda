const getCountText = (count) => {
    console.log(`count: ${count}`);
    if (typeof count === 'undefined' || count === 0) return 'no event'
    if (count === 1) return '1 event'
    return `${count} events`
}

const EventCount = ({events}) => {
    console.log(`events: ${events}`);
    return (<p className='eventCount'>{getCountText(events.length)}</p>)
}
export default EventCount;
