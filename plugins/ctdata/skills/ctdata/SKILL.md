---
name: ctdata
description: "Query Connecticut's open data portal from the shell, and answer which agency a state employee belongs to in one command. Trigger phrases: `which agency does this employee work for`, `look up a CT state employee's agency`, `search data.ct.gov`, `query a connecticut open data dataset`, `state employee payroll lookup`, `use data-ct-gov`, `run data-ct-gov`."
author: "Gene Meltser"
license: "Apache-2.0"
argument-hint: "<command> [args] | install"
allowed-tools: "Read Bash"
---

# data.ct.gov — Printing Press CLI

## Prerequisites: Install the CLI

This skill drives the `ctdata` binary. **Verify it is installed before running any command:** `ctdata version`. If it is missing, stop and give the user these steps. Do not download or install binaries yourself.

Binaries are attached to the `ctdata-v0.3.0` release at https://github.com/gmeltser276/skills/releases/tag/ctdata-v0.3.0. Each archive holds two files, `ctdata` and `data-ct-gov-pp-mcp`, which must stay in the same folder.

macOS (universal binary, Apple Silicon and Intel):

```bash
mkdir -p ~/.local/bin
tar -xzf ctdata_0.3.0_darwin_universal.tar.gz -C ~/.local/bin
xattr -d com.apple.quarantine ~/.local/bin/ctdata ~/.local/bin/data-ct-gov-pp-mcp
ctdata version
```

Windows (PowerShell, amd64; also runs on Windows on Arm):

```powershell
$dir = "$env:LOCALAPPDATA\Programs\ctdata"
Expand-Archive ctdata_0.3.0_windows_amd64.zip -DestinationPath $dir -Force
[Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path", "User") + ";$dir", "User")
```

Open a new terminal on Windows so the PATH change applies, then run `ctdata version`. The folder must be on `PATH` for whatever runs this skill.

## When to Use This CLI

Use this CLI to query the Connecticut open data portal (data.ct.gov) from a script or agent, and specifically to map a CT state employee name to their agency, department, and job title. It is strongest for repeated, offline-capable agency lookups after a one-time sync.

## Anti-triggers

Do not use this CLI for:
- Do not use it for municipal or private-sector employees; it covers CT state payroll only.
- Do not use it to modify data; it is read-only and has no create/update/delete.
- Do not use it for open-data portals other than data.ct.gov.

## Unique Capabilities

These capabilities aren't available in any other tool for this API.

### Agency intelligence
Backed by the current State Employee Payroll dataset (`9m78-yc88`, calendar year 2015 through present), the only public dataset that lists current employees. Names are matched as `Last`, `First Last`, or `Last, First`; override with `--dataset` and the `*-field` flags for other sources.

- **`agency-of`** — Given a Connecticut state employee's name, return the agency, department, and job title they appear under (most recent year first).

  _Reach for this when you need to place a named CT state employee in an agency without knowing which dataset or query to run._

  ```bash
  ctdata agency-of Smith --agent
  ```
- **`agency roster`** — List the distinct employees and job titles under an agency, matched by a loose word search.

  _Use this to enumerate who worked at an agency without paging raw payroll rows yourself. The agency argument is matched loosely (each word as a case-insensitive substring), so `correction` resolves to `Dept. of Correction`; when a query matches several agencies it returns the candidate list (`ambiguous: true`) rather than merging them. Pass `--all` to roster across every match, or `--exact` for a verbatim match._

  ```bash
  ctdata agency roster correction --agent --rows 50
  ```
- **`agency list`** — List agencies with a current-year headcount; pass text to search agencies by a loose word match.

  _Use this to browse agencies, or `agency list <text>` to search them (the discovery path for roster). The headcount counts distinct employment records: the dataset's only employee id is a one-way hash of EMPLID + employment-record number, so an employee with two concurrent appointments is counted once per appointment, and there is no bare person id to collapse those further._

  ```bash
  ctdata agency list --agent          # every agency by headcount
  ctdata agency list health --agent   # agencies whose name contains "health"
  ```

