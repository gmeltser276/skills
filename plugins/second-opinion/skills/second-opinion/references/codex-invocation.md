# Codex Invocation

Use `codex exec` with the prepared prompt on stdin. It supports a
custom focus and project context alongside a manually captured diff.
The built-in `codex exec review` scope flags cannot be combined with
its positional prompt, so they do not replace this invocation.

The flags and model list below were checked with Codex CLI 0.166.0
(`codex exec --help` and `codex debug models`) on 2026-11-01.

## Models

The default is `gpt-5.6-terra` with `xhigh` reasoning. Preserve an
explicit model or effort supplied by the user. Pass the model with
`--model`. Reasoning effort has no flag; set it with `-c`.

`codex debug models` lists the catalog, not the account's entitlements.
Each model below was run with the command in this file on 2026-11-01
against a ChatGPT account:

| Model | Purpose, as Codex describes it | Default effort | Result |
|-------|--------------------------------|----------------|--------|
| `gpt-5.6-terra` | Balanced agentic coding model for everyday work | medium | works |
| `gpt-5.6-cyber` | Cyber-permissive variant for authorized security research | medium | works |
| `gpt-daybreak-red-latest` | Cyber-permissive variant for authorized security research | medium | works |
| `gpt-5.5-cyber-preview` | Frontier cybersecurity model, preview | xhigh | works |
| `gpt-5.6-sol` | Reliable agentic workhorse for everyday tasks | medium | rejected: not supported with a ChatGPT account |
| `gpt-5.6-luna` | Fast and affordable agentic coding model | medium | rejected: not supported with a ChatGPT account |
| `gpt-daybreak-blue-latest` | Latest frontier model for broad defensive cybersecurity work | low | rejected: not supported with a ChatGPT account |

Every listed model accepts `xhigh`. Entitlements differ by account and
change without a CLI update. When a model's result is in doubt, run
`codex debug models` for the catalog and a one-prompt `codex exec` for
the entitlement.

When the user names a security focus and no model, offer
`gpt-5.6-cyber` as an alternative to the default before running.
State any model change in the results.

## Command

With `prompt_file`, `output_file`, and `stderr_log` already created
outside the checkout, run from the repository root:

```bash
codex exec \
  --model gpt-5.6-terra \
  -c model_reasoning_effort='"xhigh"' \
  --sandbox read-only \
  --ephemeral \
  --output-schema "{baseDir}/references/codex-review-schema.json" \
  -o "$output_file" \
  - < "$prompt_file" \
  > /dev/null 2> "$stderr_log"
```

When the shell is not at the repository root, add `--cd <repo>` so the
agent uses that directory as its working root.

`-o` saves the final response while diagnostics remain in
`stderr_log`. `--output-schema` requests structured findings.
`--ephemeral` avoids persisting a review session. `--json` streams
events as JSONL on stdout; it is not needed here because `-o` captures
the final message.

These options are documented in OpenAI's
[non-interactive mode guide](https://learn.chatgpt.com/docs/non-interactive-mode).
No MCP server is involved. The
[Codex changelog](https://learn.chatgpt.com/docs/changelog) records removal
of `codex mcp-server` in CLI 0.154.0.

## Result handling

Parse `output_file` as JSON. Use the returned findings, explanation,
and confidence rather than CLI progress messages. An empty findings
array is meaningful only after the invocation completed and returned a
valid review.

The shipped schema uses higher numbers for higher severity:
0 informational, 1 low, 2 medium, 3 high. This is not the P0-critical
convention used by some other review formats. Do not invert it when
presenting findings.

## Failure handling

| Failure | Response |
|---------|----------|
| Executable missing | Report that Codex must be installed and authenticated; installation command: `npm i -g @openai/codex` |
| Authentication or quota error | Report the error and stop this provider; changing models does not repair missing credentials or exhausted quota |
| Default model unavailable | If the user did not pin a model, retry once with `gpt-5.6-cyber` and disclose the substitution |
| Explicit model unavailable | Report the failure, show the current `codex debug models` list, and ask for a replacement |
| Nonzero exit, empty file, or invalid JSON | Read diagnostics and report an incomplete review |
| Sandbox denied a needed read or command | Report the coverage gap; do not ignore it or remove the sandbox |
| Timeout | Preserve partial output and report the timeout; suggest a narrower scope |

A `failed to connect to Responses WebSocket` line in diagnostics is not
a failure by itself; the CLI falls back and the run completes. Judge the
run by its exit code and output file.

A model reported as "not supported when using Codex with a ChatGPT account"
is a model-entitlement failure. Use the model-unavailable response above:
retry only when the user did not pin a model. This differs from missing
or invalid credentials and exhausted quota, which stop the provider.
