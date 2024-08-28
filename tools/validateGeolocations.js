const locations = require('../page/src/misc/geolocations.json');

let hasErrors = false

Object.keys(locations).forEach((city) => {
  Object.keys(locations).forEach((city2) => {
    if (city === city2) {
      return
    }
    if (Math.abs(locations[city].longitude - locations[city2].longitude) < 0.001 && Math.abs(locations[city].latitude - locations[city2].latitude) < 0.001) {
      console.error(`Duplicate coordinates: ${city} and ${city2}`)
      hasErrors = true
    }
  })
})

if (hasErrors) {
  process.exit(1)
}
