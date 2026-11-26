# Finding recordings workflow

`tools/recordingScanner.js` compares the event listing with `METADATA.csv`,
finds recordings for missing events, verifies upload dates, and writes reports.

Event data comes from `README.md` and `archives/YYYY.md`, generated into
`page/src/misc/all-events.json`. For metadata and UI details, see
[recordings-design.md](recordings-design.md).


## Prerequisites

Install once:

```bash
cd tools && npm ci && cd ..
brew install yt-dlp   # or install yt-dlp with your package manager
```

## Option 1: Use an Agent (Easy!)

Open your coding agent in this repository and ask:

`find missing recordings for 2026 events`

The agent starts with a small batch and reports the results. Ask it to continue,
or explicitly approve a full scan.

For a full scan of all 2026 events, ask:

`scan all missing recordings for 2026 events`

Full scans can take a long time and make thousands of network requests.

## Option 2: Manual Workflow

Scan a small batch:

```bash
node tools/recordingScanner.js --since 2025 --limit 20
```

The scanner prints selection and cache counts, then updates one progress bar.

Review `tmp/recording-scan.md`:

| Status | Meaning |
|---|---|
| `FOUND` | Date-verified YouTube playlist or video |
| `MANUAL` | Official recording page that needs a human check |
| `REVIEW` | Candidate found, but date verification failed or was unavailable |
| blank / `NONE` | Nothing plausible found |

The table columns are date, event link, recordings, and status. Multiple
recordings are shown as bullets, and status matches the JSON/TSV reports:
`FOUND`, `MANUAL`, `REVIEW`, or `NONE`.

Structured reports:

- `tmp/recording-scan.json` — results and alternatives
- `tmp/recording-scan.tsv` — spreadsheet-friendly results

Reports are updated while the scan runs. If the scan is interrupted, the files
retain the partial results completed so far.

Apply verified recordings with the same filters:

```bash
node tools/recordingScanner.js --since 2025 --limit 20 --write
```

Only `FOUND` YouTube playlists or videos are written. `MANUAL` and `REVIEW`
entries are never written automatically. `--write` applies all `FOUND` results
in the current batch, so narrow the filters to apply a subset.

The cache makes the write pass fast. Do not add `--no-cache` or
`--refresh-cache` between the scan and write runs.

Refresh and validate:

```bash
(cd tools && node mdParser.js)
(cd tools && node mdValidator.js)
(cd tools && node --test)
node tools/generateRecordingsStats.js
git diff -- METADATA.csv
git diff --check
```

Metadata line count must remain unchanged:

```bash
wc -l METADATA.csv
```

Inspect the regenerated statistics and infographic.

## Filters

- `--since YYYY` — from this year onward
- `--year YYYY[,YYYY]` — selected years
- `--event TEXT` — event name or location
- `--limit N` — batch size
- `--include-future` — include upcoming events
- `--workers N` — parallel scans, default `2`

```bash
node tools/recordingScanner.js --year 2026 --limit 20
node tools/recordingScanner.js --event "Devoxx" --limit 10
```

## Cache

One cache: `tmp/recording-scanner-cache.json`.

Normal runs reuse it. Output shows cache hits, total cached events, file size,
and last update time in local time.

- `--no-cache` — one-off run; do not read or write the cache.
- `--refresh-cache` — clear and rebuild the cache for this scan.
- The two options cannot be combined.

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
- A missing result means “not found”, not “no recording exists”.

For a `MANUAL` or `REVIEW` candidate, check the source manually and verify its
upload date:

```bash
yt-dlp --skip-download --print '%(upload_date)s\t%(title)s' \
  'https://www.youtube.com/watch?v=VIDEO_ID'
```

The date is `YYYYMMDD` in UTC and must be after the event date, or the same day
after confirming the content.

## Removing a stale recording

Delete only the `recording:` field. Split at field boundaries, never at every
comma, because event IDs and labels may contain commas:

```bash
node - <<'NODE'
const fs = require('node:fs');
const drop = new Set(['2026-06-17-Devoxx Poland']); // event_id prefixes
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
- Start with `--limit 20`. Do not run an unrestricted scan unless approved.
- “Scan all missing recordings for YYYY events” is explicit approval for an
  unrestricted scan. Omit `--limit`, warn that it may take a long time, and use
  the cache so interrupted scans can resume.
- “Add”, “apply”, or “write” means rerun the same filters with `--write`.
  “Find” alone does not authorize writing.
- Read `tmp/recording-scan.json`; use the Markdown report for human summaries.
- Report selection counts, cache hits, status counts, and report paths.
- Write only `FOUND` results. Never present or write `MANUAL` or `REVIEW` as
  confirmed recordings.
- `--write` applies all `FOUND` results in the batch. Narrow filters to apply a
  subset.
- Never add bare channels, guessed URLs, or guessed IDs.
- After writing, run the validation commands and report how many recordings were
  added.
- Use the default cache. Use `--no-cache` for a one-off run and
  `--refresh-cache` when fresh results are needed.
- If `yt-dlp` or the network is unavailable, stop and report the failure. Do not
  infer that recordings do not exist.
- Do not run network-heavy scans in CI. Keep reports under `tmp/`; do not commit
  them.
