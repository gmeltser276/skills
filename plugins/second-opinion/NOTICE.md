# Provenance

This plugin redistributes the `second-opinion` skill from
[trailofbits/skills](https://github.com/trailofbits/skills), plugin
version 1.8.3 (commit `123037e`), under the Creative Commons
Attribution-ShareAlike 4.0 International license. See [LICENSE](LICENSE).
This modified copy is licensed under the same terms.

Trail of Bits does not endorse this copy.

## Changes from upstream

- `references/codex-invocation.md`: model table with each catalog model's
  tested result (Codex CLI 0.166.0, 2026-11-01); default `gpt-5.6-terra`
  and fallback `gpt-5.6-cyber`, replacing `gpt-5.6-sol` and `gpt-5.6`,
  which the account rejects or no longer lists; `--model` flag instead of
  `-c model`; notes on `--cd`, `--json`, and the WebSocket fallback line.
- `README.md`: install and switch-over instructions for this marketplace.
- Removed `agents/openai.yaml` and `assets/trail-of-bits-mark.svg`. They
  only serve Codex's own skill UI, and a modified copy should not carry
  the Trail of Bits mark.
