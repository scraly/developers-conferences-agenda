# Recording workflow

This guide covers finding, verifying, and removing recording links in
`METADATA.csv`. For the short checklist see
[recordings-discovery.md](recordings-discovery.md), and for the metadata format
and rendering rules see [recordings-design.md](recordings-design.md).

## Finding event recordings

### What to look for

Use one of these:

1. A playlist for the specific edition (title contains event name and year).
2. A specific video of a talk or the full stream from the edition.

Do **not** add a bare channel link (`/@handle`, `/channel/...`, `/c/...`,
`/user/...`). A recent upload there does not prove the event was recorded, and
these links are removed even when the channel is active.

### Sources

Check these in order:

1. The event website's "recordings", "videos", "media", or "watch" page.
2. The official YouTube channel's playlist tab.
3. YouTube search.
4. The event's social posts or newsletter archive, which often link directly to
   the playlist.

### Commands

These require `yt-dlp` (`brew install yt-dlp`).

List a channel's playlists:

```bash
yt-dlp --flat-playlist --print '%(title)s\t%(url)s' \
  'https://www.youtube.com/@HANDLE/playlists'
```

Search YouTube:

```bash
yt-dlp --flat-playlist --print '%(title)s\t%(channel)s\t%(id)s' \
  'ytsearch20:Conference Name 2026'
```

List a channel's newest uploads:

```bash
yt-dlp --flat-playlist --playlist-end 10 --print '%(id)s\t%(title)s' \
  'https://www.youtube.com/@HANDLE/videos'
```

List a playlist's items:

```bash
yt-dlp --flat-playlist --playlist-end 10 --print '%(id)s\t%(title)s' \
  'https://www.youtube.com/playlist?list=PLAYLIST_ID'
```

These listings return IDs and titles, not dates. Playlists are usually
newest-first, but scan the titles rather than trusting the order.

### Judging a candidate

Before writing it into `METADATA.csv`, confirm:

- The link is a playlist or a specific video, not a channel.
- The channel or playlist belongs to the event, not to a sponsor, a single
  speaker, or a different conference with a similar name.
- The playlist title or video titles match this edition (name **and** year).
- The content is talks or a stream, not a promo, recap, or highlight reel.

Then verify the date rule below. If no upload is newer than the event date, do
not add the link.

## Verifying dates

A link is valid for an event on date `D` when at least one reachable video was
published **after `D`**. The event date is the `YYYY-MM-DD` prefix of
`event_id`. Use actual upload dates, not title text; one matching video is
enough. Same-day uploads are valid only after confirming the video is the event
recording.

Future events cannot be verified: keep the link and re-check after the event.

```bash
python3 tools/auditRecordingDates.py METADATA.csv --deep --workers 8
```

The report is `tmp/recording-date-report.tsv`; the cache is
`tmp/recording-dates.json` (delete it to rescan).

- Remove `STALE` links. Retry `NO_DATA` once, then remove if still unusable.
- Keep `OK`, `FUTURE`, and `SAME_DAY` after confirming the recording.
- `NO_DATE` means the `event_id` is malformed; fix the id, not the link.

Single link:

```bash
yt-dlp --skip-download --print '%(upload_date)s\t%(title)s' \
  'https://www.youtube.com/watch?v=VIDEO_ID'
```

`upload_date` is `YYYYMMDD` in UTC. For a channel, the latest 15 uploads with
dates come from RSS (see below), which is much less likely to be blocked.

## Reliable date sources when yt-dlp is blocked

YouTube often answers bursts of metadata requests with:

```
Sign in to confirm you're not a bot
```

This is not an empty channel. With `--ignore-errors`, it silently produces
empty output, so a batch can look like hundreds of `NO_DATA` results. Signs of
throttling:

- most links suddenly return no dates;
- the same request works later or with a different client;
- `--cookies-from-browser` does not help unless that browser is signed in.

Do not keep retrying with high concurrency. Prefer RSS, which requires no auth
and is far less throttled.

### Channel ID

`/channel/UC...` URLs already contain it. For `@handle`, `/c/name`, and
`/user/name`, read it from the channel page:

