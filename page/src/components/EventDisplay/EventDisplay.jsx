import 'styles/EventDisplay.css';
import {formatEventDates} from './EventDisplay.utils';
import FavoriteButton from '../FavoriteButton/FavoriteButton';
import { useFavoritesContext } from '../../contexts/FavoritesContext';
import { flag } from 'country-emoji';
import ShortDate from 'components/ShortDate/ShortDate';
import TagBadges from 'components/TagBadges/TagBadges';
import { useFilters } from 'app.hooks';

const EventDisplay = ({name, hyperlink, location, misc, closedCaptions, date, dateOnTop=false, country, tags, sponsoring, attendees, discount}) => {
  const event = {name, hyperlink, location, misc, closedCaptions, date, country, tags, sponsoring, attendees, discount};
  const eventId = `${name}-${date[0]}`;
  const { isFavorite } = useFavoritesContext();
  const isFav = isFavorite(eventId);
  const { toggleTag } = useFilters();

  const handleTagClick = (key, value) => {
    toggleTag(key, value);
  };
  
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
          <span className="countryFlag">
            {country !== 'Online' ? flag(country) : '🌎'}
          </span>
          <span className="countryName">{location}</span>
        </div>

        {attendees ? (
          <div className="attendees">
            👥 {attendees} attendees
          </div>
        ) : null}

        {/* Discount code display */}
        {event.discount && (
          <div className="event-discount">
            <strong>Discount code:</strong> {event.discount.code}
            {event.discount.percentage && <> ({event.discount.percentage}</>}
            {event.discount.until && <> until {event.discount.until}</>}
            {(event.discount.percentage || event.discount.until) && <> )</>}
          </div>
        )}

        {sponsoring ? <span><a class="sponsoring" href={sponsoring} rel="noreferrer" target="_blank">💰</a></span> : null}
        <p className="cfp" dangerouslySetInnerHTML={{__html: misc}} />
        {closedCaptions ? <span><img alt="Closed Captions" src="https://img.shields.io/static/v1?label=CC&message=Closed%20Captions&color=blue" /></span> : null}
        <TagBadges onTagClick={handleTagClick} tags={tags} />
      </div>
    </div>
  );
};

export default EventDisplay;