### Local state that compounds
- **`agency-of`** — Prefer a local SQLite index for instant offline name-to-agency lookups after a one-time --rebuild-index; falls back to a live query when the index is empty.

  _Use --local for fast, rate-limit-free lookups once you have run --rebuild-index; it degrades to a live query if the index is not built._

  ```bash
  ctdata agency-of Smith --local --agent
  ```
- **`agency-of`** — Resolve a file of employee names to their agencies in one run, reporting any names that did not match.

  _Use this to reconcile a roster of names to agencies at once instead of one lookup per name._

  ```bash
  ctdata agency-of --file names.txt --agent
  ```

## Command Reference

**catalog** — Search and browse datasets published on data.ct.gov

- `ctdata catalog` — Search the data.ct.gov catalog for datasets by keyword, category, or tag

**dataset** — Query datasets and inspect their schema

- `ctdata dataset query` — Run a SoQL query against a dataset by its four-by-four id
- `ctdata dataset schema` — Show a dataset's column field names and types


### Finding the right command

When you know what you want to do but not which command does it, ask the CLI directly:

```bash
ctdata which "<capability in your own words>"
```

`which` resolves a natural-language capability query to the best matching command from this CLI's curated feature index. Exit code `0` means at least one match; exit code `2` means no confident match — fall back to `--help` or use a narrower query.

## Recipes

### Which agency is this employee in

```bash
ctdata agency-of Smith --agent
```

Returns distinct agency, department, and job-title rows for employees whose name matches (case-insensitive partial).

### Narrow a large payroll query for an agent

```bash
ctdata dataset query 9m78-yc88 --where "agency='University of Connecticut'" --rows 100 --agent --select last_name,first_name,agency,job_cd_descr
```

Pairs a SoQL filter with --select so the agent only parses the fields it needs from a large dataset.

### Build an offline agency index

```bash
ctdata agency-of --rebuild-index && ctdata agency-of Smith --local
```

Build the local agency index once, then answer name-to-agency questions offline from SQLite with no API call.

### List agencies with headcount

```bash
ctdata agency list --agent
```

One grouped query returns every agency and its distinct-employee headcount.

## Auth Setup
Run `ctdata auth setup` to print the URL and steps for getting a key (add `--launch` to open the URL). Then set:

```bash
export DATA_CT_GOV_APP_TOKEN="<your-key>"
```

To persist credentials, use `ctdata auth set-token <token>`. Stored secrets live in `credentials.toml` under the data dir, not in `config.toml`.

Run `ctdata doctor` to verify setup.

## Agent Mode

Add `--agent` to any command. Expands to: `--json --compact --no-input --no-color --yes`.

- **Pipeable** — JSON on stdout, errors on stderr
- **Filterable** — `--select` keeps a subset of fields. Dotted paths descend into nested structures; arrays traverse element-wise. Critical for keeping context small on verbose APIs:

  ```bash
  ctdata catalog --agent --select id,name,status
  ```
- **Previewable** — `--dry-run` shows the request without sending
- **Offline-friendly** — sync/search commands can use the local SQLite store when available
- **Non-interactive** — never prompts, every input is a flag
- **Read-only** — do not use this CLI for create, update, delete, publish, comment, upvote, invite, order, send, or other mutating requests

### Response envelope

Commands that read from the local store or the API wrap output in a provenance envelope:

```json
{
  "meta": {"source": "live" | "local", "synced_at": "...", "reason": "..."},
  "results": <data>
}
```

Parse `.results` for data and `.meta.source` to know whether it's live or local. A human-readable `N results (live)` summary is printed to stderr only when stdout is a terminal AND no machine-format flag (`--json`, `--csv`, `--compact`, `--quiet`, `--plain`, `--select`) is set — piped/agent consumers and explicit-format runs get pure JSON on stdout.

## Paths and state

Agents should treat the CLI's path resolver as part of the runtime contract:

