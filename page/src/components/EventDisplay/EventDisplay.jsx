import 'styles/EventDisplay.css';
import {formatEventDates} from './EventDisplay.utils';

const EventDisplay = ({name, hyperlink, location, misc, closedCaptions, date, dateOnTop=false}) => {
  return (
    <div className="eventCell">
      {dateOnTop ? <span className="when">{formatEventDates(date)}</span> : null}
      <div className="content">
        <b>{name}</b>
        {hyperlink ? <a href={hyperlink}>{new URL(hyperlink).hostname}</a> : ''}
        <span>{location}</span>
        <p dangerouslySetInnerHTML={{__html: misc}} />
        {closedCaptions ? <span><img alt="Closed Captions" src="https://img.shields.io/static/v1?label=CC&message=Closed%20Captions&color=blue" /></span> : null}
      </div>
      {!dateOnTop ? <span className="when">{formatEventDates(date)}</span> : null}
    </div>
  );
};

export default EventDisplay;
