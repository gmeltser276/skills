# skills marketplace

A Claude Code plugin marketplace (name: `skills`). Currently hosts one plugin, with room to
add more. Source repo: gmeltser276/terse-mode.

## Installation

```
/plugin marketplace add gmeltser276/terse-mode
/plugin menu
```

Or add it manually to `~/.claude/settings.json` under `extraKnownMarketplaces`:

```json
"skills": {
  "source": {
    "source": "github",
    "repo": "gmeltser276/terse-mode"
  }
}
```

## Available Plugins

| Plugin | Description |
|--------|-------------|
| [terse-mode](plugins/terse-mode/) | Token-efficient, grammatically complete responses - cuts filler, hedging, and preamble without dropping articles or fragmenting sentences. |

## License

MIT - see LICENSE.
