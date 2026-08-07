# gti-mcp

Google Threat Intelligence MCP server, backed by VirusTotal (`gti_mcp`).

Runs `uvx --with "mcp<2" gti_mcp` - the `mcp<2` pin matches a dependency constraint in the upstream package.

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
