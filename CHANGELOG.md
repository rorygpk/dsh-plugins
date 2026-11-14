# Changelog

Repository-level changes. Per-plugin history lives in each plugin's own
`CHANGELOG.md`.

## [Unreleased]

### Added

- Multi-plugin layout: every plugin now lives in its own directory under
  `plugins/`, each with its bundle manifest, locale metadata, icon, docs and an
  optional portable pack script.
- `scripts/pack-all.ps1` builds a zip for every plugin; the release workflow runs
  it and attaches every archive to the tag's release.
- Added the `dsh-quick-provider` plugin.

### Changed

- `dsh-terminal-mode` moved to `plugins/dsh-terminal-mode` (version 1.0.2).
- CI and release workflows now discover plugins from `plugins/*` instead of
  hard-coding one package.
