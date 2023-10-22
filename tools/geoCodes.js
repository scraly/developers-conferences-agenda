const fs = require('fs');
const events = require('../page/src/misc/all-events.json');
const cachedGeolocations = require('../page/src/misc/geolocations.json');
const NodeGeocoder = require('node-geocoder');

const ROOT = "../";
const GEOLOCATION_OUTPUT = ROOT + "page/src/misc/geolocations.json";

const options = {
  provider: 'openstreetmap',
};

const geocoder = NodeGeocoder(options);

const locations = Array.from(new Set(events.map((event) => event.location.replace(" & Online", "")))).filter((location) => !cachedGeolocations[location]).filter((location) => location !== "").sort();
const cachedLocations = Array.from(new Set(events.map((event) => event.location.replace(" & Online", "")))).filter((location) => cachedGeolocations[location]).filter((location) => location !== "").sort();

geocoder.batchGeocode(locations).then((result) => {
    const geoLocationsObject = result.map((r, idx) => ({...(r.value && r.value[0] ? r.value[0] : {}), query: locations[idx]})).reduce((acc, currentValue) => {
        if (!currentValue.latitude || !currentValue.longitude) {
            console.log("Unable to get geocode for location: ", currentValue.query);
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

    fs.writeFileSync(GEOLOCATION_OUTPUT, JSON.stringify(geoLocationsObject));
})
