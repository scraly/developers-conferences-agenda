#!/bin/bash

# This script can be runed locally in order to set up and run the website for development purpose

cd page
npm install -D --force

cd ../tools
node mdValidator.js
node mdParser.js

cd ../page
npm start