```bash
curl -sL -A 'Mozilla/5.0' 'https://www.youtube.com/@HANDLE' \
  | grep -o 'itemprop="identifier" content="UC[^"]*"' | head -1
```

### Channel RSS (latest 15 uploads)

```bash
curl -s "https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID" \
  | grep -o '<published>[^<]*' | head -15
```

### Playlist RSS

```bash
curl -s "https://www.youtube.com/feeds/videos.xml?playlist_id=PLAYLIST_ID" \
  | grep -o '<published>[^<]*' | head -15
```

### Single video without yt-dlp

A public reader proxy renders the watch page as text, including the publish
date next to the view count:

```bash
curl -s "https://r.jina.ai/https://www.youtube.com/watch?v=VIDEO_ID" \
  | grep -oE '(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) [0-9]{1,2}, 20[0-9]{2}' \
  | head -1
```

The line looks like `144 views • Feb 15, 2026`. Use this only as a fallback;
it is a third-party service and can rate-limit.

`yt-dlp`'s oEmbed endpoint is another auth-free way to identify a video when
metadata is blocked (title and channel, but no date):

```bash
curl -s 'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=VIDEO_ID&format=json'
```

## Lessons learned

- **RSS dates are close, not always exact.** For a channel, `<published>` is
  the video publish date. For a playlist it is effectively when the item was
  added, which can differ from the upload date by a few days.
- **Feeds are not sorted, and may contain pinned old videos.** Take the
  maximum date across all entries, never the first.
- **Merge all evidence.** A 2–3 item sample can miss a newer upload that a
  15-item RSS feed contains. Take the maximum across flat samples, channel
  RSS, playlist RSS, and reader-proxy results.
- **A high `NO_DATA` count means throttling, not empty channels.** Re-check
  those links through RSS before concluding anything.
- **`--flat-playlist` never returns dates.** It is still useful when metadata
  is blocked: IDs and titles keep working.
- **A recent upload is not proof.** A save-the-date, CFP, trailer, recap, or
  sponsor video can be newer than the event. Check that the title matches the
  edition and looks like a talk or full stream.
- **A stale link is often a previous edition.** Titles frequently name the
  prior year; do not assume the year in the URL is the edition.
- **Same-day uploads are normal** for live events and conference series that
  publish on the day (for example Conf42). Keep them once the content matches.
- **Recently held events may simply not be uploaded yet.** A `STALE` verdict
  for an event from the last few weeks can be premature. Re-check before
  removing, or flag it for a later pass.
- **Bare channel links are not kept.** The channel's newest upload may be
  unrelated to this event; only edition playlists and specific videos are
  accepted.
- **One URL can serve several events.** Audit each unique URL once; every row
  using it gets the same verdict.
- **Do not trust a bulk run with `--ignore-errors`.** Capture stderr, compare
  the empty-result rate, and fall back to RSS when it spikes.
- **`--cookies-from-browser` is only useful if that browser is signed in.**
  Safari cookies may also be unreadable because of macOS sandboxing.

## Removing a stale link

Delete only the `recording:`/`recordings:` field and its leading comma; keep
`attendees:` and other fields. Split at field boundaries, never at every comma,
because event ids and labels may contain commas. Edit line by line, never with a
global `sed`:

```bash
python3 - <<'EOF'
import re
drop = {"2026-06-17-Devoxx Poland"}  # event_id prefixes
field = re.compile(r",(?=(?:attendees|recordings?):)")
lines = []
for line in open("METADATA.csv"):
    line = line.rstrip("\n")
    parts = field.split(line)
    if parts[0] in drop:
        parts = [parts[0]] + [
            p for p in parts[1:] if not p.startswith(("recording:", "recordings:"))
        ]
    lines.append(",".join(parts))
open("METADATA.csv", "w").write("\n".join(lines) + "\n")
EOF
```

Then check `git diff -- METADATA.csv`: only intended lines should change and
the line count must stay the same.

## Notes

- Playlists are not guaranteed newest-first. `--deep` covers this; if a link
  still looks stale, check more items.
- Non-YouTube links need a manual date check.
- If `yt-dlp` keeps failing, run the audit later with fewer workers rather than
  deleting links based on empty results.
