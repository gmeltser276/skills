---
name: terse-stats
description: >
  Display token usage and estimated savings for the current terse-mode session.
  Invoked via /terse-stats inside Claude Code.
---

Show token usage and estimated savings for the active session.

## Usage

- `/terse-stats` — current session stats
- `/terse-stats --all` — lifetime totals across all logged sessions
- `/terse-stats --since 7d` — lifetime totals for the last 7 days (also accepts `24h`, `30d`, etc.)
- `/terse-stats --share` — single-line summary suitable for sharing

## What it reports

- Output tokens used this session
- Cache-read tokens
- Estimated tokens saved (full mode only; labeled "estimated, not yet benchmarked")
- Estimated cost delta based on Anthropic public pricing

Savings figures for lite and ultra modes are not shown until benchmark data is collected.

## Notes

Stats are logged to `~/.claude/.terse-history.jsonl` on each `/terse-stats` run. The first run
starts the log; no data is written automatically between runs.