- Use `--home <dir>` for one invocation, or set `DATA_CT_GOV_HOME=<dir>` to relocate all four path kinds under one root.
- Use per-kind env vars only when a specific kind must diverge: `DATA_CT_GOV_CONFIG_DIR`, `DATA_CT_GOV_DATA_DIR`, `DATA_CT_GOV_STATE_DIR`, `DATA_CT_GOV_CACHE_DIR`.
- Resolution order is per-kind env var, `--home`, `DATA_CT_GOV_HOME`, XDG (`XDG_CONFIG_HOME`, `XDG_DATA_HOME`, `XDG_STATE_HOME`, `XDG_CACHE_HOME`), then platform defaults.
- `config` contains settings like `config.toml` and profiles. `data` contains `credentials.toml`, `data.db`, cookies, and auth sidecars. `state` contains persisted queries, jobs, and `teach.log`. `cache` contains regenerable HTTP/cache files.
- Stored secrets live in `credentials.toml` under the data dir. Existing legacy `config.toml` secrets are read for compatibility and leave `config.toml` on the first auth write.
- Run `ctdata doctor --fail-on warn` to surface path and credential-location warnings. `agent-context` exposes a schema v4 `paths` block for agents that need the resolved dirs.
- For MCP, pass relocation through the MCP host config. The MCP binary does not inherit CLI flags:

  ```json
  {
    "mcpServers": {
      "data-ct-gov": {
        "command": "data-ct-gov-pp-mcp",
        "env": {
          "DATA_CT_GOV_HOME": "/srv/data-ct-gov"
        }
      }
    }
  }
  ```

Fleet precedence: an inherited per-kind env var overrides an explicit `--home` for that kind. Use `DATA_CT_GOV_HOME` or per-kind vars as durable fleet levers, and use `--home` only for a single invocation. Relocation is not reversible by unsetting env vars; move files manually before clearing `DATA_CT_GOV_HOME`, or `doctor` will not find credentials left under the former root.

## Automatic learning

This CLI ships a self-capturing learning loop. The CLI does its own bookkeeping: every invocation is journaled locally, a failed flag followed by a corrected retry auto-derives a `flag_alias` candidate, and a `teach` on a query family without a playbook auto-synthesizes a `playbook_candidate` from the session's journal. Your job is judgment only: `recall` first, act on surfaced candidates, `teach` the final answer, `playbook amend` when you observe a correction. You never record failures by hand.

### Step 1: `recall` before any discovery

Before list/search/drill commands on a new user question, run:

```bash
ctdata recall "<user's question>" --agent
```

The response envelope:

```json
{
  "query": "...",
  "normalized": "<normalized form>",
  "query_entities": ["..."],
  "found": true | false,
  "match_score": 0.0,
  "results": [
    { "resource_id": "...", "resource_type": "...", "venue": "...",
      "confidence": 2, "entity_match": "exact|partial|unknown",
      "source": "taught|preseed|pattern", "warnings": ["..."] }
  ],
  "mismatches": [ /* only when --debug-mismatches */ ],
  "warnings": [ /* top-level */ ],
  "candidates": [
    { "id": 12, "class": "flag_alias | playbook_candidate",
      "summary": "...", "sightings": 3, "last_seen": "...",
      "rationale": "...",
      "next_action": ["<trial command>", "ctdata learnings confirm 12"] }
  ],
  "playbook": {
    "query_family": "...",
    "playbook": {
      "steps": [ { "cmd": "<command with {slot} substitution>", "purpose": "..." } ],
      "entity_slots": ["$ENTITY"],
      "expected_tool_calls": 3
    },
    "slots_resolved": { "$ENTITY": { "token": "<live token>", "canonical": "<canonical>" } },
    "notes": "<workarounds + gotchas for this query family>"
  },
  "notes": "<duplicate surface for non-playbook callers>"
}
```

Empty-store short-circuit: if the store has no learnings, playbooks, or candidates yet (recall finds nothing and `learnings list` and `learnings candidates` are both empty), skip recall for the rest of this session instead of taxing every query; resume recall-first once something has been taught.

### Step 2: decision tree

Read `candidates`, `playbook`, `notes`, `results[0]`, and warnings in that order:

