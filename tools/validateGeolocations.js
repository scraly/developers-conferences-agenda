const locations = require('../page/src/misc/geolocations.json');

let hasErrors = false

Object.keys(locations).forEach((city) => {
  Object.keys(locations).forEach((city2) => {
    if (city === city2) {
      return
    }
    if (locations[city].longitude === locations[city2].longitude && locations[city].latitude === locations[city2].latitude) {
      console.error(`Duplicate coordinates: ${city} and ${city2}`)
      hasErrors = true
    }
  })
})

if (hasErrors) {
  process.exit(1)
}
