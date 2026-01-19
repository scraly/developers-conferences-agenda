# Contributing

This list of tech conferences is growing every day thanks to you.
There is no small contribution! 💪

## Eligible conference

The aim of this calendar is to list community events. To be accepted, events must meet the following criteria:

- include a variety of presentations from people outside the organization
- offer a CFP
- last at least 1/2 day
- be open to the public
- target a developer audience

Examples of rejected conferences:

- regular "meetup" events
- corporate promotional events

## Guidelines

- All changes must be made in a branch and submitted as a Pull Request (PR)
- Future conference(s) must be added to the `README.md` file
- Past conferences appear in the `archives/YYYY.md` file
- Add one or several events per PR with the following format:

```
* date: [Conference Name](https://example.com/) - City, state (Country)
```

- If there's an ongoing Call For Proposals (CFP), please specify it at the end of the line:

```
<a href="https://example.com/"><img alt="CFP conference-name" src="https://img.shields.io/static/v1?label=CFP&message=until%20DD-MONTH-YYYY&color=green"></a>
```

- If the conference has a sponsoring deck, please specify it at the end of the line:

```
<a href="https://www.linkofthesponsoring.deck"><img alt="Sponsoring" src="https://img.shields.io/badge/sponsoring-8A2BE2"></a>
```

- If the conference will be subtitles with closed captions, please specify it at the end of the line:

```
<img alt="Closed Captions" src="https://img.shields.io/static/v1?label=CC&message=Closed%20Captions&color=blue" />
```

- If the conference offers a discount code, please include it using the following format anywhere in the event line:

```
[discount:CODE|20%|until=2025-10-31]
```

- `CODE` - The discount code (required)
- `20%` - The discount value, e.g., "20%", "€50", "50 USD" (optional)
- `until=2025-10-31` - Optional expiration date in YYYY-MM-DD format
- Multiple discounts per event are supported by adding multiple `[discount:...]` tags
- Example with multiple discounts:

```
* 22-25: [SnowCamp 2025](https://snowcamp.io/) - Grenoble (France) [discount:SNOWCAMP20|20%|until=2025-10-31] [discount:EARLYBIRD|30%|until=2025-08-15]
```

## Adding Discount Codes via METADATA.csv

Alternatively, you can add discount codes and other metadata to the centralized `METADATA.csv` file:

1. Add or update a row in `METADATA.csv` with the following format:

```csv
event_id,discount_codes,estimated_attendees,notes
2026-01-14-SnowCamp 2026,SNOWCAMP20,2000,Early bird expires 2026-02-28
2025-02-03-Jfokus 2025,JFOKUS100|STUDENT50,1800,Student rate requires .edu email
```

- `event_id` - Format: `YYYY-MM-DD-Event Name` (must match event in README.md exactly)
- `discount_codes` - Pipe-separated codes (e.g., `CODE1|CODE2`), or leave empty
- `estimated_attendees` - Expected attendee count (optional, numeric only)
- `notes` - Any additional context about the discount or event (optional)

2. Multiple discount codes are supported using pipe separator `|`
3. If a discount code appears in both README inline tags and METADATA.csv, it will only be displayed once (deduplicated)
4. Leave fields empty for optional data (just use commas without values)

**Note:** The event_id in METADATA.csv must exactly match the event generated from README.md (ISO date + event name), or it will not be matched.
* Make sure the PR title is in the format of `Add Conference Name`
* Check your spelling and grammar
* Remove any trailing whitespace
* Use Prettier to format the code: `npm run format`
* Use ESLint for linters: `npm run lint`

Thanks! ❤️
