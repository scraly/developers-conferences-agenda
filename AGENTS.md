# Agents

## Git discipline

- Before starting work, sync the `upstream-main` worktree with `upstream/main`: `git -C ../upstream-main fetch upstream && git -C ../upstream-main merge --ff-only upstream/main`.
- Before creating a worktree, make sure `upstream-main` is up to date with `upstream/main` and `main` is up to date with `origin/main`.
- When creating a new worktree, ask whether to branch from `origin/main` (your fork's main, which may intentionally diverge) or `upstream-main` (clean mirror of `upstream/main` — the right base for PRs against `scraly/developers-conferences-agenda`).

## Project conventions

- Keep research reports under `docs/reports/`, explanatory documentation under `docs/`, and images under `docs/images/`.
- Do not use spaces in new filenames; use hyphens or underscores consistently with neighboring files.
- Do not commit or push changes unless the user explicitly asks.

## Development requirements

- Verify every UI change in mobile view as well as desktop.
- Ensure all tests pass before completing a change.

## Finding event recordings

Start with [Finding recordings](docs/recordings-workflow.md). Follow
[Using an Agent](docs/recordings-workflow.md#using-an-agent) for request
handling, review, write, cache, and failure rules.

Use `node tools/recordingScanner.js` for recording discovery. The metadata
format and UI behavior are in
[Recording metadata and rendering](docs/recordings-design.md).
