# Changelog

All notable changes to this package are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-13

### Added

- "Terminal mode" settings section with a skin picker of eight cards: default,
  codex, phosphor, amber, tokyonight, nord, solarized, paper.
- Live appearance controls: brightness 60-140%, accent colour, background
  temperature, corner radius 0-14 px, scanlines with intensity, text glow,
  monospace toggle with custom family.
- First install starts on the Codex Terminal preset (corner radius 4 px). Reset
  all terminal settings returns to that preset; Restore default skin remains the
  one-click untouched Harness look.
- Command palette (Mod+Alt+K) to apply skins, adjust brightness, toggle effects,
  restore the default skin, and reset all settings.
- Keyboard shortcuts: Mod+Alt+K command palette, Mod+Alt+T next skin, Mod+Alt+0
  restore default, Mod+Alt+B / Mod+Alt+Shift+B brightness, Alt+1..8 apply skin by
  index.
- Statusline docked under the composer, a square `>_` terminal tile as the
  empty-session hero mark (active skin name as its tooltip), and terminal typography
  inherited by messages and the composer, all shown only in non-default skins.
- Per-browser persistence under `dsh.terminal-mode.v1`; one-click restore of the
  untouched default skin and a first-run-preset reset.
- Bilingual interface strings (English, Simplified Chinese).
- `scripts/pack.ps1` release packager (PowerShell 5.1+, no Node.js) producing
  `dist/dsh-terminal-mode-<version>.zip` with a SHA-256 checksum.
- Repository-only headless self-test, `node test/selftest.mjs` (50 checks); it is
  not part of the release archive.

### Notes

- The plugin only changes presentation. Harness functionality is not modified,
  and the default skin can be restored at any time without touching session
  data.
