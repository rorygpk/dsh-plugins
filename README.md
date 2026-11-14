<div align="center">

# dsh-plugins

**Plugins for DeepSeek Harness. Each one is a plain directory: no build step, no
runtime dependency, nothing to run alongside the app.**

<p>
  <a href="https://github.com/rorygpk/dsh-plugins/releases/latest"><img alt="release" src="https://img.shields.io/github/v/release/rorygpk/dsh-plugins?color=7ee787&label=release&style=for-the-badge"></a>
  <a href="LICENSE"><img alt="license" src="https://img.shields.io/github/license/rorygpk/dsh-plugins?color=88c0d0&style=for-the-badge"></a>
  <img alt="plugins" src="https://img.shields.io/badge/plugins-2-7aa2f7?style=for-the-badge">
  <img alt="build" src="https://img.shields.io/badge/build-none-ebcb8b?style=for-the-badge">
  <img alt="dsh" src="https://img.shields.io/badge/dsh-0.2.2--rc.1-bf616a?style=for-the-badge">
</p>

**English** | [简体中文](README.zh.md)

</div>

---

> [!NOTE]
> Installation is directory-based. Point `install_bundle` at the plugin folder,
> then refresh the Harness window once.

Rendered preview: [rorygpk.github.io/dsh-plugins](https://rorygpk.github.io/dsh-plugins/).
The generated page is committed as [`docs/index.html`](docs/index.html), so the
documentation also opens offline.

## Plugins

| Plugin | Purpose | Kind | Version | Documentation |
|---|---|---|---|---|
| <img src="plugins/dsh-terminal-mode/icon.svg" alt="" width="26" height="26"> **[dsh-terminal-mode](plugins/dsh-terminal-mode/README.md)** | A terminal appearance for the Web GUI: eight palettes, CRT effects, a command palette and a statusline. Presentation only, and fully reversible. | ![](https://img.shields.io/badge/web--ui-skin-7ee787?style=flat-square) | `1.0.2` | [English](plugins/dsh-terminal-mode/README.md) · [中文](plugins/dsh-terminal-mode/README.zh.md) |
| <img src="plugins/dsh-quick-provider/icon.svg" alt="" width="26" height="26"> **[dsh-quick-provider](plugins/dsh-quick-provider/README.md)** | Adds an OpenAI-compatible model provider from four fields and registers every model the endpoint publishes. | ![](https://img.shields.io/badge/host%20%2B%20web--ui-provider-7aa2f7?style=flat-square) | `1.0.0` | [English](plugins/dsh-quick-provider/README.md) · [中文](plugins/dsh-quick-provider/README.zh.md) |

## dsh-terminal-mode

A skin for the Harness Web GUI. It changes appearance and nothing else: colour,
type, spacing, effects. Every control can be undone, and *Restore default skin*
returns the interface to its original state.

- Eight palettes: Default, Codex Terminal, Phosphor Green, Amber CRT, Tokyo
  Night, Nord, Solarized Light, Paper.
- Adjustable brightness, background temperature, accent colour, corner radius,
  scanline intensity, text glow, and a monospace toggle.
- A command palette (`Ctrl/Cmd+Alt+K`), shortcuts for switching and restoring,
  a statusline under the composer, and a `>_` mark for empty sessions.
- Appearance is stored in the browser's `localStorage`. The Harness profile is
  left untouched.

The implementation maps CSS custom properties on `<html data-dsk>` onto the
application's `--dsw-alias-*` design tokens. New interface elements are rendered
through published slots, so no component is replaced.

```text
plugin_manager install_bundle({ target: "<repo>/plugins/dsh-terminal-mode" })
```

## dsh-quick-provider

Adds an OpenAI-compatible provider with four fields: provider id, display name,
base URL and API key.

- Queries `GET /models` and registers every model the endpoint advertises.
- Stores the key through the credential seam. The provider configuration holds
  only an environment-variable reference.
- Available as a form under **Settings > Models** and as the `add_llm_provider`
  tool for sessions.

`index.js` performs discovery, stores the credential and writes the provider into
the `llm-pi-ai` settings namespace, leaving streaming, retries and catalog
resolution to the existing adapter. `client.js` renders the form.

```text
plugin_manager install_bundle({ target: "<repo>/plugins/dsh-quick-provider" })
```

## Install in your DSH

DeepSeek Harness is the agent runtime these plugins extend. If it is not installed
yet, install it first. Then:

1. Clone the repository.

   ```bash
   git clone https://github.com/rorygpk/dsh-plugins
   ```

2. In a DSH session, install the plugin directory.

   ```text
   plugin_manager install_bundle({ target: "<repo>/plugins/dsh-terminal-mode" })
   plugin_manager install_bundle({ target: "<repo>/plugins/dsh-quick-provider" })
   ```

3. Refresh the Harness window once so the client bundle loads.

| Location | What appears |
|---|---|
| Settings > Terminal mode | Skin cards, brightness, scanlines, palette shortcut |
| Settings > Models (lower section) | Quick provider form |
| Sidebar `>_` button, or <kbd>Mod</kbd>+<kbd>Alt</kbd>+<kbd>K</kbd> | Command palette |

To uninstall, remove the bundle in the plugin manager, refresh the page and delete
the directory. Terminal-mode preferences stay in the browser; provider entries
stay in the profile until removed there.

Release archives are attached to each release as well. Extract one to a permanent
location and point `install_bundle` at the extracted folder.

## Compatibility

Built and tested against DeepSeek Harness **0.2.2-rc.1** (Web profile). A plugin is
a directory whose `package.json` declares:

- `dsh.bundle.patch`, the Cordis patch that inserts the plugin row;
- `dsh.client`, the optional browser half loaded by the Web module loader;
- `locale/<lang>.json`, the title and description shown by the plugin manager;
- `icon.svg`, the artwork shown in the app.

## Repository layout

```text
plugins/
├── dsh-terminal-mode/     Web UI skin plugin (browser only)
│   ├── package.json       bundle manifest
│   ├── client.js          skin engine, settings page, palette, statusline
│   ├── docs/              install guide (EN + ZH)
│   ├── scripts/pack.ps1   portable zip builder
│   └── test/selftest.mjs  headless checks
└── dsh-quick-provider/    provider plugin (host + browser)
    ├── package.json
    ├── index.js           model discovery, credential storage, HTTP route
    └── client.js          settings form
scripts/pack-all.ps1       build every plugin archive
scripts/check-links.mjs    documentation check used by CI
.github/workflows/         CI verification and tag-driven release
```

## Adding a plugin

Each plugin directory is self-contained, and CI and the release workflow discover
it automatically:

1. Create `plugins/<name>/` with `package.json`, `cordis.patch.yml`, `index.js`
   (an inert `apply()` is enough), an optional `client.js`, `locale/en.json`,
   `locale/zh.json` and an `icon.svg`.
2. Add a `scripts/pack.ps1`, copied from `dsh-terminal-mode`.
3. Add `README.md`, `README.zh.md`, and a row to the table above.
4. Run `powershell -ExecutionPolicy Bypass -File scripts\pack-all.ps1` before
   tagging.

## Direction

Two plugins exist today. What comes next will be decided the same way: by what is
missing in daily use.

- Further plugins under consideration: session export, workspace diff review, a
  prompt library, per-session model presets.
- A plugin index listing compatible builds for each DSH release.
- A starter template, so a new plugin begins from a working bundle.
- Additional interface languages.
- CI coverage against the DSH release line each plugin declares.

Issues and pull requests are welcome. The standard is modest and stays fixed: a
plugin should be worth installing.

## Releases

Pushing a `v*` tag builds every plugin archive on GitHub Actions and attaches each
zip to that tag's release. Local builds are reproducible with
`scripts/pack-all.ps1`.

## License

MIT. See [LICENSE](LICENSE). Palette inspiration is credited in the respective
plugin `NOTICE` files. No harness code is copied or modified.

---

<div align="center">

**[English](README.md)** | [简体中文](README.zh.md) ·
[Releases](https://github.com/rorygpk/dsh-plugins/releases)

</div>
