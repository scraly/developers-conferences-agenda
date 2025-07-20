import 'styles/EventDisplay.css';
import {formatEventDates} from './EventDisplay.utils';
import FavoriteButton from '../FavoriteButton/FavoriteButton';
import { useFavoritesContext } from '../../contexts/FavoritesContext';
import { flag } from 'country-emoji';
import ShortDate from 'components/ShortDate/ShortDate';
import TagBadges from 'components/TagBadges/TagBadges';
import { useSearchParams } from 'react-router-dom';

const EventDisplay = ({name, hyperlink, location, misc, closedCaptions, date, dateOnTop=false, country, tags}) => {
  const event = {name, hyperlink, location, misc, closedCaptions, date, country, tags};
  const eventId = `${name}-${date[0]}`;
  const { isFavorite } = useFavoritesContext();
  const isFav = isFavorite(eventId);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleTagClick = (key, value) => {
    const currentSearch = Object.fromEntries(searchParams);
    setSearchParams({ ...currentSearch, [key]: value });
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
            <span className="countryFlag">{country != "Online" ? flag(country) : '🌎'}</span>
            <span className="countryName">{location}</span>
        </div>
        <p className="cfp" dangerouslySetInnerHTML={{__html: misc}} />
        {closedCaptions ? <span><img alt="Closed Captions" src="https://img.shields.io/static/v1?label=CC&message=Closed%20Captions&color=blue" /></span> : null}
        <TagBadges onTagClick={handleTagClick} tags={tags} />
      </div>
    </div>
  );
};

export default EventDisplay;
