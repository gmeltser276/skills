# falcon-gov-mcp

CrowdStrike Falcon MCP server for the GovCloud CID, `api.laggar.gcw.crowdstrike.com`.

Runs `uvx falcon-mcp --read-only`, which drops every tool that mutates tenant state.

## Prerequisites

- `uv` on PATH, which provides `uvx`. The server does not start without it.
- A scoped Falcon API client on the GovCloud CID, read-only recommended.

## Credentials

Claude Code prompts for the client ID and secret when you enable the plugin. There is nothing to put in a dotfile and no environment variables to export.

Both values are declared `sensitive: true`, so input is masked and the values go to the macOS Keychain, or to `~/.claude/.credentials.json` on WSL and Linux where no supported keychain is available. They are never written to `settings.json`.

To change a value later, run `/plugin`, open the plugin's detail view, and reconfigure.

## Verify

```bash
claude mcp list
```

Expect `falcon-gov` connected, registered under the scoped name `plugin:falcon-gov-mcp:falcon-gov`.

## Upstream status

`falcon-mcp` is in public preview. Do not rely on it for production incident response until CrowdStrike ships 1.0.
