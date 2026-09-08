# tenable-mcp

Tenable Vulnerability Management MCP server, `https://cloud.tenable.com/mcp/`.

Unlike the `uvx`-based plugins in this marketplace, this one connects to a server Tenable
hosts and operates. There is no package to pin: Tenable controls the version, the tool
surface, and what those tools do, and can change any of it without notice. Treat the set of
available tools as subject to change rather than fixed by this plugin, and re-check the
surface with `claude mcp list` after Tenable ships platform updates.

Credentials are sent to Tenable as an `X-ApiKeys` header on each request. Scope the API key
pair to what you need; the plugin does not filter tools.

## Prerequisites

- A Tenable One Foundation or Advanced license and a Vulnerability Management API key pair.

## Credentials

Claude Code prompts for the access key and secret key when you enable the plugin. There is nothing to put in a dotfile and no environment variables to export.

Both values are declared `sensitive: true`, so input is masked and the values go to the macOS Keychain, or to `~/.claude/.credentials.json` on WSL and Linux where no supported keychain is available. They are never written to `settings.json`.

To change a value later, run `/plugin`, open the plugin's detail view, and reconfigure.

## Verify

```bash
claude mcp list
```

Expect `tenable` connected, registered under the scoped name `plugin:tenable-mcp:tenable`.
