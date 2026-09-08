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
| [falcon-commercial-mcp](plugins/falcon-commercial-mcp/) | CrowdStrike Falcon MCP server for the Commercial CID, full access including RTR and containment. |
| [falcon-gov-mcp](plugins/falcon-gov-mcp/) | CrowdStrike Falcon MCP server for the GovCloud CID, full access including RTR and containment. |
| [tenable-mcp](plugins/tenable-mcp/) | Tenable Vulnerability Management MCP server. |
| [gti-mcp](plugins/gti-mcp/) | Google Threat Intelligence MCP server (VirusTotal-backed). Includes a tool that uploads local files to VirusTotal. |
| [m365-mcp](plugins/m365-mcp/) | CLI for Microsoft 365 MCP server. Manage the tenant with m365 commands. |

### Security tooling plugins

`falcon-commercial-mcp` and `falcon-gov-mcp` expose the full CrowdStrike Falcon tool
surface, including Real Time Response command execution, host containment, IOC and
custom IOA management, and prevention policy changes. They do not filter tools.
Authorization comes from Falcon API RBAC, so the scopes on the API client you configure
are what decide access. Issue credentials accordingly.

Both pin `falcon-mcp` to an exact version rather than tracking upstream, and both enable
dynamic tool discovery so the server registers three discovery tools instead of all 169
tool definitions. Every tool stays reachable; the difference is roughly 82,000 tokens of
context per message versus 1,200. See each plugin's README for details.

`gti-mcp` includes `analyse_file`, which reads a local file and uploads it to VirusTotal.
Upstream documents that the file is shared with the VirusTotal community, so it is a
one-way transfer of local data to a third party rather than a lookup. The upstream package
cannot disable individual tools; block it with a `mcp__gti__analyse_file` deny rule in your
Claude Code permissions if that is not acceptable in your environment. See the plugin
[README](plugins/gti-mcp/) for details.

`tenable-mcp` connects to a server Tenable hosts rather than running a local package, so
there is no version to pin and Tenable controls the tool surface. Scope the API key pair
accordingly.

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
