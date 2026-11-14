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

## Install

Clone the repository once, then install the plugins you want by absolute path:

```bash
git clone https://github.com/rorygpk/dsh-plugins
```

In a DeepSeek Harness session:

```text
plugin_manager install_bundle({ target: "<repo>/plugins/dsh-terminal-mode" })
plugin_manager install_bundle({ target: "<repo>/plugins/dsh-quick-provider" })
```

Then **refresh the Harness window once** (Ctrl+R, or Cmd+R on macOS) so the new
client bundles are loaded. The path must be the plugin directory containing
`package.json`, not the repository root.

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
