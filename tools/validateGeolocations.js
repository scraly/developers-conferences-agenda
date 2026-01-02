const locations = require('../page/src/misc/geolocations.json');

const cities = Object.keys(locations)

for (let i = 0; i < cities.length; i++) {
  for (let j = i + 1; j < cities.length; j++) {
    const city = cities[i]
    const city2 = cities[j]

    //0.015 = around 1.6 km  for latitude and longititude
    if (
      Math.abs(locations[city].longitude - locations[city2].longitude) < 0.015 &&
      Math.abs(locations[city].latitude - locations[city2].latitude) < 0.015
    ) {
      console.error(`Duplicate coordinates: ${city} and ${city2}`)
      hasErrors = true
    }
  }
}
