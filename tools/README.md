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

## generateCfpDurations.js

### Mission

Reads CFP links from `page/src/misc/all-events.json`, extracts explicit talk and workshop durations from CFP pages, and appends them to `CFP.csv`.

### Usage

```sh
node generateCfpDurations.js
```

Only durations that can be identified explicitly are written. Each event uses separate CSV cells, for example:

```csv
event_id,duration1,duration2,duration3,duration4
2026-06-11-DevLille 2026,talk:5,talk:30,talk:45,workshop:160
```

## recordingScanner.js

### Mission

Finds recordings for events that do not have a `recording:` entry in
`METADATA.csv`. The event listing is `README.md` plus `archives/YYYY.md`;
`tools/mdParser.js` merges those files into
`page/src/misc/all-events.json`, which the scanner reads automatically.

For each missing event, the scanner checks the event website and YouTube,
including result-channel playlists, verifies candidate upload dates, and reports
the best match. Shared recording helpers live in `recordingHelpers.js`; the
scanner is the recording command you run.

### Quick workflow

Install once:

```sh
cd tools && npm ci && cd ..
```

Scan a batch:

```sh
node tools/recordingScanner.js --since 2025 --limit 20
```

The scanner prints the selection before scanning:

```text
Events matching filters: 2883
Events with recordings: 521
Future events skipped: 622
Events to check: 2883 - 521 - 622 = 1740
Scanning: 20 of 1740 (limited)
Already checked: 10
Events in cache: 350
Cache size: 1.4 MB
Cache last updated: 11/25/2026, 12:00:17 PM PST
Cache will update as events are checked.
```

Review:

- `tmp/recording-scan.md` — human-readable table: date, event link, recordings, status
- `tmp/recording-scan.tsv` — spreadsheet-friendly table
- `tmp/recording-scan.json` — candidates and verification details

Reports are rewritten while the scan runs, so an interrupted scan keeps the
partial results completed so far.

Apply verified recordings using the same filters:

```sh
node tools/recordingScanner.js --since 2025 --limit 20 --write
```

`--write` adds only `FOUND` YouTube playlists or videos whose latest upload is
after the event date. `MANUAL` and `REVIEW` rows are never written
automatically. Keep the same filters: the cache reuses the scan results, so the
write pass does not repeat the network scan.

Refresh derived data after writing:

```sh
(cd tools && node mdParser.js) && node tools/generateRecordingsStats.js
```

### Filters

- `--since YYYY` — events from this year onward
- `--year YYYY[,YYYY]` — selected event years
- `--event TEXT` — event name or location filter
- `--limit N` — cap the batch size
- `--include-future` — include events that have not happened yet
- `--workers N` — parallel event scans, default `2`
- `--refresh` — force regeneration of `all-events.json`

### Cache

The scanner uses one cache: `tmp/recording-scanner-cache.json`.

- `Already checked`: cache hits in the current scan set.
- `Events in cache`: total event results currently stored.
- `Cache size`: current cache file size.
- `Cache last updated`: last successful cache write, shown in local time.
- Default: reuse previous results and update the cache as new events are scanned.
- `--no-cache`: do not read or write the cache. Use for a one-off run.
- `--refresh-cache`: clear the cache and rebuild it for this scan. Use after
  enough time has passed that new recordings may exist.

Use `--refresh-cache` with the same filters you plan to scan; it replaces the
cache for this run.

## generateRecordingsStats.js

### Mission

Regenerates [docs/recordings-stats.md](../docs/recordings-stats.md) and
`docs/images/recordings-overall-events.png` from the parsed event data, so the
coverage numbers are derived rather than hand-maintained.

### Usage

Run from the repository root after `node mdParser.js`:

```sh
cd tools && npm ci && cd ..
node tools/generateRecordingsStats.js
```

Options:

- `--date YYYY-MM-DD` — snapshot date shown on the page (default: today)
- `--no-image` — skip the PNG infographic

The infographic is rendered with `sharp` from the `tools` npm dependencies.

## Tests

Run all tool tests from `tools/`:

```sh
npm test
```

The country tests expect `page/src/misc/all-events.json`, so run
`node mdParser.js` first after changing metadata.
