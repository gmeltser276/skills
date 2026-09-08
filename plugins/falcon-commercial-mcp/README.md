# falcon-commercial-mcp

CrowdStrike Falcon MCP server for the Commercial CID, `api.us-2.crowdstrike.com`.

Runs `uvx falcon-mcp@0.19.0` with the full tool surface, including Real Time Response command execution, host containment, IOC and custom IOA management, prevention policy changes, Fusion workflow execution, and AgentWorks.

Authorization comes from Falcon API RBAC, not from this plugin. The scopes on your API client decide what you can actually do, so issue credentials accordingly.

## Prerequisites

- `uv` on PATH, which provides `uvx`. The server does not start without it.
- A Falcon API client on the Commercial CID, scoped to the work you do.

## Dynamic tool discovery

`FALCON_MCP_DYNAMIC=true` is set, so the server registers three tools rather than all 169:

- `falcon_search_tools` finds the right tool for a task
- `falcon_execute_tool` runs it
- `falcon_list_enabled_tools` lists what is available

Every capability stays reachable. The difference is context: 169 tool definitions cost roughly 82,000 tokens on every message, and the three discovery tools cost about 1,200.

## Pinned version

The `falcon-mcp` version is pinned. Unpinned, `uvx` picks up each upstream release within a day, which silently changes the tool surface. Upstream went from 122 to 166 tools in one month and added workflow and agent execution along the way.

To upgrade, change the pin in `.mcp.json`, review what changed, and bump the plugin version.

## Credentials

Claude Code prompts for the client ID and secret when you enable the plugin. There is nothing to put in a dotfile and no environment variables to export.

Both values are declared `sensitive: true`, so input is masked and the values go to the macOS Keychain, or to `~/.claude/.credentials.json` on WSL and Linux where no supported keychain is available. They are never written to `settings.json`.

To change a value later, run `/plugin`, open the plugin's detail view, and reconfigure.

## Verify

```bash
claude mcp list
```

Expect `falcon-commercial` connected, registered under the scoped name `plugin:falcon-commercial-mcp:falcon-commercial`. It should expose three tools. If you see the full list instead, `FALCON_MCP_DYNAMIC` did not take effect.

## Audit attribution

API calls carry `ct-soc-cc/0.2.0` in the User-Agent comment, which separates Claude Code activity from the Claude Desktop bundle (`ct-soc-mcpb/0.2.0`) and from console or script activity in Falcon audit logs.

## Upstream status

`falcon-mcp` is in public preview and pre-1.0.
