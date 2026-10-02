---
name: topic-brief
description: Synthesize a structured topic brief from web clippings in the Obsidian vault's clippings/ directory for security-leadership research, presentations, and strategy thinking. Use this whenever the user asks for a brief, synthesis, summary, or research roundup on a security or technology topic - AI security, vendors, frameworks, threat intel, legislation, incidents, etc. Triggers on phrases like "topic brief on X", "synthesize my research on X", "give me a brief on X", "update the brief on X", "what do I know about X", "pull together what I've clipped on X". Reads relevant clips via qmd, optionally merges with a prior brief at clippings/briefs/<slug>.md, and persists only on user confirmation. Even if the user does not say "topic brief" explicitly - if they reference clippings, pulling research together, or wanting a synthesis for a presentation or strategy purpose, use this skill.
---

# Topic Brief Skill

Produce a structured brief on a research topic from web clippings in the Obsidian vault. The brief is a decision-ready synthesis - the kind of thing that feeds straight into a committee slide, an executive memo, or a strategy conversation.

## Why this skill exists

Security leaders clip a lot of research from the web. qmd handles "find me clips about X" well. What's missing is the synthesis step - taking 5-10 related clips and producing a structured brief that surfaces what's known, what's changed, what to do about it, and how to talk about it. This skill does that on demand. Briefs persist only when the user says so, so there is no maintenance burden when ideas don't pan out.

## Requirements

- The Obsidian CLI (`obsidian`), with Obsidian running and the vault open.
- A qmd index of the vault, exposed as the `qmd` MCP server.
- Clippings stored under `clippings/` in the vault.

## User context

Briefs are used for committee presentations, executive briefings, and strategy thinking. Frame Action Implications and Presentation Angles in terms of the user's own organization. Take that context from the user's CLAUDE.md or memory: role, organization, typical audiences, and the constraints that shape decisions (regulatory obligations, budget cycles, workforce, partner relationships). If CLAUDE.md names a current-priorities note in the vault, read that one note for framing.

If none of this context is available, ask once for the user's role, organization, and main audiences before synthesizing, and keep the answer for the rest of the session.

The skill operates only on `clippings/*.md` clippings, `clippings/briefs/<slug>.md` prior briefs, and the single priorities note named above. It does NOT read other operational vault notes (vendor pages, project notes, team notes, etc.) as data input. Organization context shapes framing only - it does not supply data. This separation keeps research synthesis distinct from operational state.

## Workflow

### 1. Parse the invocation

Extract from the user message:

- **Topic name** (required) - e.g. "AI Risk Governance", "Threat Intelligence Tooling", "Agentic AI Security"
- **Optional scope filter** - e.g. "last 60 days", "vendor angle", "incidents only", "for the September committee meeting"

If the topic name is too vague to focus a brief - bare single words like "threats", "AI", "security", "compliance" - ask the user to scope it before proceeding. A vague topic produces a generic brief, which has no value. Suggest 2-3 scoped variants based on context cues from recent vault activity if you have them. Do NOT synthesize on a vague topic.

### 2. Determine mode

Slug the topic in kebab-case: "AI Risk Governance" -> `ai-risk-governance`.

Check whether a prior brief exists:

```bash
obsidian read path="clippings/briefs/<slug>.md" 2>/dev/null
```

- File exists -> **update mode**: produce a 7-section brief that compares against the prior brief
- File missing -> **first-time mode**: produce a 5-section brief

Tell the user which mode you are in before continuing. This prevents surprise when they expected a fresh brief but got an update (or vice versa).

### 3. Discover candidate clips via qmd

Run a hybrid qmd query against the vault:

```
mcp__qmd__query({
  searches: [
    {type: 'lex', query: '<topic keywords - exact terms>'},
    {type: 'vec', query: '<topic phrase - semantic meaning>'}
  ],
  intent: '<paraphrase of what the user wants - matters for reranking>',
  collection: '<vault collection>'
})
```

Use the vault's qmd collection name. If CLAUDE.md does not give it, ask the user once.

Filter results to `clippings/*.md` paths only. Drop:

- `clippings/briefs/*` paths (those are saved briefs, not source clips)
- `clippings/WIKI.md` if it appears (legacy schema file from a prior design)
- Any path not under `clippings/`

Apply user-provided scope filters:

- **Date range** (e.g. "last 60 days"): for each candidate clip, read its frontmatter `created` field via `obsidian read path=...`; drop clips outside the range. qmd does not natively filter by date, so this is a post-filter step.
- **Angle** (e.g. "vendor angle", "incidents only"): pass the angle phrase as additional context in the qmd `intent` parameter to bias retrieval. Do not hard-filter results - clip topics overlap and a hard filter loses useful context.

### 4. Surface candidate clips and wait for prune

This is a hard pause. Do not synthesize without user confirmation. The pruning step exists because qmd will sometimes return tangential hits, and synthesizing on those dilutes the brief.

Return a numbered list with one-line descriptions. Pull the description from the clip's frontmatter `description` field if present, otherwise from the first paragraph:

```
Found <N> candidate clips for "<topic>":

1. [[clippings/<Title 1>]] - <one-line description>
2. [[clippings/<Title 2>]] - <one-line description>
...

Drop any that aren't relevant - reply with the numbers to drop, or "all" to keep everything.
```

Wait for the user's reply. Then:

- "all" or no drops named -> use the full list
- Numbers given -> remove those clips
- Every clip dropped -> stop and ask the user to refine the topic; do not produce an empty brief

