# ctdata

Query Connecticut's open data portal (data.ct.gov) and look up which agency a state employee works for. Search the catalog, run SoQL queries, and mirror datasets into a local SQLite database.

The plugin adds a `ctdata` skill and registers the `data-ct-gov-pp-mcp` MCP server. It contains no binaries. Install them from the release first.

## Install the binaries

Download from the [`ctdata-v0.3.0` release](https://github.com/gmeltser276/skills/releases/tag/ctdata-v0.3.0). Each archive holds `ctdata` and `data-ct-gov-pp-mcp`. Keep both in the same folder: the MCP server runs `ctdata` from its own folder for the agency lookups.

Check the download against `checksums.txt` from the same release before running anything.

macOS (universal binary, Apple Silicon and Intel):

```bash
shasum -a 256 -c checksums.txt --ignore-missing
mkdir -p ~/.local/bin
tar -xzf ctdata_0.3.0_darwin_universal.tar.gz -C ~/.local/bin
xattr -d com.apple.quarantine ~/.local/bin/ctdata ~/.local/bin/data-ct-gov-pp-mcp
ctdata version
```

Windows (PowerShell, amd64; also runs on Windows on Arm):

```powershell
Get-FileHash ctdata_0.3.0_windows_amd64.zip -Algorithm SHA256
$dir = "$env:LOCALAPPDATA\Programs\ctdata"
Expand-Archive ctdata_0.3.0_windows_amd64.zip -DestinationPath $dir -Force
[Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path", "User") + ";$dir", "User")
```

Open a new terminal on Windows so the PATH change applies, then run `ctdata version`.

The binaries are not code-signed. On managed machines, Gatekeeper, SmartScreen, or application control may block them until they are allowed.

## Install the plugin

```
/plugin marketplace add gmeltser276/skills
/plugin install ctdata@skills
```

Start Claude Code from a terminal where `ctdata version` works, so the MCP server is on `PATH`.

## Claude Desktop

Claude Desktop does not use this plugin. Download `ctdata-0.3.0.mcpb` from the same release and double-click it. The bundle includes its own macOS and Windows binaries.

## App token

A data.ct.gov app token is optional. Without one, queries still work at Socrata's lower shared rate limits.

Claude Code prompts for it when you enable the plugin. The value is declared `sensitive: true`, so input is masked and it is stored in secure storage, never in `settings.json`. To change it later, run `/plugin`, open the plugin's detail view, and reconfigure.

## Data and privacy

- All data comes from public data.ct.gov datasets. The default payroll dataset is `9m78-yc88`.
- Caches, the SQLite mirror, `learnings`, and `feedback` stay on your machine. Nothing is sent anywhere except data.ct.gov queries.
- Set `DATA_CT_GOV_HOME` in your environment to move all local state to one folder.

## Tool cost

The server exposes 34 tools, about 21,000 tokens of tool definitions.

## Verify

```bash
claude mcp list
```

Expect `ctdata` connected, registered under the scoped name `plugin:ctdata:ctdata`.

## License

Apache-2.0. See `LICENSE` and `NOTICE`. Generated with [CLI Printing Press](https://github.com/mvanhorn/cli-printing-press).
