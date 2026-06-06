#!/bin/bash
# terse-mode — statusline badge script for Claude Code
# Reads the terse mode flag file and outputs a colored badge.
#
# Usage in ~/.claude/settings.json:
#   "statusLine": { "type": "command", "command": "bash /path/to/terse-statusline.sh" }
#
# Badge color: cyan (38;5;39). Change the color codes below to customize.

set -euo pipefail

FLAG="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/.terse-active"

# Refuse symlinks — a local attacker could point the flag at ~/.ssh/id_rsa and
# have the statusline render its bytes (including ANSI escape sequences) to
# the terminal every keystroke.
[ -L "$FLAG" ] && exit 0
[ ! -f "$FLAG" ] && exit 0

# Hard-cap the read at 64 bytes and strip anything outside [a-z0-9-] — blocks
# terminal-escape injection and OSC hyperlink spoofing via the flag contents.
MODE=$(head -c 64 "$FLAG" 2>/dev/null | tr -d '\n\r' | tr '[:upper:]' '[:lower:]')
MODE=$(printf '%s' "$MODE" | tr -cd 'a-z0-9-')

# Whitelist. Anything else → render nothing rather than echo attacker bytes.
case "$MODE" in
  off|lite|full|ultra) ;;
  *) exit 0 ;;
esac

if [ "$MODE" = "full" ]; then
  printf '\033[38;5;39m[TERSE]\033[0m'
elif [ "$MODE" = "lite" ]; then
  printf '\033[38;5;39m[TERSE:LITE]\033[0m'
elif [ "$MODE" = "ultra" ]; then
  printf '\033[38;5;39m[TERSE:ULTRA]\033[0m'
fi
# 'off' and any other whitelisted-but-inactive value render nothing.

# Savings suffix: on by default. Opt out via TERSE_STATUSLINE_SAVINGS=0.
# Reads a pre-rendered string written by terse-stats.js so we don't shell out
# to node on every keystroke. Refuses symlinks and strips control bytes —
# same hardening as the flag file (a local attacker could plant a file with
# ANSI escape codes otherwise). Until /terse-stats has run at least once,
# the suffix file is absent and nothing is rendered — so the default is safe
# for fresh installs (no fake number, no crash).
if [ "${TERSE_STATUSLINE_SAVINGS:-1}" != "0" ]; then
  SAVINGS_FILE="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/.terse-statusline-suffix"
  if [ -f "$SAVINGS_FILE" ] && [ ! -L "$SAVINGS_FILE" ]; then
    SAVINGS=$(head -c 64 "$SAVINGS_FILE" 2>/dev/null | tr -d '\000-\037')
    [ -n "$SAVINGS" ] && printf ' \033[38;5;39m%s\033[0m' "$SAVINGS"
  fi
fi
