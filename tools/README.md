# tools
## parser.py
Usage:
```
python3 parser.py <year> [outputFile="-"]
# Special use case, parse README.md from root folder
python3 parser.py README [outputFile="-"]
```
outputFile whose value is "-" are going to stdout.

#### Example Output
```json
{
	"name": "DDD Europe",
	"date": [
		1612371600,
		1612458001
	],
	"hyperlink": "https://dddeurope.com/2021/handson-conference/",
	"location": "Online (les autres annees Amsterdam, Pays-bas)",
	"misc": ""
}
```
 - name: Event name
 - date: Timestamp range
 - hyperlink: Link to event
 - location: User-defined event location
 - misc: Additional information (may contain HTML)

#### Known Issues
 - [ ] Localized symbols may interfere with parser. (e.g. JavaOne @ 2022.md)
 - [ ] No `:` after schedule date interefere with parser. (e.g. Voxxed Melbourne @ 2019.md)

## combine.py
Combines json files. Used to compile `all-events.json` file.