```
if Candidates present (warnings include "candidates_present"):
    -> candidates are try-then-confirm, never facts. Follow each candidate's
       two-step next_action verbatim: run the trial command first, then run
       `learnings confirm <id>` only after the trial verified the behavior.
       Reject a wrong candidate with `learnings reject <id>`.
    -> NEVER re-teach something recall surfaced as a candidate; confirm or
       reject that candidate instead of teaching a duplicate.
    -> candidates ride alongside playbooks and resource hits, not instead of
       them; continue with the branches below after acting on them.

if Playbook present:
    -> READ Playbook.notes verbatim FIRST (workarounds + gotchas the CLI surface doesn't expose)
    -> replay Playbook.steps in order, substituting Playbook.slots_resolved entries
       for the entity slot tokens. If a step's slot is unresolved, fall back to
       discovery for that step only.
    -> the Playbook's expected_tool_calls is a budget; if you find yourself running
       materially more, record the divergence via `ctdata playbook amend`
       at end-of-session.

elif Notes present (no Playbook):
    -> read Notes verbatim before any discovery step; they carry known gotchas
       for this query family even when no structured choreography exists yet.

elif Found AND Results[0].EntityMatch == "exact" AND Results[0].Confidence >= 2:
    -> skip discovery; fetch live data for Results[*].ResourceID in parallel

elif Found AND Results[0].EntityMatch == "partial":
    -> candidate hint, NOT a hit; read the resource title to validate before trusting

elif (any row in Mismatches[] when --debug-mismatches was passed):
    -> treat as cold start; the stored learning is for a different entity
       (different canonical resolved from query_entities)

else:  // Found == false, no playbook, no notes
    -> cold start; run discovery normally; teach the answer afterward (Step 4).
       If the family has no playbook yet, that teach auto-synthesizes a
       playbook candidate from this session's journal - you do not need to
       record one by hand.
```

Playbook and Notes are orthogonal to the per-resource path. A recall response can carry both a Playbook AND a `Results[]` hit - use both: the Playbook tells you which choreography to run; the resource hits short-circuit specific steps. Default to skipping `mismatches`; pass `--debug-mismatches` only when investigating cold-start surprises.

Candidate judgment details: `learnings confirm <id>` prints the candidate's full payload before materializing it - check that the printed payload matches the behavior you verified. `learnings reject <id>` tombstones the derivation signature so the same candidate does not resurface. The envelope carries only the few candidates worth acting on now; `ctdata learnings candidates` lists the full open set.

Graceful degradation: if `learnings confirm` is an unknown command, you are driving an older binary - ignore the candidates guidance and follow the rest of the protocol.

### Step 3: always read `warnings`

- `low_confidence`: row exists at `confidence<2`. Treat as a hint, not a skip-discovery hit.
- `resource_not_in_store`: the local store doesn't have the resource the learning points at. The match validator couldn't classify entities — direct-fetch and re-evaluate.
- `cross_alias_match` (per-result): the row was taught under a different alias and matched the live query's canonical via `entity_lookups` (e.g., a "USA" teach satisfying a "United States" recall). Trust the resource_id.
- `similar_shape_different_entity:<canonical>` (top-level): a structurally matching row exists but its canonical entity differs from the live query's. Treated as cold start; the warning carries the conflicting canonical as a hint, but the row is NOT promoted into Results.
- `ambiguous_alias` (top-level): a single query entity resolved to multiple canonicals (e.g., "Cards" → Arizona Cardinals + St. Louis Cardinals). Surface the ambiguity from context before committing to a resource.
- `candidates_present` (top-level): the envelope carries a `candidates` section. Handle it via the candidates branch in Step 2 before anything else.
- `lookup_refresh_available` (top-level): an entity in the query has no lookup row yet, but synced data could provide one. Run `ctdata sync` to refresh entity lookups.
- Top-level `no_learnings_for_query_family`: the table had no rows above the Jaccard floor. Pure cold start.

### Step 4: `teach &` after finalizing your response - always

Teaching is unconditional. After resolving a query the store could not answer, background-teach the final resource mapping - no call-count threshold, no judging whether it was "worth" learning. The teach is the anchor of the loop: it triggers playbook synthesis for a family without a playbook, and same-referent phrasings fold into one family so near-duplicate teaches do not fragment the store. Fire it after assembling your user-facing response but BEFORE emitting it, with a shell `&` so the call returns immediately:

