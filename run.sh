#!/bin/bash

# This script can be ran locally in order to set up and run the website for development purpose

cd page
npm install -D

cd ../tools
npm install -D
node mdValidator.js
node mdParser.js
node generateIcs.js
node generateIcs4OpenedCfps.js
node generateRSS.js

cd ../page
npm start
