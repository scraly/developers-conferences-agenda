import 'styles/MapView.css';
import 'leaflet/dist/leaflet.css';
import geolocations from 'misc/geolocations.json';

import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

import { Icon } from 'leaflet'

// Regular marker icon
const myIcon = new Icon({
 iconUrl: iconMarker,
 shadowUrl: iconShadow,
 iconRetinaUrl: iconRetina,
 iconSize:    [25, 41],
 iconAnchor:  [12, 41],
 popupAnchor: [1, -34],
 tooltipAnchor: [16, -28],
 shadowSize:  [41, 41]
})

// Create a custom SVG icon for favorites
const createFavoriteIcon = () => {
  const svgString = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="favoriteGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#FF7F50;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FF6347;stop-opacity:1" />
        </linearGradient>
      </defs>
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z" 
            fill="url(#favoriteGradient)" stroke="#FF4500" stroke-width="1"/>
      <circle cx="12.5" cy="12.5" r="6" fill="white"/>
      <path d="M12.5 7.5l1.5 3h3l-2.5 2 1 3-3-1.5-3 1.5 1-3-2.5-2h3z" fill="#FF4757"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svgString)}`;
};

const favoriteIcon = new Icon({
  iconUrl: createFavoriteIcon(),
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
})

import {useMemo} from 'react';

import {MapContainer, TileLayer, Marker, Popup, Tooltip} from 'react-leaflet';

import {useYearEvents} from 'app.hooks';
import { useFavoritesContext } from '../../contexts/FavoritesContext';

import ShortDate from 'components/ShortDate/ShortDate';
import FavoriteButton from '../FavoriteButton/FavoriteButton';

const MapView = () => {
  let events = useYearEvents()
  const { isFavorite } = useFavoritesContext();

  const eventsByLocation = useMemo(() => {
    return events.reduce((acc, cur) => {
      const location = cur.location.replaceAll(' & Online', '');
      if (!geolocations[location] || !geolocations[location].longitude || !geolocations[location].latitude) {
        return acc;
      }
      if (!acc[location]) {
        acc[location] = [];
      }
      acc[location].push(cur);
      return acc;
    }, {})
  }, [events]);


  return (
    <div className="mapView">
      <MapContainer center={[0, 0]} scrollWheelZoom={true} zoom={3}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {Object.keys(eventsByLocation).map(loc => {
          if (!geolocations[loc] || !geolocations[loc].longitude || !geolocations[loc].latitude) {
            return null;
          }
          
          // Check if any event at this location is favorited
          const hasFavorites = eventsByLocation[loc].some(e => {
            const eventId = `${e.name}-${e.date[0]}`;
            return isFavorite(eventId);
          });
          
          const marker = eventsByLocation[loc].map((e, i) => {
            const eventId = `${e.name}-${e.date[0]}`;
            const isFav = isFavorite(eventId);
            
            return (
              <div className={`event-map-entry ${isFav ? 'favorite-event' : ''}`} key={`ev_${i}`}>
                <ShortDate dates={e.date} />
                {e.hyperlink ? <a href={e.hyperlink} rel="noreferrer" target='_blank'>{e.name}</a> : <b>{e.name}</b>}
                <span className="event-map-misc" dangerouslySetInnerHTML={{__html: e.misc}} />
                {e.closedCaptions ? <span><img alt="Closed Captions" src="https://img.shields.io/static/v1?label=CC&message=Closed%20Captions&color=blue" /></span> : null}
                <FavoriteButton event={e} />
              </div>
            );
          });
          
          return (
            <Marker icon={hasFavorites ? favoriteIcon : myIcon} key={loc} position={[geolocations[loc].latitude, geolocations[loc].longitude]}>
              <Popup maxWidth={600} minWidth={200}>
                <div className="map-popup-container">
                  {marker}
                </div>
              </Popup>
              <Tooltip>{loc}</Tooltip>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