```bash
ctdata teach --query "<user's question>" --resource-type <type> --resource <id1> --resource <id2>
# (append shell `&` to background it)
```

Silent on success. Errors only land in `teach.log` under the resolved state dir. Teach the **most specific** resource - if the user asked a broad question and you walked through parent records to find the specific answer, teach the leaf id, not the parent. The CLI uses seeded `entity_lookups` for cross-alias resolution at recall time, so a teach under one alias (e.g., "Niners") satisfies future queries under another alias (e.g., "49ers", "San Francisco") automatically.

PII rule: teach the structural question with identifiers stripped - never include names, emails, phone numbers, account ids, or other personal identifiers in taught queries or notes. The CLI scans teach queries for obvious email/phone shapes and warns, but does not block; strip before teaching rather than relying on the warning.

### Step 5: playbooks - optional flags, automatic synthesis

You do not need to decide whether a session "deserves" a playbook: a teach on a family without one auto-synthesizes a `playbook_candidate` from the session's journal, and the next session judges it via confirm/reject. Attach explicit playbook flags only when you already hold choreography worth recording verbatim - workarounds the CLI didn't surface (silently-dropped flags, undocumented params, pagination tricks, payload gotchas). Prefer the **integrated one-call form** - record the resource learning and the playbook in the same `teach` invocation:

```bash
# Common case: record both the resource learning AND the playbook in one call.
ctdata teach \
  --query "<user's question>" \
  --resource <id> \
  --playbook-file ~/playbooks/<shape>.json \
  --playbook-notes-file ~/playbooks/<shape>-notes.md
# (append shell `&` to background it)

# Alternate: playbook-only (no resource to record alongside).
ctdata teach-playbook \
  --query "<user's question>" \
  --playbook-file ~/playbooks/<shape>.json \
  --notes-file ~/playbooks/<shape>-notes.md
```

Playbook files are JSON with `steps`, `entity_slots`, `expected_tool_calls`. Notes files are markdown carrying the gotchas verbatim. File-free callers (MCP-only agents) pass the same content inline: `--playbook-json` and `--playbook-notes` on the integrated `teach` form, `--playbook-json` and `--notes` on `teach-playbook`. On the integrated `teach` form, the playbook flags are optional - omit them entirely for a resource-only teach. On the standalone `teach-playbook` form, at least one of the playbook and notes flags must be set; both empty is rejected. Playbooks are keyed on the structural query family (entities stripped) so a recipe taught from one entity-shaped query applies to every other query of the same shape, with `slots_resolved` binding the live query's canonical at recall time.

When you DO find a playbook on a future recall, treat it as ground truth: replay the steps with `slots_resolved` substitutions, skip the discovery that the choreography already documents, and read `notes` before any step.

### Step 6: `playbook amend &` when your debug response identifies a correction

If your debug-protocol response identifies a concrete correction the notes or playbook should know — a workaround, an undocumented endpoint shape, a stale field name, observed schema drift, an empty-payload fallback — fire `playbook amend` BEFORE emitting your user-facing response. Same fire-and-forget posture as `teach`.

```bash
ctdata playbook amend \
  --query "<exact recall query string>" \
  --add-note "<your concrete correction>"
# (append shell `&` to background it)
```

What counts as worth amending: a behavior you OBSERVED this session that future-you would benefit from knowing. Examples worth amending:

- A workaround for a CLI surface that silently drops or misorders a flag.
- An undocumented endpoint shape (response wrapped in `{meta, results}`, payload nested two levels deeper than the docs claim).
- Observed schema drift (a field renamed, an index that shifted between seasons, a category label that the API now returns lower-cased).

What does NOT belong in notes:

- The year-specific or entity-specific answer to the user's question. That's the response, not a learning.
- Per-team / per-athlete / per-row data the playbook already retrieves at runtime.
- Statements that paraphrase what the existing notes already say.

The amend command appends to the family's existing notes with a timestamped marker (`[amend YYYY-MM-DDTHH:MMZ]: <text>`). Multiple amends accumulate; the audit trail is visible. If no playbook exists yet for the family, amend creates a notes-only one (so cold-start corrections still land).

