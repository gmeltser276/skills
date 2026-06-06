# terse-mode

A Claude Code plugin that enforces token-efficient, grammatically complete responses. It
cuts roughly 40-60% of output tokens by removing filler, pleasantries, hedging, and
preamble — while keeping full sentences, articles, and technical accuracy.

## What it is not

terse-mode is not caveman mode. It does not drop articles, does not produce fragments, and
does not use telegraphic patterns. Every response is complete, readable English. The only
thing removed is what adds no information.

Before:
> "Sure! That's a great question. The issue you're experiencing is most likely caused by
> a token-expiry check that uses `<` instead of `<=`."

After (full mode):
> "The token-expiry check uses `<` instead of `<=`. Change it to `<=`."

## Intensity levels

| Level | What changes |
|-------|--------------|
| lite  | Drop pleasantries and preamble only. Otherwise normal prose. |
| full  | Answer-first. Drop filler, hedging, preamble, and recap. Tight, complete sentences. (default) |
| ultra | Maximum density. Short declarative sentences, one idea each. Still grammatical — no fragments, no dropped articles. |

## Install

1. Add to `~/.claude/settings.json` under `extraKnownMarketplaces`:
   ```json
   "terse-mode": {
     "source": {
       "source": "directory",
       "path": "/Users/yourname/.claude/plugins/marketplaces/terse-mode"
     }
   }
   ```
2. Add to `enabledPlugins`:
   ```json
   "terse-mode@terse-mode": true
   ```
3. Restart Claude Code. The plugin activates automatically on every session start.

## Activation and deactivation

**Slash commands:**
- `/terse` or `/terse full` — activate at full intensity
- `/terse lite` — activate at lite intensity
- `/terse ultra` — activate at ultra intensity
- `/terse off` — deactivate

**Natural language:**
- "terse mode", "be terse", "turn on terse" — activates at default (full)
- "stop terse", "normal mode" — deactivates

## Stats

`/terse-stats` — token usage and estimated savings for the current session.
`/terse-stats --all` — lifetime totals.
`/terse-stats --since 7d` — last 7 days.

Savings for `full` mode show a placeholder estimate (labeled "estimated, not yet benchmarked").
Actual savings depend on task type. lite and ultra show no estimate until benchmarks are run.

## Optional statusline badge

`hooks/terse-statusline.sh` outputs a cyan `[TERSE]` badge (or `[TERSE:LITE]` / `[TERSE:ULTRA]`)
for use with Claude Code's `statusLine` setting. Wire it manually by adding this to
`~/.claude/settings.json`:

```json
"statusLine": { "type": "command", "command": "bash /path/to/terse-statusline.sh" }
```

The plugin does not modify your statusline automatically.

## Independence

terse-mode is fully self-contained. It shares no files, no modules, and no runtime artifacts
with any other plugin. Removing or disabling another plugin does not affect terse-mode.

Runtime artifacts (all under `~/.claude/`):
- `.terse-active` — current mode flag
- `.terse-history.jsonl` — session stats log
- `.terse-statusline-suffix` — pre-rendered savings string for statusline

Config: `~/.config/terse-mode/config.json` (optional). Env `TERSE_DEFAULT_MODE` overrides.

## Out of scope for v1

Not included and not planned unless there is a real need: wenyan or other dialect modes,
commit/review/compress sub-skills, MCP middleware, multi-platform agent variants, benchmarks,
evals. These can be added separately without touching this plugin.

## Attribution

terse-mode descends from the caveman plugin by Julius Brussee
(https://github.com/JuliusBrussee/caveman), which pioneered the hook-based always-on
compression pattern for Claude Code. terse-mode is an independent fork that promotes caveman's
`lite` intensity philosophy — grammatical brevity — to the plugin's full identity.

## License

MIT — see LICENSE.
