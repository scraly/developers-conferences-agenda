
# Scripts

This folder contains all the useful scripts.

## google-apps-script

Imports the JSON file of all the events into a Google Spreadsheet table.

## filterCFPs.gs

Example of code that uses Google Apps Script to filter a list of CFPs that meet some criterias, then send it as a markdown message to a messaging software.
In this example, 3 filters are used: 
- CFPs which location includes "(France)"
- CFPs that are in the same year as today
- CFPs that are open or about to open withing this week (from Monday to Sunday)

You can find a read-only project here with an actual implementation to send the CFP list to Mattermost, a messaging sofware: [Example of a Google App Script project](https://script.google.com/d/1bt680byslxMyruogvlkCucjfgcwX_FlEjEgEpp--2HCjp45dRbKCL93v/edit?usp=sharing)