#### PII discipline for amend notes

`playbook amend` notes are designed to potentially flow upstream as shared knowledge in future versions of the Printing Press. Keep them clean of user-identifying content so the upstream-contribution path stays open without retroactive scrubbing:

- **Do NOT embed** paths to user filesystems, personal API keys or tokens, user email addresses, user GitHub handles, or specific query histories tied to a single user.
- **Acceptable**: endpoint shapes, undocumented field names, API gotchas, observed schema drift, workarounds for CLI surfaces, generalizable pagination or retry tactics.

If a correction is only meaningful with user-specific context, it belongs in a personal note, not in the playbook amend.

### Measuring the loop

`ctdata learnings stats` reports recall hit rate, teach-to-reuse, playbook resolution rate, and candidate confirm/reject counts from the local `learn_events` table. Rates are null until they have a denominator; everything stays on this machine. Use it to check whether the loop is earning its keep for this CLI.

### Disabling learning

- `--no-learn` on a single command short-circuits both `recall` and the `teach` write path. Use for deterministic agent flows or tests that must not be affected by accumulated learnings.
- `DATA_CT_GOV_NO_LEARN=true` in the environment globally disables the pipeline.

## Agent Feedback

When you (or the agent) notice something off about this CLI, record it:

```
ctdata feedback "the --since flag is inclusive but docs say exclusive"
ctdata feedback --stdin < notes.txt
ctdata feedback list --json --limit 10
```

Entries are stored locally as `feedback.jsonl` under the resolved data dir. They are never POSTed unless `DATA_CT_GOV_FEEDBACK_ENDPOINT` is set AND either `--send` is passed or `DATA_CT_GOV_FEEDBACK_AUTO_SEND=true`. Default behavior is local-only.

Write what *surprised* you, not a bug report. Short, specific, one line: that is the part that compounds.

## Output Delivery

Every command accepts `--deliver <sink>`. The output goes to the named sink in addition to (or instead of) stdout, so agents can route command results without hand-piping. Three sinks are supported:

| Sink | Effect |
|------|--------|
| `stdout` | Default; write to stdout only |
| `file:<path>` | Atomically write output to `<path>` (tmp + rename) |
| `webhook:<url>` | POST the output body to the URL (`application/json` or `application/x-ndjson` when `--compact`) |

Unknown schemes are refused with a structured error naming the supported set. Webhook failures return non-zero and log the URL + HTTP status on stderr.

## Named Profiles

A profile is a saved set of flag values, reused across invocations. Use it when a scheduled or recurring agent reuses the same saved flags while providing different input each run.

```
ctdata profile save briefing --json
ctdata --profile briefing catalog
ctdata profile list --json
ctdata profile show briefing
ctdata profile delete briefing --yes
```

Explicit flags always win over profile values; profile values win over defaults. `agent-context` lists all available profiles under `available_profiles` so introspecting agents discover them at runtime.

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 2 | Usage error (wrong arguments) |
| 3 | Resource not found |
| 4 | Authentication required |
| 5 | API error (upstream issue) |
| 7 | Rate limited (wait and retry) |
| 10 | Config error |

## Argument Parsing

Parse `$ARGUMENTS`:

1. **Empty, `help`, or `--help`** → show `ctdata --help` output
2. **Starts with `install`** → see Prerequisites above
3. **Anything else** → Direct Use (execute as CLI command with `--agent`)

## MCP Server Installation

The `ctdata` plugin registers the MCP server automatically as `plugin:ctdata:ctdata`. It runs `data-ct-gov-pp-mcp` from `PATH`, so installing the binaries (see Prerequisites) is the only step. Verify with `claude mcp list`.

## Direct Use

1. Check if installed: `which ctdata`
   If not found, offer to install (see Prerequisites at the top of this skill).
2. Match the user query to the best command from the Unique Capabilities and Command Reference above.
3. Execute with the `--agent` flag:
   ```bash
   ctdata <command> [subcommand] [args] --agent
   ```
4. If ambiguous, drill into subcommand help: `ctdata <command> --help`.
