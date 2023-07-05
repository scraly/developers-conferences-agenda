import 'styles/EventDisplay.css';
import {formatEventDates} from './EventDisplay.utils';

const EventDisplay = ({name, hyperlink, location, misc, date}) => {
  return (
    <div className="eventCell">
      <div className="content">
        <b>{name}</b>
        {hyperlink ? <a href={hyperlink}>{new URL(hyperlink).hostname}</a> : ''}
        <span>{location}</span>
        <p dangerouslySetInnerHTML={{__html: misc}}></p>
      </div>
      <span className="when">{formatEventDates(date)}</span>
    </div>
  );
};

export default EventDisplay;
