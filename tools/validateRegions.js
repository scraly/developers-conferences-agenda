const fs = require('fs');
const events = require('../page/src/misc/all-events.json');
const regions = require('../page/src/misc/regions.json');

const knownCountries = {}
Object.values(regions).forEach(countries => 
  countries.forEach(country => knownCountries[country] = true)
)

events.forEach(e => {
  if (e.country && knownCountries[e.country] !== true && e.country !== "Online") {
    console.log("Unknown country", e.country, "please check the spelling of the country and if it is correct add it to the 'page/src/misc/regions.json' file")
  }
})
