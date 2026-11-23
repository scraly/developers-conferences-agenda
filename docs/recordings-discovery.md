# Recording discovery

## Instructions

1. **Start with the repository event.** Use the exact date and name from `README.md` or `archives/YYYY.md`. Preserve existing attendees and unrelated metadata.
2. **Check official sources directly.** Inspect the event site and the organizer's own playlist inventory, not just web-search results or a channel's Videos tab.
3. **Prefer the best source:** dedicated event playlist/archive → official recording index → day, room, track, or individual recordings → general organizer channel.
4. **Verify every link.** Check its title, owner, event edition, content, and public accessibility. Never guess a URL or playlist/video ID.
5. **Write clean metadata.** Use the exact generated event ID, deduplicate URLs within an event, and label every entry when an event has multiple recordings.
6. **Describe coverage accurately.** Individual talks and generic channels are partial evidence, not a complete archive. Recheck them for a dedicated collection later.
7. **Keep derived files synchronized.** Regenerate event data and update the statistics and infographic after metadata changes. Visually inspect regenerated images.

## Mistakes to avoid

- **Stopping at search results.** FOSS4G Asia and Norfolk Developers initially used individual videos or channel links even though dedicated playlists existed. Always inspect the organizer's playlist inventory before using a fallback.
- **Guessing or reusing the wrong edition.** Do not invent IDs or substitute another year's, city's, or event's playlist.
- **Adding orphaned metadata.** A recording attached to a nonexistent or misspelled event ID is silently ignored. Do not add metadata for an event absent from the repository; flag it for event-list reconciliation instead.
- **Treating a plausible page as a recording.** Recaps, aftermovies, promotions, sponsor interviews, CFPs, schedules, and empty or private playlists are not substitutes for public session recordings.
- **Claiming absence.** "No confirmed recording found" means the scan did not find one, not that none exists. Recent events may still be awaiting publication.
- **Changing source identities to force a match.** Keep archive dates and names unchanged during recording integration unless a separate correction is intentional and verified.
- **Leaving duplicate or unlabeled entries.** Multi-recording values must have distinct URLs and useful labels.
- **Updating only the metadata.** Canonical-link replacements can change several derived counts even when the number of recorded events stays the same.

## Validation

Run from `tools/` after metadata changes:

```sh
node mdParser.js
node mdValidator.js
node --test test-mdParser.js
```

Confirm new IDs match generated events, check for duplicates, and run `git diff --check`. Keep the [recording statistics](recordings-stats.md) and its infographic consistent with the regenerated data.
