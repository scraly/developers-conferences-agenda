import 'styles/MapView.css';
import 'leaflet/dist/leaflet.css';
import geolocations from 'misc/geolocations.json';

import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

import { Icon } from 'leaflet'
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

import {useMemo} from 'react';

import {MapContainer, TileLayer, Marker, Popup, Tooltip} from 'react-leaflet';

import {useYearEvents} from 'app.hooks';

import ShortDate from 'components/ShortDate/ShortDate';

const MapView = () => {
  let events = useYearEvents()

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
          const marker = eventsByLocation[loc].map((e, i) => (
            <div className='event-map-entry' key={`ev_${i}`}>
              <ShortDate dates={e.date} />
              {e.hyperlink ? <a href={e.hyperlink} rel="noreferrer" target='_blank'>{e.name}</a> : <b>{e.name}</b>}
              <span dangerouslySetInnerHTML={{__html: e.misc}} />
              {e.closedCaptions ? <span><img alt="Closed Captions" src="https://img.shields.io/static/v1?label=CC&message=Closed%20Captions&color=blue" /></span> : null}
            </div>
          ))
          return (
            <Marker icon={myIcon} key={loc} position={[geolocations[loc].latitude, geolocations[loc].longitude]}>
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
