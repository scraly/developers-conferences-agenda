#!/bin/bash

# This script can be ran locally in order to generate new tags

cd page
npm install -D

cd ../tools
npm install -D
node mdValidator.js
node mdParser.js

node generateAITagsv2.js