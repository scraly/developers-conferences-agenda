#!/bin/bash

# This script can be ran locally in order to generate new tags

cd page
npm ci

cd ../tools
npm ci
node mdValidator.js
node mdParser.js

node generateAIAttendees.js
