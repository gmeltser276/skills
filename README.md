# skills marketplace

A Claude Code plugin marketplace.

## Installation

```
/plugin marketplace add gmeltser276/skills
/plugin menu
```

Or add it manually to `~/.claude/settings.json` under `extraKnownMarketplaces`:

```json
"skills": {
  "source": {
    "source": "github",
    "repo": "gmeltser276/skills"
  }
}
```

## Available Plugins

| Plugin | Description |
|--------|-------------|
| [terse-mode](plugins/terse-mode/) | Token-efficient, grammatically complete responses - cuts filler, hedging, and preamble without dropping articles or fragmenting sentences. |
| [grill-me](plugins/grill-me/) | Stress-test a plan through relentless one-at-a-time questioning until every decision branch is resolved. |
| [reflection](plugins/reflection/) | Review and improve Claude Code instructions, commands, and config based on where past responses fell short. |
| [legislative-bill-analysis](plugins/legislative-bill-analysis/) | Analyze bills, executive orders, and regulatory frameworks through policy-intent and security-operations lenses. |
| [deslop](plugins/deslop/) | Remove AI writing patterns from prose. |
| [humanizer](plugins/humanizer/) | Remove 50+ documented AI writing patterns across vocabulary, rhetoric, tone, and structure. |
| [six-hats](plugins/six-hats/) | Structured six-hats debate across six colored-perspective lenses. |
| [falcon-commercial-mcp](plugins/falcon-commercial-mcp/) | CrowdStrike Falcon MCP server for the Commercial CID, read-only. |
| [falcon-gov-mcp](plugins/falcon-gov-mcp/) | CrowdStrike Falcon MCP server for the GovCloud CID, read-only. |
| [tenable-mcp](plugins/tenable-mcp/) | Tenable Vulnerability Management MCP server. |
| [gti-mcp](plugins/gti-mcp/) | Google Threat Intelligence MCP server (VirusTotal-backed). |

## License

The marketplace itself and the plugins authored here - `terse-mode`, `grill-me`,
`reflection`, `legislative-bill-analysis` - are MIT, see LICENSE.

Three plugins redistribute upstream work and carry their own terms:

| Plugin | Upstream | License |
|--------|----------|---------|
| deslop | [stephenturner/skill-deslop](https://github.com/stephenturner/skill-deslop) | MIT, see plugin LICENSE |
| humanizer | [blader/humanizer](https://github.com/blader/humanizer) | MIT, see plugin LICENSE |
| six-hats | [juanallo/six-hats-skill](https://github.com/juanallo/six-hats-skill) | None declared, see plugin [NOTICE.md](plugins/six-hats/NOTICE.md) |

`legislative-bill-analysis` derives its output structure from danielmiessler/fabric's
`analyze_bill` pattern (MIT), substantially rewritten.
