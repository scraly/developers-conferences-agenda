import 'styles/EventDisplay.css';
import {formatEventDates} from './EventDisplay.utils';

const EventDisplay = ({name, hyperlink, location, misc, date}) => {
  return (
    <div className="eventCell">
      <b>{name}</b>
      {hyperlink ? <a href={hyperlink}>{new URL(hyperlink).hostname}</a> : ''}
      <span>{location}</span>
      <p dangerouslySetInnerHTML={{__html: misc}}></p>
      <span className="when">{formatEventDates(date)}</span>
    </div>
  );
};

export default EventDisplay;
