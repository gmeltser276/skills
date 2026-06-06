#!/usr/bin/env node
// terse-mode — UserPromptSubmit hook
// Inspects user input for /terse commands and natural-language triggers,
// writes mode to flag file, and emits a per-turn reminder when active.

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const { getDefaultMode, safeWriteFlag, readFlag, VALID_MODES } = require('./terse-config');

const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
const flagPath = path.join(claudeDir, '.terse-active');

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const prompt = (data.prompt || '').trim().toLowerCase();

    // Natural language activation — "activate terse", "turn on terse mode", etc.
    if (/\b(activate|enable|turn on|start)\b.*\bterse\b/i.test(prompt) ||
        /\bterse\b.*\b(mode|activate|enable|turn on|start)\b/i.test(prompt)) {
      if (!/\b(stop|disable|turn off|deactivate)\b/i.test(prompt)) {
        const mode = getDefaultMode();
        if (mode !== 'off') {
          safeWriteFlag(flagPath, mode);
        }
      }
    }

    // /terse-stats [--share|--all|--since <duration>] — block and inject stats output
    const statsMatch = /^\/terse(?::terse)?-stats(?:\s+(.*))?$/.exec(prompt);
    if (statsMatch) {
      const tailArgs = (statsMatch[1] || '').trim().split(/\s+/).filter(Boolean);
      try {
        const statsPath = path.join(__dirname, 'terse-stats.js');
        const argv = [statsPath];
        if (data.transcript_path) argv.push('--session-file', data.transcript_path);
        if (tailArgs.includes('--share')) argv.push('--share');
        if (tailArgs.includes('--all')) argv.push('--all');
        const sinceIdx = tailArgs.indexOf('--since');
        if (sinceIdx !== -1 && tailArgs[sinceIdx + 1]) {
          argv.push('--since', tailArgs[sinceIdx + 1]);
        }
        const out = execFileSync(process.execPath, argv, { encoding: 'utf8', timeout: 5000 });
        process.stdout.write(JSON.stringify({ decision: 'block', reason: out.trim() }));
      } catch (e) {
        process.stdout.write(JSON.stringify({
          decision: 'block',
          reason: 'terse-stats: could not run stats script.\nTry manually: node hooks/terse-stats.js'
        }));
      }
      return;
    }

    // Match /terse commands
    if (prompt.startsWith('/terse')) {
      const parts = prompt.split(/\s+/);
      const cmd = parts[0];
      const arg = parts[1] || '';

      let mode = null;

      if (cmd === '/terse' || cmd === '/terse:terse' || cmd === '/terse-mode:terse') {
        if (!arg) {
          mode = getDefaultMode();
        } else if (arg === 'off' || arg === 'stop' || arg === 'disable') {
          mode = 'off';
        } else if (VALID_MODES.includes(arg)) {
          mode = arg;
        }
        // Unknown arg → mode stays null, flag untouched (no silent overwrite)
      }

      if (mode && mode !== 'off') {
        safeWriteFlag(flagPath, mode);
      } else if (mode === 'off') {
        try { fs.unlinkSync(flagPath); } catch (e) {}
      }
    }

    // Natural language deactivation
    if (/\b(stop|disable|deactivate|turn off)\b.*\bterse\b/i.test(prompt) ||
        /\bterse\b.*\b(stop|disable|deactivate|turn off)\b/i.test(prompt) ||
        /\bnormal mode\b/i.test(prompt)) {
      try { fs.unlinkSync(flagPath); } catch (e) {}
    }

    // Per-turn reinforcement: emit a structured reminder when terse is active.
    // The SessionStart hook (terse-activate.js) writes .terse-active before
    // any UserPromptSubmit fires (S1 lifecycle ordering). If the flag is
    // missing, corrupted, oversized, or a symlink, readFlag returns null and
    // we emit nothing — never inject untrusted bytes into model context.
    const activeMode = readFlag(flagPath);
    if (activeMode && activeMode !== 'off') {
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          additionalContext: "TERSE MODE ACTIVE (" + activeMode + "). Answer first. Cut filler, " +
            "pleasantries, hedging, preamble, and recap. Keep complete grammatical sentences and " +
            "articles — no fragments. Preserve code, identifiers, and exact error text. Security " +
            "warnings and irreversible-action confirmations: write normally."
        }
      }));
    }
  } catch (e) {
    // Silent fail
  }
});
