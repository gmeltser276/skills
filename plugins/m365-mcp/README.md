# m365-mcp

CLI for Microsoft 365 MCP server, wrapping [`@pnp/cli-microsoft365-mcp-server`](https://github.com/pnp/cli-microsoft365-mcp-server), pinned to 0.1.23.

## Prerequisites

Both are required before enabling the plugin.

```bash
node --version                        # 20 or higher
npm install -g @pnp/cli-microsoft365  # must be the global npm install
```

The global npm install is not optional and not a duplicate of the MCP server package. The server ships only the protocol layer and shells out to the `m365` binary, and its `m365_search_commands` and `m365_get_command_docs` tools locate their data files by running `npm list -g`. A Homebrew or project-local CLI leaves those two tools reporting `@pnp/cli-microsoft365 npm package not found` while `m365_run_command` still works, so the server looks healthy while answering command-syntax questions wrongly.

## Credentials

There is no prompt when you enable the plugin. Authentication is interactive and happens outside it:

```bash
m365 login
```

The CLI writes its tokens as plaintext JSON to `~/.cli-m365-msal.json`, `~/.cli-m365-connection.json`, and `~/.cli-m365-all-connections.json`. The first holds refresh tokens and the other two hold per-resource access tokens. Deny reads of all three in your settings if the machine runs an agent:

```json
"permissions": { "deny": ["Read(~/.cli-m365-*.json)"] }
```

An expired login surfaces through the tools as `AADSTS50078: Presented multi-factor authentication has expired`. Run `m365 login` again.

## Tools

| Tool | Reaches the tenant |
|------|--------------------|
| `m365_run_command` | Yes |
| `m365_search_commands` | No |
| `m365_get_command_docs` | No |
| `m365_get_best_practices` | No |

`m365_run_command` has **no read-only mode**. It runs any command starting with `m365`, destructive ones included, and Claude Code permission rules match tool names rather than arguments, so there is no way to allow reads and deny writes. Add an `ask` rule so every command is shown for approval before it runs:

```json
"permissions": { "ask": ["mcp__plugin_m365-mcp_m365__m365_run_command"] }
```

That is a workflow control, not an authorization boundary. What the server can actually do is bounded by the delegated scopes of the Entra app and by the signed-in user's own tenant role. To constrain it further, register a tenant-owned app with a trimmed scope set and point the CLI at it with `CLIMICROSOFT365_ENTRAAPPID`.

## Verify

```bash
claude mcp list
```

Expect `m365` connected, registered under the scoped name `plugin:m365-mcp:m365`.

Plugins do not load in Claude Desktop WSL sessions. Use the terminal CLI inside the distribution.
