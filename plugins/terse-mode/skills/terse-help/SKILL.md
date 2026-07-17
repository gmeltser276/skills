---
name: terse-help
description: >
  Overview of terse-mode: levels, activation phrases, slash commands, statusline
  integration, and independence from other plugins.
---

terse-mode makes Claude respond with grammatical brevity — no filler, no hedging, no preamble,
but complete sentences and full technical accuracy.

## Intensity levels

| Level | Behavior |
|-------|----------|
| lite  | Drop pleasantries and preamble only. Otherwise normal prose. |
| full  | Answer-first. Drop filler, hedging, preamble, and recap. Tight, complete sentences. (default) |
| ultra | Maximum density. Short declarative sentences, one idea each. Still grammatical — no fragments. |

## Turning it on and off

**Slash commands:**
- `/terse` or `/terse full` — activate at full intensity
- `/terse lite` — activate at lite intensity
- `/terse ultra` — activate at ultra intensity
- `/terse off` — deactivate

**Natural language:**
- "terse mode", "be terse", "turn on terse" — activates at default (full)
- "stop terse", "normal mode" — deactivates

## Stats

`/terse-stats` — show token usage and estimated savings for the current session.
`/terse-stats --all` — lifetime totals.
`/terse-stats --since 7d` — last 7 days.

## Statusline badge

`terse-statusline.sh` outputs a cyan `[TERSE]` badge (or `[TERSE:LITE]` / `[TERSE:ULTRA]`)
for use with Claude Code's `statusLine` setting. Wire it manually by adding this to
`~/.claude/settings.json`:

```json
"statusLine": { "type": "command", "command": "bash /path/to/terse-statusline.sh" }
```

The plugin does not modify your statusline automatically.

## Independence

terse-mode is a standalone plugin. It shares no files or runtime artifacts with any other plugin.
Removing or disabling another plugin does not affect terse-mode, and vice-versa.

Flag file: `~/.claude/.terse-active`
History: `~/.claude/.terse-history.jsonl`
Config: `~/.config/terse-mode/config.json` (optional; env `TERSE_DEFAULT_MODE` overrides)
