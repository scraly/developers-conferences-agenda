#!/bin/bash

# This script can be ran locally in order to set up and run the website for development purpose

cd page
npm install -D

cd ../tools
npm install -D
node mdValidator.js
node mdParser.js
node validateRegions.js
node fixCFPColor.js
node generateIcs.js
node generateIcs4OpenedCfps.js
node generateRSS.js
node geoCodes.js
node validateGeolocations.js

cd ../page
# npm run lint
# npm run format
npm start
