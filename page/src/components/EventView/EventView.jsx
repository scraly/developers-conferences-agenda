import ShortDate from 'components/ShortDate/ShortDate';
import {flag} from 'country-emoji';

import './EventView.css';

const EventView = ({event}) => {
  return (
    <p className="eventView">
      <ShortDate dates={event.date} />
      <b>{event.name}</b>
      <span>
        {event.hyperlink ? <a href={event.hyperlink}>{new URL(event.hyperlink).hostname}</a> : ''}
      </span>
      <span>{event.country !== 'Online' ? flag(event.country) : '🌎'}</span>
      <span className="location">{event.location}</span>
      {event.closedCaptions ? (
        <span>
          <img
            alt="Closed Captions"
            src="https://img.shields.io/static/v1?label=CC&message=Closed%20Captions&color=blue"
          />
        </span>
      ) : null}
      <span dangerouslySetInnerHTML={{__html: event.misc}} />
    </p>
  );
};

export default EventView;
