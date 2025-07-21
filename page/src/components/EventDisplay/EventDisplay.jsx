import 'styles/EventDisplay.css';
import {formatEventDates} from './EventDisplay.utils';
import FavoriteButton from '../FavoriteButton/FavoriteButton';
import { useFavoritesContext } from '../../contexts/FavoritesContext';
import { flag } from 'country-emoji';
import ShortDate from 'components/ShortDate/ShortDate';

const EventDisplay = ({name, hyperlink, location, misc, closedCaptions, date, dateOnTop=false, country}) => {
  const event = {name, hyperlink, location, misc, closedCaptions, date, country};
  const eventId = `${name}-${date[0]}`;
  const { isFavorite } = useFavoritesContext();
  const isFav = isFavorite(eventId);
  
  return (
    <div className={`eventCell ${isFav ? 'favorite-event' : ''}`}>
      {dateOnTop ? <span className="when">{formatEventDates(date)}</span> : null}
      <div className="content">
        <span className="when"><ShortDate dates={date} /></span>

        <div className="event-header">
          <b>{hyperlink ? <a className="title" href={hyperlink} rel="noreferrer" target="_blank">{name}</a> : ''}</b>
          <FavoriteButton event={event} />
        </div>
        <div className="country">
            <span className="countryFlag">{country != "Online" ? flag(country) : '🌎'}</span>
            <span className="countryName">{location}</span>
        </div>
        <p className="cfp" dangerouslySetInnerHTML={{__html: misc}} />
        {closedCaptions ? <span><img alt="Closed Captions" src="https://img.shields.io/static/v1?label=CC&message=Closed%20Captions&color=blue" /></span> : null}
      </div>
    </div>
  );
};

export default EventDisplay;
