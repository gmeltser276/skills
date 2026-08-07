# ct-security-mcp

Bundles three MCP servers for the State of Connecticut security team.

| Server | Transport | Target |
|--------|-----------|--------|
| `falcon-commercial` | stdio (`uvx falcon-mcp`) | CrowdStrike Falcon Commercial CID, `api.us-2.crowdstrike.com` |
| `falcon-gov` | stdio (`uvx falcon-mcp`) | CrowdStrike Falcon GovCloud CID, `api.laggar.gcw.crowdstrike.com` |
| `tenable` | http | Tenable Hexa AI, `https://cloud.tenable.com/mcp/` |

Both Falcon servers run with `--read-only`, which drops every tool that mutates tenant state.

## Prerequisites

- `uv` on PATH, which provides `uvx`. The two Falcon servers do not start without it.
- A scoped Falcon API client per CID, read-only recommended.
- A Tenable One Foundation or Advanced license and a Vulnerability Management API key pair.

## Credentials

Claude Code prompts for all six values when you enable the plugin. There is nothing to put in a dotfile and no environment variables to export.

| Prompt | Goes to |
|--------|---------|
| Falcon Commercial API Client ID and Secret | Secure storage |
| Falcon GovCloud API Client ID and Secret | Secure storage |
| Tenable API Access Key and Secret Key | Secure storage |

All six are declared `sensitive: true`, so input is masked and the values go to the macOS Keychain, or to `~/.claude/.credentials.json` on WSL and Linux where no supported keychain is available. They are never written to `settings.json`.

The managed policy already denies `~/.claude/.credentials.json` in `permissions.deny`, `sandbox.filesystem.denyRead`, and `sandbox.credentials.files`, so the WSL fallback path is covered without any policy change.

To change a value later, run `/plugin`, open the plugin's detail view, and reconfigure.

## Verify

```bash
claude mcp list
```

Expect `falcon-commercial`, `falcon-gov`, and `tenable` connected, registered under the scoped names `plugin:ct-security-mcp:<server>`.

## Upstream status

`falcon-mcp` is in public preview. Do not rely on it for production incident response until CrowdStrike ships 1.0.
