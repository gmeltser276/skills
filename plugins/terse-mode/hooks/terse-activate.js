#!/usr/bin/env node
// terse-mode — Claude Code SessionStart activation hook
//
// Runs on every session start:
//   1. Writes flag file at $CLAUDE_CONFIG_DIR/.terse-active (statusline reads this)
//   2. Emits terse-mode ruleset as hidden SessionStart context
//
// Lifecycle dependency (S1): this hook writes .terse-active before any
// UserPromptSubmit fires. The per-turn tracker (terse-tracker.js) reads that
// flag to decide whether to emit a reminder. Claude Code always runs
// SessionStart before UserPromptSubmit, so the flag exists by the first prompt.
// "off" mode unlinks the flag here — tracker sees null, emits nothing.

const fs = require('fs');
const path = require('path');
const os = require('os');
const { getDefaultMode, safeWriteFlag } = require('./terse-config');

const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
const flagPath = path.join(claudeDir, '.terse-active');

const mode = getDefaultMode();

// "off" mode — unlink flag so the tracker emits nothing, then exit cleanly
if (mode === 'off') {
  try { fs.unlinkSync(flagPath); } catch (e) {}
  process.stdout.write('OK');
  process.exit(0);
}

// 1. Write flag file (symlink-safe)
safeWriteFlag(flagPath, mode);

// 2. Emit full terse-mode ruleset, filtered to the active intensity level.
//    Reads SKILL.md at runtime so edits to the source of truth propagate
//    automatically — no hardcoded duplication to go stale.
//
//    Plugin layout: __dirname = <plugin_root>/hooks/, SKILL.md at
//    <plugin_root>/skills/terse/SKILL.md (one level up, then skills/terse/).
//    This path resolves correctly because hooks live at hooks/ (not src/hooks/).

let skillContent = '';
try {
  skillContent = fs.readFileSync(
    path.join(__dirname, '..', 'skills', 'terse', 'SKILL.md'), 'utf8'
  );
} catch (e) { /* SKILL.md not found — will use fallback below */ }

let output;

if (skillContent) {
  // Strip YAML frontmatter
  const body = skillContent.replace(/^---[\s\S]*?---\s*/, '');

  // Filter intensity table: keep header/separator rows + only the active level's row.
  // Example lines (- lite: / - full: / - ultra:) are filtered to the active level too.
  // Regex matches rows formatted as | **level** | (bold inside pipes) — S2.
  const filtered = body.split('\n').reduce((acc, line) => {
    const tableRowMatch = line.match(/^\|\s*\*\*(\S+?)\*\*\s*\|/);
    if (tableRowMatch) {
      if (tableRowMatch[1] === mode) {
        acc.push(line);
      }
      return acc;
    }

    const exampleMatch = line.match(/^- (\S+?):\s/);
    if (exampleMatch) {
      if (exampleMatch[1] === mode) {
        acc.push(line);
      }
      return acc;
    }

    acc.push(line);
    return acc;
  }, []);

  output = 'TERSE MODE ACTIVE — level: ' + mode + '\n\n' + filtered.join('\n');
} else {
  // Fallback when SKILL.md is not found. Mirrors the real ruleset — no
  // fragment-speak, no dropped articles, complete grammatical English only.
  output =
    'TERSE MODE ACTIVE — level: ' + mode + '\n\n' +
    'Answer first. Cut everything that does not add information. Keep complete, grammatical sentences.\n\n' +
    '## Persistence\n\n' +
    'ACTIVE EVERY RESPONSE. Do not drift back to verbose after many turns. Stay active if unsure. ' +
    'Off only when the user says "stop terse" or "normal mode".\n' +
    'Default: **full**. Switch: `/terse lite|full|ultra`.\n\n' +
    '## Rules\n\n' +
    'Drop: filler (just/really/basically/actually/simply/very), pleasantries (sure/certainly/of ' +
    'course/happy to/great question), hedging when not load-bearing, preamble ("Let me…", "Here is…"), ' +
    'and restating the question.\n\n' +
    'Keep: articles, conjunctions, full words, and complete sentences. Write real English — never ' +
    'fragments or telegraphic notes.\n\n' +
    'Lead with the answer or the action. Technical terms, code, identifiers, API names, and error ' +
    'strings stay exact and unchanged.\n\n' +
    '## Clarity overrides (write normally)\n\n' +
    'Drop terse compression for: security warnings, irreversible or destructive action confirmations, ' +
    'multi-step instructions where order or an omitted detail risks a misread, and when the user asks ' +
    'to clarify or repeats a question. Resume terse style once the at-risk part is done.\n\n' +
    '## Boundaries\n\n' +
    'Code, commit messages, and PR descriptions: write normally per project conventions. ' +
    'Persist the active level until it changes or the session ends.';
}

process.stdout.write(output);
