const fs = require('fs');
const events = require('../page/src/misc/all-events.json');
const cachedGeolocations = require('../page/src/misc/geolocations.json');
const NodeGeocoder = require('node-geocoder');

const ROOT = "../";
const GEOLOCATION_OUTPUT = ROOT + "page/src/misc/geolocations.json";

/* ------------------ Geocoder config ------------------ */

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

/* ------------------ Utils ------------------ */

// City (Country) converter
//Example: "Hanoï (Vietnam)" → "Hanoi, Vietnam"
function toGeocoderQuery(location) {
  return location
    .replace(/\s*\((.*?)\)\s*/, ', $1')
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// try to pick the best result and not the first (original code)
function pickBestResult(results) {
  if (!results || results.length === 0) return null;

  // priorité aux villes
  const cityLike = results.find(r =>
    ['city', 'administrative', 'town'].includes(r.type)
  );
  if (cityLike) return cityLike;

  // fallback: most important result
  return results.sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))[0];
}

/* ------------------ Build locations ------------------ */

// key = displayed value / cache
// value = request sent to geocoder
const locationMap = Array.from(
  new Set(events.map(e => e.location.replace(" & Online", "")))
)
  .filter(loc => loc && loc.toLowerCase() !== 'online')
  .reduce((acc, loc) => {
    acc[loc] = toGeocoderQuery(loc);
    return acc;
  }, {});

const locationsToGeocode = Object.keys(locationMap)
  .filter(loc => !cachedGeolocations[loc]);

const cachedLocations = Object.keys(locationMap)
  .filter(loc => cachedGeolocations[loc]);

/* ------------------ Geocoding ------------------ */

let warnings = [];

geocoder.batchGeocode(
  locationsToGeocode.map(loc => locationMap[loc])
).then((result) => {

  const geoLocationsObject = result.reduce((acc, r, idx) => {
    const originalLocation = locationsToGeocode[idx];
    const best = pickBestResult(r.value);

    if (!best || !best.latitude || !best.longitude) {
      console.log("Unable to get geocode for location:", originalLocation);
      warnings.push(originalLocation);
      return acc;
    }

    acc[originalLocation] = {
      latitude: best.latitude,
      longitude: best.longitude,
    };

    return acc;
  }, {});

  // réinjecte le cache existant
  cachedLocations.forEach((location) => {
    geoLocationsObject[location] = {
      latitude: cachedGeolocations[location].latitude,
      longitude: cachedGeolocations[location].longitude,
    };
  });

  // tri alphabétique
  const orderedGeoLocationsObject = Object.keys(geoLocationsObject)
    .sort()
    .reduce((obj, key) => {
      obj[key] = geoLocationsObject[key];
      return obj;
    }, {});

  fs.writeFileSync(
    GEOLOCATION_OUTPUT,
    JSON.stringify(orderedGeoLocationsObject, null, 2)
  );

  if (warnings.length > 0) {
    process.exit(1);
  }
});