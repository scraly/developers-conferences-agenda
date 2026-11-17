# Agents

## Git discipline

- Before starting work, sync the `upstream-main` worktree with `upstream/main`: `git -C ../upstream-main fetch upstream && git -C ../upstream-main merge --ff-only upstream/main`.
- When creating a new worktree, ask whether to branch from `origin/main` (your fork's main, which may intentionally diverge) or `upstream-main` (clean mirror of `upstream/main` — the right base for PRs against `scraly/developers-conferences-agenda`).
