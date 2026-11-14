<div align="center">

# dsh-plugins

**A small, self-contained collection of plugins for
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) — the kind
that are a folder, a manifest and nothing else.**

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
> Every entry here is a local DSH bundle. There is no build step, no runtime
> dependency and no npm publish: you install the directory that contains
> `package.json`, then refresh the Harness window once.

## Plugins

| Plugin | What it does | Kind | Version | Docs |
|---|---|---|---|---|
| <img src="plugins/dsh-terminal-mode/icon.svg" alt="" width="26" height="26"> **[dsh-terminal-mode](plugins/dsh-terminal-mode/README.md)** | Codex-style terminal skins, CRT effects, command palette, statusline and shortcut keys for the Web GUI. Presentation only, one-click back to the original skin. | ![](https://img.shields.io/badge/web--ui-skin-7ee787?style=flat-square) | `1.0.2` | [English](plugins/dsh-terminal-mode/README.md) · [中文](plugins/dsh-terminal-mode/README.zh.md) |
| <img src="plugins/dsh-quick-provider/icon.svg" alt="" width="26" height="26"> **[dsh-quick-provider](plugins/dsh-quick-provider/README.md)** | Add any OpenAI-compatible model provider with four fields; discovers and registers every advertised model automatically. | ![](https://img.shields.io/badge/host%20%2B%20web--ui-provider-7aa2f7?style=flat-square) | `1.0.0` | [English](plugins/dsh-quick-provider/README.md) · [中文](plugins/dsh-quick-provider/README.zh.md) |

## Two plugins, in detail

### dsh-terminal-mode — the Codex-style terminal

Turns the Harness Web GUI into the terminal you already live in, without losing a
single harness feature. The plugin paints with the app's own design tokens and
adds a handful of its own UI seats; it never replaces a component.

**Highlights**

- **Eight skins** in one click: Default (the untouched Harness skin), Codex
  Terminal, Phosphor Green, Amber CRT, Tokyo Night, Nord, Solarized Light, Paper.
- **Live controls**: brightness 60–140%, background temperature, accent colour,
  corner radius, scanline intensity, text glow, monospace toggle and a custom
  monospace family.
- **A real command palette** (`Ctrl/Cmd+Alt+K`) plus shortcuts for next skin,
  restore, brightness and per-skin quick select (`Alt+1`…`Alt+8`).
- **Terminal furniture**: a statusline under the composer with prompt, skin,
  brightness, live clock and a blinking cursor; a `>_` hero tile for empty
  sessions; a `>_` sidebar button.
- **Safe by construction**: token overrides are inert until a skin is applied, and
  *Restore default skin* removes every last one — the original look comes back
  exactly. Appearance lives in this browser's `localStorage`, not in your profile.

**How it works** — `client.js` registers themes as CSS custom properties on
`<html data-dsk>`, maps them onto the app's `--dsw-alias-*` tokens, and renders
the palette, settings page, statusline and hero mark through documented slots
(`settings.section`, `shell.overlay`, `conversation.composer.dock`,
`conversation.hero.brand.mark`, `sidebar.footer.action`). Shortcuts go through
the app shortcut registry with a DOM fallback.

**Get it**

```text
plugin_manager install_bundle({ target: "<repo>/plugins/dsh-terminal-mode" })
```

[English guide](plugins/dsh-terminal-mode/README.md) ·
[中文说明](plugins/dsh-terminal-mode/README.zh.md) ·
[install notes](plugins/dsh-terminal-mode/docs/INSTALL.md)

### dsh-quick-provider — four fields to any provider

A provider normally means hand-writing a config block per model. This plugin
reduces that to four fields and one button: provider id, display name, base URL
and API key.

**Highlights**

- **Automatic discovery**: calls `GET {baseURL}/models`, maps every model the
  platform advertises (id, name, input modalities, context window, max tokens).
- **Credential-safe**: the API key goes through the Harness credential seam; the
  provider config only carries an environment-variable reference.
- **Two entry points**: a form at the bottom of **Settings > Models**, and the
  agent tool `add_llm_provider` so a session can do it in one call.
- **No extra server**: the form talks to the host through the authenticated
  `POST /api/quick-provider/add` route of the same process.
- **Undo-friendly**: removing the provider in Settings removes its models; the
  credential record is yours to delete separately.

**How it works** — `index.js` runs the discovery, stores the key with
`credentials.set()`, and writes the provider plus model list with
`settings.mutate("llm-pi-ai", …)` so the existing pi-ai adapter keeps owning
streaming, retries and catalog resolution. `client.js` is only the form card.

**Get it**

```text
plugin_manager install_bundle({ target: "<repo>/plugins/dsh-quick-provider" })
```

[English guide](plugins/dsh-quick-provider/README.md) ·
[中文说明](plugins/dsh-quick-provider/README.zh.md)

## Install in your DSH

These plugins extend **[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)** —
the agent runtime that turns a desktop or browser window into a real terminal with
tools, sessions and model choice. Already running DSH? Installation is three
commands. Not running it yet? Install DSH first; every plugin here is a folder you
drop in.

> [!TIP]
> No npm, no build step, no network at install time. `install_bundle` links the
> plugin directory into your profile, and each plugin brings its own settings page.

**1. Clone this repository**

```bash
git clone https://github.com/rorygpk/dsh-plugins
```

**2. Install the plugins you want** — in any DSH session:

```text
plugin_manager install_bundle({ target: "<repo>/plugins/dsh-terminal-mode" })
plugin_manager install_bundle({ target: "<repo>/plugins/dsh-quick-provider" })
```

**3. Refresh the Harness window once** (Ctrl+R, or Cmd+R on macOS).

**4. Find them in the app**

| Where to look | What you get |
|---|---|
| Settings > Terminal mode | skin cards, brightness, scanlines, palette shortcut |
| Settings > Models (bottom card) | Quick provider: four fields, all models discovered |
| Sidebar `>_` button / <kbd>Mod</kbd>+<kbd>Alt</kbd>+<kbd>K</kbd> | terminal command palette |

**Uninstall** — remove the bundle in the plugin manager, refresh the page, delete the
folder. Terminal-mode appearance stays in this browser's `localStorage`; provider
entries stay in the DSH profile until you remove them.

Every plugin also ships as a standalone zip on the
[Releases](https://github.com/rorygpk/dsh-plugins/releases) page; extract one
anywhere permanent and point `install_bundle` at the extracted folder.

## Compatibility

Built and tested against the DeepSeek Harness **0.2.2-rc.1** Web profile. A
plugin is a directory with a `package.json` that declares:

- `dsh.bundle.patch` — the Cordis patch that inserts the plugin row;
- `dsh.client` — optional browser half loaded through the Web module loader;
- `locale/<lang>.json` — display title and description for the plugin manager;
- `icon.svg` — the installable artwork shown in the app.

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
scripts/check-links.mjs    docs check used by CI
.github/workflows/         CI verify + tag-driven release
```

## Adding a plugin

A plugin directory is self-contained; the CI and release workflows discover it
automatically:

1. create `plugins/<name>/` with `package.json`, `cordis.patch.yml`, `index.js`
   (which may export an inert `apply()`), an optional `client.js`, `locale/en.json`,
   `locale/zh.json` and an `icon.svg`;
2. add a `scripts/pack.ps1` (copy the one from `dsh-terminal-mode`);
3. add `README.md` and `README.zh.md`, plus a row in the table above;
4. run `powershell -ExecutionPolicy Bypass -File scripts\pack-all.ps1` locally
   before tagging.

## Roadmap — more plugins, built in public

This repository is the first release of something bigger: a dependable,
community-shaped plugin ecosystem for DeepSeek Harness. The format is
deliberately boring — a folder, a manifest, a patch — so the hard part is ideas,
not plumbing.

**Planned and openly discussed**

- **More first-party plugins**: session export and sharing, workspace diff review,
  a reusable prompt library, per-session model presets.
- **A plugin index**: a discoverable catalog that lists compatible plugins for each
  DSH release and installs in one step.
- **A starter template and generator**: `create-dsh-plugin`-style scaffolding so a
  new plugin goes from idea to installable bundle in minutes.
- **Wider localization**: more than English and Chinese, contributed and reviewed
  by the community.
- **A compatibility matrix in CI**: every plugin tested against the exact DSH
  release line it claims, so upgrades never surprise anyone.

If you build on DeepSeek Harness, this is your invitation: open an issue, send a
plugin, or fork a skin. Contributions are credited here — the goal is simple:
make DSH the most hackable agent runtime on the planet and give people plugins
worth installing.

## Releases

Pushing a `v*` tag builds every plugin archive on GitHub Actions and attaches
each zip to the tag's release (`v1.0.0`, `v1.0.1`, `v1.0.2`, …). Local builds
are reproducible with `scripts/pack-all.ps1`.

## License

MIT — see [LICENSE](LICENSE). Third-party palette inspiration is credited in the
respective plugin `NOTICE` files. No harness code is copied or modified.

---

<div align="center">

**[English](README.md)** | [简体中文](README.zh.md) ·
[Releases](https://github.com/rorygpk/dsh-plugins/releases)

</div>
