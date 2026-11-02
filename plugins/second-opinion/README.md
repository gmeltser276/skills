# second-opinion

Get an independent review of uncommitted changes, a branch diff, or a
commit using OpenAI Codex or Google Antigravity. The `second-opinion`
skill can also use Gemini CLI when the selected account supports it.

This is a modified copy of the Trail of Bits plugin. See
[NOTICE.md](NOTICE.md) for provenance, license, and the list of changes.

## Setup

Install and authenticate the CLI you intend to use:

| Provider | Setup |
|----------|-------|
| OpenAI Codex | Install with `npm i -g @openai/codex` and configure a supported ChatGPT account or API authentication |
| Google Antigravity | Follow the [CLI installation guide](https://antigravity.google/docs/cli/getting-started); the executable is `agy` |
| Gemini CLI | Install with `npm i -g @google/gemini-cli` and configure a supported Code Assist, API-key, or Vertex AI account |

Antigravity is the default Google path. If Gemini CLI returns
`UNSUPPORTED_CLIENT` with an Antigravity migration message, that
account cannot use the Gemini CLI path. Review extensions are not required.

Install the plugin in Claude Code:

```text
/plugin marketplace add gmeltser276/skills
/plugin install second-opinion@skills
```

### Switching from the Trail of Bits plugin

Both plugins register the `second-opinion` skill, so keep only one
installed:

```text
/plugin uninstall second-opinion@trailofbits
/plugin install second-opinion@skills
```

## Codex models

The Codex path defaults to `gpt-5.6-terra` at `xhigh` reasoning and falls
back to `gpt-5.6-cyber` when the default is unavailable. The model table
in `skills/second-opinion/references/codex-invocation.md` records which
catalog models ran and which the account rejected on 2026-11-01. The
catalog alone does not show entitlement. List it with:

```bash
codex debug models
```

## Usage

Invoke the `second-opinion` skill with the provider and scope:

```text
/second-opinion:second-opinion use Codex to review uncommitted changes for bugs
/second-opinion:second-opinion use Codex with gpt-5.6-cyber to review this branch against origin/main for security issues
/second-opinion:second-opinion compare Codex and Antigravity against origin/main
```

The skill uses choices already given and asks for missing provider or
scope details. General review is the default focus. Applicable project
instructions are included unless you exclude them.

Uncommitted reviews include staged, unstaged, and untracked changes.
When you select both providers, each receives the same captured patch.
Results identify the provider, model, findings, and any gaps in coverage.

## Execution

Codex runs through `codex exec` with a read-only sandbox and structured
JSON findings. Antigravity runs in print mode and returns prose.
Gemini CLI uses a headless prompt for supported accounts.

The skill reports findings without applying fixes or publishing a review.
Authentication errors, denied inspection, and missing output are reported
as incomplete reviews.
