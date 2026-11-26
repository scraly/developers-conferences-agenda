# Finding recordings

`tools/recordingScanner.js` compares the event listing with `METADATA.csv`,
finds recordings for events that do not have one, verifies upload dates, and
writes reports. It does not change metadata unless you pass `--write`.

Event data comes from `README.md` and `archives/YYYY.md` through
`page/src/misc/all-events.json`. The scanner refreshes that file when its sources
are newer.

To add a recording you already know, follow
[Add a recording manually](../CONTRIBUTING.md#add-a-recording-manually). For
metadata format and website behavior, see
[Recording metadata and rendering](recordings-design.md).

## Prerequisites

Run the commands from the repository root. Install the dependencies once:

```bash
npm ci --prefix tools
brew install yt-dlp   # or install yt-dlp with your package manager
```

## Option 1: Use an agent

Open your coding agent in this repository and ask:

> Find missing recordings for 2026 events.

The agent starts with a 20-event batch and reports the results without changing
`METADATA.csv`. Ask it to continue for a larger batch, or explicitly approve a
full scan:

> Scan all missing recordings for 2026 events.

Full scans can take a long time and make thousands of network requests. Finding
or scanning does not authorize writing; ask the agent to **apply** the verified
results only after reviewing them.

## Option 2: Run the scanner yourself

### 1. Scan a small batch

```bash
node tools/recordingScanner.js --year 2026 --limit 20
```

The scanner prints the selection, cache statistics, and one progress bar. To
scan the next events, increase the limit to `40`, then `60`, and so on. Cached
events are reused, so only the new part of the larger batch needs network
requests.

### 2. Review the reports

Start with `tmp/recording-scan.md`:

| Status | Meaning |
|---|---|
| `FOUND` | A date-verified YouTube playlist or video |
| `MANUAL` | An official recording page that needs a human check |
| `REVIEW` | A candidate with stale uploads or a failed/unavailable date check |
| `NONE` | No plausible candidate found |

The Markdown table contains the date, linked event, recordings as bullets, and
status. The same status values appear in the JSON and TSV reports:

- `tmp/recording-scan.json` — all candidates and verification details.
- `tmp/recording-scan.tsv` — spreadsheet-friendly results.

Reports are updated while the scan runs, so an interrupted scan retains its
completed partial results. Each run rewrites all three reports for that run's
selected events; a smaller later scan replaces the previous report scope. Use
the `--md`, `--out`, and `--tsv` options if you need separate output files.

Report generation times, cache update times, and each JSON result's `updated`
time are displayed in local time with a UTC offset.

### 3. Apply verified recordings

After reviewing the report, rerun with exactly the same filters and `--write`:

```bash
node tools/recordingScanner.js --year 2026 --limit 20 --write
```

Only `FOUND` results are written. For each event, the scanner adds its
highest-ranked verified YouTube playlist or video; it does not write every
accepted alternative shown in the Markdown report. `MANUAL` and `REVIEW` entries
are never written automatically. Narrow the filters, for example with
`--event`, to apply only a subset.

Keep the default cache between the scan and write runs so the write pass reuses
the reviewed results. Do not add `--no-cache` or `--refresh-cache` between them.

### 4. Refresh derived data and validate

```bash
(cd tools && node mdValidator.js)
(cd tools && node mdParser.js)
(cd tools && node checkCountries.js)
(cd tools && npm test)
node tools/generateRecordingsStats.js
git diff -- METADATA.csv docs/recordings-stats.md
git diff --check
wc -l METADATA.csv
```

Confirm that only intended metadata rows changed and that the row count did not
change. Inspect the regenerated statistics and infographic as well.

## Filters

- `--year YYYY[,YYYY]` — select one or more calendar years.
- `--since YYYY` — select events from this year onward.
- `--event TEXT` — match event names or locations containing the text.
- `--limit N` — cap the batch size.
- `--include-future` — include upcoming events.
- `--workers N` — run parallel event scans; default `2`.
- `--refresh` — regenerate `all-events.json` even when it is current.

```bash
node tools/recordingScanner.js --year 2025,2026 --limit 20
node tools/recordingScanner.js --event "Devoxx" --limit 10
```

Run `node tools/recordingScanner.js --help` for score, input, and output options.

## Cache

The scanner stores event results and candidate date checks in one file:
`tmp/recording-scanner-cache.json`.

Normal runs reuse the cache and update it as events are checked. Output includes
cache hits, total cached events, file size, and the last update time in local
time.

- `--no-cache` — do not read or write the cache; use for a one-off run.
- `--refresh-cache` — clear the entire cache and rebuild it with the current
  scan. Cached results for events outside the current selection are removed.
- The two cache options cannot be combined.

## Candidate rules

- Prefer a dedicated edition playlist. A talk or full stream is an acceptable
  fallback.
- Never add a bare channel link (`/@handle`, `/channel/...`, `/c/...`,
  `/user/...`).
- Verify the event name, year, owner, content, and public accessibility.
- Require a video published after the event date, or a confirmed same-day
  recording.
- Treat recaps, trailers, sponsor videos, and schedules as non-recordings.
- Do not invent URLs, playlist IDs, or event IDs.
- Do not add metadata for an event absent from the event listing.
- A `NONE` result means “not found”, not “no recording exists”.

For a `MANUAL` or `REVIEW` candidate, check the source manually and verify its
upload date:

```bash
yt-dlp --skip-download --print '%(upload_date)s\t%(title)s' \
  'https://www.youtube.com/watch?v=VIDEO_ID'
```

The date is `YYYYMMDD` in UTC. It must be after the event date, or on the same
day after you confirm the recording's content.

## Removing a stale recording

Delete only the `recording:` field. Split at field boundaries, never at every
comma, because event IDs and labels may contain commas:

```bash
node - <<'NODE'
const fs = require('node:fs');
const drop = new Set(['2026-06-17-Devoxx Poland']); // exact event IDs
const field = /,(?=(?:attendees|recording):)/;
const lines = fs.readFileSync('METADATA.csv', 'utf8').split(/\r?\n/);
const output = lines.map((line) => {
  const parts = line.split(field);
  if (!drop.has(parts[0])) return line;
  return [
    parts[0],
    ...parts.slice(1).filter((part) => !part.startsWith('recording:')),
  ].join(',');
});
fs.writeFileSync('METADATA.csv', output.join('\n'));
NODE
```

Then run `git diff -- METADATA.csv` and `git diff --check`. Only intended lines
should change.

## Using an Agent

- “Find missing recordings for YYYY events” means scan and report only:
  `node tools/recordingScanner.js --year YYYY --limit 20`.
- Use `--year` for a calendar year and `--since` only for “from YYYY onward”.
- Start with `--limit 20`. For “continue”, increase the existing limit while
  keeping the other filters unchanged. Do not run an unrestricted scan unless
  approved.
- “Scan all missing recordings for YYYY events” explicitly approves an
  unrestricted scan. Omit `--limit`, warn that it may take a long time, and use
  the cache so interrupted scans can resume.
- “Add”, “apply”, or “write” means rerun the same filters with `--write`.
  “Find” alone does not authorize writing.
- Read `tmp/recording-scan.json`; use the Markdown report for human summaries.
- Report selection counts, cache hits, status counts, and report paths.
- Write only the best candidate for each `FOUND` result. Never present or write
  `MANUAL` or `REVIEW` candidates as confirmed recordings.
- `--write` applies to all `FOUND` results in the batch. Narrow filters to apply
  a subset.
- Never add bare channels, guessed URLs, or guessed IDs.
- After writing, run the validation commands above and report how many
  recordings were added.
- Use the default cache. Use `--no-cache` for a one-off run and
  `--refresh-cache` when fresh results are needed.
- If `yt-dlp` or the network is unavailable, stop and report the failure. Do not
  infer that recordings do not exist.
- Do not run network-heavy scans in CI. Keep reports under `tmp/`; do not commit
  them.
