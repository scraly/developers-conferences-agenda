#!/bin/bash

# This script can be runed locally in order to set up and run the website for development purpose

cd page
npm install -D

cd ../tools
node mdParser.js

cd ../page
npm start