# tools

Utility scripts for processing conference data, generating feeds, and validating data integrity.

## mdParser.js
### Mission
Parses the README file to find archives and events. extract every events from those markdown files and saves them in a `all-event.json` file
### Usage
```
node mdParser.js 
```
outputFile whose value is "-" are going to stdout.

### Event Output format
```json
[
	{
		"name": "DDD Europe",
		"date": [
			1612371600000,
			1612458001000
		],
		"hyperlink": "https://dddeurope.com/2021/handson-conference/",
		"location": "Online (les autres annees Amsterdam, Pays-bas)",
		"misc": "<a href=\"https://oredev.org/callforpaper\"><img alt=\"CFP Oredev malmo 2023\" src=\"https://img.shields.io/static/v1?label=CFP&message=until%2031-March-2023&color=red\"></a>",
		"cfp":{
			"link":"https://oredev.org/callforpaper",
			"until":"31-March-2023",
			"untilDate":1704409200000
		},
		"status":"open"
	},
	...
]
```
 - name: Event name
 - date: Timestamp for single date, timestamp range for datespan. milliseconds since epoch (js standard)
 - hyperlink: Link to event
 - location: User-defined event location
 - misc: Additional information (may contain HTML) - kept for retrocompatibility
 - cfp: informations about the CFP, from the badge code
 - status: tagged status for the event. defaults to "open"

### Known Issues
 - [x] ~~Localized symbols may interfere with parser. (e.g. JavaOne @ 2022.md)~~
 - [x] ~~No `:` after schedule date interefere with parser. (e.g. Voxxed Melbourne @ 2019.md)~~

## generateIcs4OpenedCfps.js

### Mission

Reads the `page/src/misc/all-cfps.json` file and generates a `developer-conference-opened-cfps.ics` file. People can then subscribe to https://developers.events/developer-conference-opened-cfps.ics to know when CFPs are closing.

Note that the generated calendar only includes CFPs which are not yet closed when the script is running.

### Usage

```sh
node generateIcs4OpenedCfps.js  
```

### Output format

```ics
BEGIN:VCALENDAR
VERSION:2.0
PRODID:DCA
BEGIN:VEVENT
UID:DevFest Jalingo 2023@dca-2023
DTSTAMP:20231019T114828
DTSTART:20231020
LOCATION:Jalingo (Nigeria)
SUMMARY:DevFest Jalingo 2023
URL:https://sessionize.com/devfest-2023-jalingo/
END:VEVENT
END:VCALENDAR
```

### Known Issues

Not yet 😉
