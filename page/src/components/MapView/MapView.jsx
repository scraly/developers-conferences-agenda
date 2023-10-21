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
          const marker = eventsByLocation[loc].map((e, i) => (
            <div key={`ev_${i}`} className='event-map-entry'>
              {e.hyperlink ? <a href={e.hyperlink} target='_blank'>{e.name}</a> : <b>{e.name}</b>}
              <span dangerouslySetInnerHTML={{__html: e.misc}}></span>
              {e.closedCaptions && <span><img alt="Closed Captions" src="https://img.shields.io/static/v1?label=CC&message=Closed%20Captions&color=blue" /></span>}
            </div>
          ))
          return (
            <Marker position={[geolocations[loc].latitude, geolocations[loc].longitude]} key={loc}>
              <Popup maxWidth={600} minWidth={150}>{marker}</Popup>
              <Tooltip>{loc}</Tooltip>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
