---
name: terse-compress
description: >
  Compress natural-language files (CLAUDE.md, memory notes, todos, prose docs) in place
  using terse-mode rules: drop filler, hedging, pleasantries, and preamble while keeping
  full grammar, articles, and technical accuracy. Backup written as `<file>.original.md`.
  Use when the user says "compress this file", "shrink CLAUDE.md", or invokes /terse-compress.
---

Compress prose files in place. Output is grammatical English with the same meaning, fewer
tokens. No fragments, no dropped articles, no telegraphic patterns.

## Trigger

`/terse-compress <filepath>` or when the user asks to compress a memory file, CLAUDE.md,
agent prompt, or any prose document.

## Process

1. **Read the file** with the Read tool (absolute path required).

2. **Detect file type** by extension:
   - Compress: `.md`, `.txt`, `.typ`, `.typst`, `.tex`, extensionless prose files
   - Refuse: `.py`, `.js`, `.ts`, `.json`, `.yaml`, `.yml`, `.toml`, `.env`, `.lock`, `.css`,
     `.html`, `.xml`, `.sql`, `.sh` - report which file type was rejected and stop
   - Mixed prose + code: compress only the prose regions, leave code regions byte-identical

3. **Write a backup** to `<filepath>.original.md` (or `<filepath>.original<ext>` for non-md
   prose). Skip the backup step if a `.original.*` file already exists for this path -
   never overwrite an existing backup.

4. **Compress the prose** following the rules below. Treat fenced code blocks and inline
   backtick spans as read-only regions.

5. **Validate**:
   - All fenced code blocks present and unchanged (count and content)
   - All headings preserved (count and exact text)
   - All URLs, file paths, commands preserved exactly
   - Frontmatter preserved exactly
   - Output is shorter than input (otherwise the operation failed)

6. **Write the compressed file back** to the original path.

7. **Report** to the user: original byte count, compressed byte count, percent saved, and
   the backup path.

## Compression Rules

### Drop

- Articles only when redundant in lists or headings (keep them in sentences)
- Filler: just, really, basically, actually, simply, essentially, generally, literally
- Pleasantries: "sure", "certainly", "of course", "happy to", "great question",
  "I'd recommend", "let me…", "here is…"
- Hedging when not load-bearing: "I think", "maybe", "it seems", "perhaps",
  "it might be worth", "you could consider", "it would be good to"
- Connective fluff: "however", "furthermore", "additionally", "in addition",
  "with that said", "that being said"
- Redundant phrasing: "in order to" → "to", "make sure to" → "ensure",
  "the reason is because" → "because", "due to the fact that" → "because",
  "at this point in time" → "now"
- "You should", "you must", "remember to", "please note that" - state the action directly

### Preserve EXACTLY (never modify)

- Fenced code blocks (``` ... ```) - content, indentation, comments, blank lines
- Inline code (`backtick spans`)
- URLs and markdown links (full text and target)
- File paths (`/src/...`, `~/.claude/...`, `./config.yaml`)
- Shell commands (`npm install`, `git commit -m "..."`, `aws sso login`)
- Technical terms (library names, API names, protocols, algorithm names)
- Proper nouns (project names, people, companies, products)
- Dates, version numbers, numeric values, error codes
- Environment variables (`$HOME`, `NODE_ENV`)
- YAML frontmatter at the top of the file
- All markdown structure: heading levels and exact heading text, list nesting, table
  structure (compress cell prose, keep columns)

### Compress

- Use shorter synonyms where they fit naturally: "fix" not "implement a solution for",
  "use" not "utilize", "start" not "commence", "show" not "demonstrate"
- Merge two sentences that say the same thing differently into one
- Collapse repeated examples to a single representative example
- Tighten table cells and bullets, but keep complete sentences

### Boundaries

- Keep complete, readable English. No telegraphic patterns, no dropped articles inside
  sentences.
- If the file is already tight (under 10% achievable savings on a dry pass), report that
  and skip the write - do not waste a backup slot on a no-op compression.
- If the file contains mostly code with little prose, compress only the prose comments
  and surrounding text, leave code untouched, and note that in the report.
- Never compress a file already named `*.original.md` - these are backups; skip them.

## Pattern

Original (verbose):

> You should always make sure to run the test suite before pushing any changes to the main
> branch. This is important because it helps catch bugs early and prevents broken builds
> from being deployed to production.

Compressed (terse, grammatical):

> Run tests before pushing to main. This catches bugs early and prevents broken builds
> from reaching production.

Original:

> The application uses a microservices architecture with the following components. The API
> gateway handles all incoming requests and routes them to the appropriate service. The
> authentication service is responsible for managing user sessions and JWT tokens.

Compressed:

> The application uses a microservices architecture. The API gateway routes incoming
> requests to the appropriate service. The authentication service manages user sessions
> and JWT tokens.

## What this skill is not

This skill does not produce fragments, drop articles inside sentences, or use telegraphic
patterns. Every output sentence is complete, grammatical English. The only thing removed
is content that adds no information.