### 5. Read selected clips and prior brief

For each remaining clip:

```bash
obsidian read path="clippings/<filename>"
```

If in update mode, also read the prior brief:

```bash
obsidian read path="clippings/briefs/<slug>.md"
```

In update mode, identify "new clips since last update" by diffing the current candidate list against the prior brief's frontmatter `clip-citations` list. Clips not in the prior list contributed material since the last brief - they feed the New Signal section.

### 6. Synthesize the brief

Output structured markdown directly in the conversation. The structure depends on mode.

#### First-time mode (5 sections)

```
# <Topic Name> - Topic Brief

## State of the Topic

[2-3 paragraphs synthesizing where the field/topic stands now, drawn from
the selected clips. Be specific - cite numbers, trends, named players,
specific products, dollar figures, dates. Use inline wikilinks like
[[clippings/<Clip Title>]] to attribute claims.]

## Action Implications (organization-specific)

[What this means for the user's organization specifically. Decisions to
consider, projects affected, policy implications. Frame in operational
terms - regulatory obligations, budget cycles, workforce constraints,
partner relationships. Avoid generic recommendations like "stay informed" or
"continue to monitor" - those are not action implications.]

## Presentation Angles

- [Specific claim or framing that lands in slides or strategy docs -
  concrete and quotable, not generic. Tie to a specific decision or
  audience the user names, such as a board or committee, executive
  leadership, or partner organizations.]
- [Another angle]
- [Another angle]

## Open Questions

- [Research gap - what would you need to clip more of to resolve this?]
- [Contradiction unresolved across the clips]
- [Anticipated executive or committee question this brief can't yet answer]

## Citations

- [[clippings/<Clip Title 1>]] - <what specifically it contributed>
- [[clippings/<Clip Title 2>]] - <what specifically it contributed>
- ...
```

#### Update mode (7 sections)

Same structure as first-time, plus two new sections inserted between State of the Topic and Action Implications:

```
## New Signal (since YYYY-MM-DD)

[Novel claims from clips added since the prior brief was written. Each
claim cited to its clip via wikilink. If no new clips contributed
materially new claims, state so explicitly - that is also signal.]

## Changed View

[Explicit comparison: prior brief said X; new evidence shows Y. Surface
the direction of travel, not just the current state. If nothing changed,
state so explicitly. Use this section to reflect on whether the prior
brief still holds, holds with caveats, or has been overtaken by events.]
```

The State of the Topic, Action Implications, Presentation Angles, and Open Questions sections are revised to reflect merged evidence. Use the prior brief as the starting point and update based on new clip evidence.

Citations are cumulative - include every clip that has ever contributed to the brief.

### 7. Offer persistence

After producing the brief in conversation, ask:

```
Save this brief to clippings/briefs/<slug>.md?
[yes / no / yes with edits]
```

- **yes** -> write the brief via Obsidian CLI (instructions below)
- **no** -> brief stays in conversation only; do not write
- **yes with edits** -> ask what to change, apply the edits, then save the edited version

When saving:

1. Compose the full file content (frontmatter + body):

```
---
type: topic-brief
title: <Topic Name>
last-updated: YYYY-MM-DD
clips-incorporated: <cumulative count>
clip-citations:
  - "[[clippings/<Clip 1>]]"
  - "[[clippings/<Clip 2>]]"
---

<brief body from step 6>
```

`clips-incorporated` and `clip-citations` are cumulative across all updates - in update mode, merge the prior list with newly contributing clips. Do not lose prior citations even if a clip didn't contribute new material this round.

2. Write the content to `/tmp/obsidian_brief.txt` via Bash heredoc. The heredoc avoids shell escaping issues with markdown content that includes backticks, dollar signs, or quotes:

```bash
cat << 'BRIEFEOF' > /tmp/obsidian_brief.txt
<full content here, including frontmatter>
BRIEFEOF
```

3. Load via obsidian eval. The `app.vault.create()` call creates `clippings/briefs/` if it does not yet exist:

```bash
obsidian eval code="(async () => {
  const fs = require('fs');
  const content = fs.readFileSync('/tmp/obsidian_brief.txt', 'utf8');
  const path = 'clippings/briefs/<slug>.md';
  const existing = app.vault.getAbstractFileByPath(path);
  if (existing) { await app.vault.modify(existing, content); }
  else { await app.vault.create(path, content); }
  fs.unlinkSync('/tmp/obsidian_brief.txt');
  return 'saved: ' + path;
})()"
```

4. Confirm to the user with the file path.

## Rules

- Never use the built-in Read, Edit, or Write tools on `.md` files inside the vault. They write directly to disk and race with iCloud sync and Obsidian's file watcher, causing corruption. Always go through Obsidian CLI or `obsidian eval`.
- Never read operational vault notes outside `clippings/` as data input, apart from the one priorities note named in CLAUDE.md. Organization context informs framing, not data.
- Never skip the prune step. Always wait for user confirmation in workflow step 4 before reading clips. The prune step is the user's lever to keep the brief tight.
- Never persist a brief without asking in step 7. The user decides whether a brief is worth keeping.
- Never fabricate from nothing. If qmd returns 0 results, tell the user and suggest broader phrasing or note that they may need to clip more on this topic before a brief is meaningful. Producing an empty or speculative brief erodes trust in the synthesis.
- Never invent claims. Every substantive claim in the brief must trace to a specific clip via wikilink. If you cannot cite it, do not include it.
