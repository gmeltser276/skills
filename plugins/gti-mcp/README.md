# gti-mcp

Google Threat Intelligence MCP server, backed by VirusTotal (`gti_mcp`).

Runs `uvx --from "gti-mcp==0.1.3" gti_mcp`. The package is `gti-mcp` and the entry point is `gti_mcp`, which is why the version is pinned with `--from` rather than the shorter `pkg@version` form.

Exposes 36 tools, roughly 19,000 tokens of tool definitions. The upstream package has no tool-filtering or discovery mode, so that cost applies whenever the plugin is enabled.

## Uploading files to VirusTotal

`analyse_file` reads a local file and uploads it. The upstream docstring states the consequence plainly:

> The file will be uploaded to VirusTotal and shared with the community.

That is a one-way data transfer to a third party. A file containing case material, PII, or anything else non-public becomes reachable by other VirusTotal users, and deleting it afterward does not undo the distribution. Claude decides when to call this tool, so treat it as a real egress path rather than a lookup.

The package offers no way to disable individual tools. To block it, add a permission rule in your Claude Code settings:

```json
"permissions": {
  "deny": ["mcp__gti__analyse_file"]
}
```

Every other tool is a lookup or search against VirusTotal and Google Threat Intelligence, except `create_collection`, `update_collection_attributes`, and `update_iocs_in_collection`, which write to your own GTI tenant and do not transmit local files.

## Pinned version

`gti-mcp` is pinned to `0.1.3`. Unpinned, `uvx` picks up new releases without review. Upstream releases are infrequent, only `0.1.2` and `0.1.3` so far, so this pin should need attention rarely.

To upgrade, change the version in `.mcp.json`, review what changed, and bump the plugin version.

The previous configuration passed `--with "mcp<2"`. That was a genuine workaround for `0.1.2`, which declared a bare `Requires-Dist: mcp` and could resolve an incompatible 2.x. Version `0.1.3` declares `mcp<2.0,>=1.23.0` upstream, so the workaround is no longer needed and has been removed.

## Prerequisites

- `uv` on PATH, which provides `uvx`. The server does not start without it.
- A VirusTotal / Google Threat Intelligence API key.

## Credentials

Claude Code prompts for the API key when you enable the plugin. There is nothing to put in a dotfile and no environment variables to export.

The value is declared `sensitive: true`, so input is masked and it goes to the macOS Keychain, or to `~/.claude/.credentials.json` on WSL and Linux where no supported keychain is available. It is never written to `settings.json`.

To change the value later, run `/plugin`, open the plugin's detail view, and reconfigure.

## Verify

```bash
claude mcp list
```

Expect `gti` connected, registered under the scoped name `plugin:gti-mcp:gti`.
