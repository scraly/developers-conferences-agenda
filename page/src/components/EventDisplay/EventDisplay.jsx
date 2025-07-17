import 'styles/EventDisplay.css';
import {formatEventDates} from './EventDisplay.utils';
import FavoriteButton from '../FavoriteButton/FavoriteButton';
import { useFavoritesContext } from '../../contexts/FavoritesContext';

const EventDisplay = ({name, hyperlink, location, misc, closedCaptions, date, dateOnTop=false}) => {
  const event = {name, hyperlink, location, misc, closedCaptions, date};
  const eventId = `${name}-${date[0]}`;
  const { isFavorite } = useFavoritesContext();
  const isFav = isFavorite(eventId);
  
  return (
    <div className={`eventCell ${isFav ? 'favorite-event' : ''}`}>
      {dateOnTop ? <span className="when">{formatEventDates(date)}</span> : null}
      <div className="content">
        <div className="event-header">
          <b>{name}</b>
          <FavoriteButton event={event} />
        </div>
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
