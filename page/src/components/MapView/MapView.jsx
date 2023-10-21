import 'styles/MapView.css';
import 'leaflet/dist/leaflet.css';
import geolocations from 'misc/geolocations.json';

import {useMemo} from 'react';

import {MapContainer, TileLayer, Marker, Popup, Tooltip} from 'react-leaflet';

import {getYearEvents} from 'utils';
import {filterEvents} from '../../utils';
import {useCustomContext} from 'app.context';

const MapView = ({year}) => {
  let events = useMemo(() => getYearEvents(year), [year]);
  const {userState} = useCustomContext();
  events = useMemo(() => filterEvents(events, userState.filters.callForPapers, userState.filters.closedCaptions, userState.filters.country, userState.filters.query), [userState, events]);

  const eventsByLocation = useMemo(() => {
    return events.reduce((acc, cur) => {
      if (!geolocations[cur.location] || !geolocations[cur.location].longitude || !geolocations[cur.location].latitude) {
        return acc;
      }
      if (!acc[cur.location]) {
        acc[cur.location] = [];
      }
      acc[cur.location].push(cur);
      return acc;
    }, {})
  }, [events]);

  console.log(eventsByLocation)

  return (
    <div className="mapView">
      <MapContainer center={[0, 0]} zoom={3} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {Object.keys(eventsByLocation).map(loc => {
          if (!geolocations[loc] || !geolocations[loc].longitude || !geolocations[loc].latitude) {
            return null;
          }
          return (
            <Marker position={[geolocations[loc].latitude, geolocations[loc].longitude]} key={loc}>
              <Popup>
                {eventsByLocation[loc].map(event => (
                    <div key={event.id}>{event.name}</div>
                ))}
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
