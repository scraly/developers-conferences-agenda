const fs = require('fs');
const events = require('../page/src/misc/all-events.json');
const cachedGeolocations = require('../page/src/misc/geolocations.json');
const NodeGeocoder = require('node-geocoder');

const ROOT = "../";
const GEOLOCATION_OUTPUT = ROOT + "page/src/misc/geolocations.json";

//let options = {provider: 'openstreetmap'};
let options = {
  provider: 'openstreetmap',
  fetch(url, options) {
    return fetch(url, {...options, headers: { 'user-agent': 'dca-0' }})
  }
};
if (process.env.GOOGLE_MAPS_API_KEY !== undefined) {
  options = {
    provider: 'google',
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
  }
}

const geocoder = NodeGeocoder(options);

const locations = Array.from(new Set(events.map((event) => event.location.replace(" & Online", "")))).filter((location) => !cachedGeolocations[location]).filter((location) => location !== "" && location.toLowerCase() !== "online").sort();
const cachedLocations = Array.from(new Set(events.map((event) => event.location.replace(" & Online", "")))).filter((location) => cachedGeolocations[location]).filter((location) => location !== "").sort();

var warnings = []; 

geocoder.batchGeocode(locations).then((result) => {
    const geoLocationsObject = result.map((r, idx) => ({...(r.value && r.value[0] ? r.value[0] : {}), query: locations[idx]})).reduce((acc, currentValue) => {
        if (!currentValue.latitude || !currentValue.longitude) {
            console.log("Unable to get geocode for location: ", currentValue.query);
            warnings.push(currentValue.query);
            return acc;
        }
        acc[currentValue.query] = {
            latitude: currentValue.latitude,
            longitude: currentValue.longitude,
        };
        return acc;
    }, {});

    cachedLocations.forEach((location) => {
        geoLocationsObject[location] = {
            latitude: cachedGeolocations[location].latitude,
            longitude: cachedGeolocations[location].longitude,
        }
    });

    const orderedGeoLocationsObject = Object.keys(geoLocationsObject).sort().reduce(
      (obj, key) => {
        obj[key] = geoLocationsObject[key];
        return obj;
      },
      {}
    );

    fs.writeFileSync(GEOLOCATION_OUTPUT, JSON.stringify(orderedGeoLocationsObject, null, '  '));

    if(warnings.length > 0) {
      process.exit(1)
    }
})

