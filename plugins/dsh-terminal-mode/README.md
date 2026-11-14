<div align="center">

<img src="icon.svg" alt="Terminal mode icon" width="84" height="84">

# dsh-terminal-mode

**Terminal skins, CRT effects, a command palette and keyboard shortcuts for the
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web GUI.
Presentation only — the untouched default skin is always one click away.**

Part of the [dsh-plugins](../../README.md) collection.

<p>
  <a href="https://github.com/rorygpk/dsh-plugins/releases/latest"><img alt="release" src="https://img.shields.io/github/v/release/rorygpk/dsh-plugins?color=7ee787&label=release&style=for-the-badge"></a>
  <a href="LICENSE"><img alt="license" src="https://img.shields.io/github/license/rorygpk/dsh-plugins?color=88c0d0&style=for-the-badge"></a>
  <img alt="dependencies" src="https://img.shields.io/badge/dependencies-0-a3be8c?style=for-the-badge">
  <img alt="build" src="https://img.shields.io/badge/build-none-ebcb8b?style=for-the-badge">
  <img alt="runtime" src="https://img.shields.io/badge/runtime-browser--only-bf616a?style=for-the-badge">
</p>

**English** | [简体中文](README.zh.md)

</div>

---

> [!NOTE]
> This plugin only overrides design tokens, fonts and visual effects, and adds its
> own UI slots (settings page, palette, statusline, hero mark). Sessions, models,
> tools, harness settings and existing keyboard behavior are not modified.

## Why it exists

The Harness Web GUI is good at being quiet and functional. Terminal mode makes it
feel like the terminal you already live in: monospace type, phosphor palettes, a
`>` prompt, a statusline, and a command palette — without losing a single harness
feature.

- **Eight skins**, from a neutral Codex-style terminal to green/amber CRTs and two
  light themes; Default is the original skin and the restore target.
- **Real freedom**: brightness, background temperature, accent colour, corner
  radius, scanlines, text glow, monospace toggle and a custom monospace family.
- **Keyboard first**: palette, skin cycling, brightness keys, per-skin quick keys.
- **Safe by construction**: token overrides are inert until a skin is applied, and
  `Restore default skin` removes every last override.
- **Portable**: plain files, zero dependencies, no build step, no Node.js, no
  network at install time.

## Skins

Eight cards in this order. A fresh install starts on **Codex Terminal** with its
preset (4 px corners); **Default** is the untouched Harness skin and the one-click
restore target.

| # | Skin | Scheme | Background | Panel | Accent | Character |
|---|---|---|---|---|---|---|
| 1 | **Default** | — | — | — | — | Untouched DeepSeek Harness skin |
| 2 | **Codex Terminal** | dark | ![](https://img.shields.io/badge/0a0c0b-0a0c0b?style=flat-square) | ![](https://img.shields.io/badge/151a18-151a18?style=flat-square) | ![](https://img.shields.io/badge/7ee787-7ee787?style=flat-square) | Near-black terminal, green prompt accent |
| 3 | **Phosphor Green** | dark | ![](https://img.shields.io/badge/010603-010603?style=flat-square) | ![](https://img.shields.io/badge/061a10-061a10?style=flat-square) | ![](https://img.shields.io/badge/39ff88-39ff88?style=flat-square) | Green-phosphor CRT, optional scanlines and glow |
| 4 | **Amber CRT** | dark | ![](https://img.shields.io/badge/0d0803-0d0803?style=flat-square) | ![](https://img.shields.io/badge/1b1207-1b1207?style=flat-square) | ![](https://img.shields.io/badge/ffb000-ffb000?style=flat-square) | Warm amber phosphor for night work |
| 5 | **Tokyo Night** | dark | ![](https://img.shields.io/badge/1a1b26-1a1b26?style=flat-square) | ![](https://img.shields.io/badge/24283b-24283b?style=flat-square) | ![](https://img.shields.io/badge/7aa2f7-7aa2f7?style=flat-square) | Deep blue night palette |
| 6 | **Nord** | dark | ![](https://img.shields.io/badge/2e3440-2e3440?style=flat-square) | ![](https://img.shields.io/badge/434c5e-434c5e?style=flat-square) | ![](https://img.shields.io/badge/88c0d0-88c0d0?style=flat-square) | Arctic blue-grey, low contrast, calm |
| 7 | **Solarized Light** | light | ![](https://img.shields.io/badge/fdf6e3-fdf6e3?style=flat-square) | ![](https://img.shields.io/badge/eee8d5-eee8d5?style=flat-square) | ![](https://img.shields.io/badge/268bd2-268bd2?style=flat-square) | Warm paper background for daylight |
| 8 | **Paper** | light | ![](https://img.shields.io/badge/f7f7f4-f7f7f4?style=flat-square) | ![](https://img.shields.io/badge/ffffff-ffffff?style=flat-square) | ![](https://img.shields.io/badge/1f5f8b-1f5f8b?style=flat-square) | Clean light terminal, ink on off-white |

## Install

Private local bundle (`"private": true`). Installed from a directory by absolute
path, never from npm, no network needed.

**Fast path** — install the plugin directory, then refresh the Harness window once:

```text
plugin_manager install_bundle({ target: "<repo>/plugins/dsh-terminal-mode" })
```

(`<repo>` is the cloned `dsh-plugins` checkout, or any folder the archive below was
extracted to.)

<details>
<summary><b>Three ways to get the folder</b></summary>

**A. Release archive** — download
`dsh-terminal-mode-<version>.zip` from the
[Releases](https://github.com/rorygpk/dsh-plugins/releases) page, extract it to a
permanent folder (for example `C:\Tools\dsh-terminal-mode`), then run the call
above. The path must be the extracted folder containing `package.json`, not the
zip or its parent.

**B. Clone the repository** — this plugin lives in the `plugins/dsh-terminal-mode`
subdirectory; install that directory by absolute path:

```bash
git clone https://github.com/rorygpk/dsh-plugins
```

```text
plugin_manager install_bundle({ target: "<repo>/plugins/dsh-terminal-mode" })
```

**C. Build the archive yourself** — Windows PowerShell 5.1+ or PowerShell 7+, no
Node.js:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\pack.ps1
```

It writes `dist/dsh-terminal-mode-<version>.zip` and prints its SHA-256.

</details>

After installing or updating, **refresh the Harness window once** (Ctrl+R, or
Cmd+R on macOS) so the new client bundle is loaded. See
[docs/INSTALL.md](docs/INSTALL.md) for upgrade, rollback and troubleshooting.

## Use

### Settings page

Open **Settings > Terminal mode**.

| Control | Range | Effect |
|---|---|---|
| Skin cards | 8 skins | Pick a look; Default restores the original instantly |
| Brightness | 60–140% | Lifts or dims the whole skin |
| Background temperature | −40 to +40 | Warms or cools surfaces without hurting contrast |
| Accent colour | picker + Follow skin | Accent, links, focus ring, cursor |
| Monospace interface text / family | toggle + text | Force a mono UI font; empty uses the system stack |
| Corner radius | 0–14 px | Square terminal corners up to rounded |
| Scanlines | toggle + intensity 0–100% | CRT scanline overlay |
| Text glow | 0–100% | Soft phosphor glow on text |
| **Restore default skin** | button | Back to Default; turns scanlines and glow off |
| **Reset all terminal settings** | button | Back to the first-run preset: Codex Terminal, radius 4 px |

Font sizes stay under **Settings > General > Appearance**.

### Command palette

Press <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>K</kbd> (<kbd>Cmd</kbd>+<kbd>Alt</kbd>+<kbd>K</kbd>
on macOS), or click the `>_` button beside Settings. Type to filter, <kbd>↑</kbd>/<kbd>↓</kbd>
to move, <kbd>Enter</kbd> to run, <kbd>Esc</kbd> to close.

### Shortcuts

| Shortcut | Action |
|---|---|
| <kbd>Mod</kbd>+<kbd>Alt</kbd>+<kbd>K</kbd> | Open the command palette |
| <kbd>Mod</kbd>+<kbd>Alt</kbd>+<kbd>T</kbd> | Next skin (cycles all eight, wraps to Default) |
| <kbd>Mod</kbd>+<kbd>Alt</kbd>+<kbd>0</kbd> | Restore the default skin |
| <kbd>Mod</kbd>+<kbd>Alt</kbd>+<kbd>B</kbd> | Brightness +5% |
| <kbd>Mod</kbd>+<kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd> | Brightness −5% |
| <kbd>Alt</kbd>+<kbd>1</kbd> … <kbd>Alt</kbd>+<kbd>8</kbd> | Skin by index: 1 Default, 2 Codex Terminal, … 8 Paper |
| <kbd>Mod</kbd>+<kbd>Alt</kbd>+<kbd>`</kbd> | Restore the default skin (fallback path) |

`Mod` is <kbd>Ctrl</kbd> on Windows/Linux and <kbd>Cmd</kbd> on macOS. The bindings
are registered through the harness shortcut registry (shown in the app shortcut
reference) with a DOM fallback; if a combination is swallowed by the browser or
the OS, the `>_` button always opens the palette.

### Statusline and hero mark

Every non-default skin docks a statusline under the composer:

```text
> Codex Terminal · 100% · 22:59:00                     Ctrl+Alt+K palette
```

Left: prompt mark, active skin, brightness, live clock, blinking cursor. Right: the
palette shortcut. Empty sessions show a square `>_` terminal tile as the hero mark,
with the active skin name as its tooltip. Restoring Default removes all of it.

## Persistence and reset

Appearance settings persist **per browser** under the `localStorage` key
`dsh.terminal-mode.v1`. Nothing is written to the Harness profile or session data,
so each machine keeps its own look.

| Action | Result |
|---|---|
| **Restore default skin** | Switch to Default and turn scanlines/glow off; keeps brightness, temperature, accent, radius, mono and font choices for the next themed skin |
| **Reset all terminal settings** | Clear stored state and return to the first-run preset (Codex Terminal, radius 4 px) |

Restore from the settings page, <kbd>Mod</kbd>+<kbd>Alt</kbd>+<kbd>0</kbd>, or
<kbd>Alt</kbd>+<kbd>1</kbd>. None of these touch sessions, models or other harness
settings.

## How it works

Inert until a skin is applied: the plugin publishes a `data-dsk` attribute on
`<html>` and maps the palette onto the harness `--dsw-alias-*` design tokens. Only
then do the token overrides and effects in its own stylesheet become active.
`Restore default skin` removes the attribute and every inline custom property,
which is why the original look comes back exactly.

```text
client.js
├── SKINS[]             palette + effect presets per skin
├── resolvePalette()    brightness / temperature / accent maths
├── applyNow()          html attributes + --dsk-* custom properties
├── STYLESHEET          token mapping, CRT overlay, component styles
├── SettingsPage        Settings > Terminal mode
├── Palette             shell.overlay command palette
├── Statusline          conversation.composer.dock
├── HeroMark            conversation.hero.brand.mark
└── shortcuts           registry path + DOM fallback
```

## Development

```bash
node test/selftest.mjs     # 50 headless checks of the client half
node --check client.js     # syntax
```

Node.js is only needed for the tests, never for installing or using the plugin.
CI runs the same checks on every push; the release workflow builds the archive
and attaches it to the release when a `v*` tag is pushed.

## Repository layout

```text
README.md / README.zh.md   this document, English and Chinese
docs/INSTALL*.md           cross-machine deployment guide
index.js                   inert host half
client.js                  skins, settings page, palette, statusline, shortcuts
locale/                    bundle display metadata (en, zh)
scripts/pack.ps1           builds the portable zip with SHA-256
test/selftest.mjs          headless self-test (repo only, never shipped)
```

## Uninstall

1. Restore the default skin (optional, so removal is invisible).
2. Remove the bundle with `plugin_manager`, then refresh the page.
3. Delete the folder, and optionally the `dsh.terminal-mode.v1` key.

## License

MIT — see [LICENSE](LICENSE). Palette inspiration is credited in
[NOTICE](NOTICE). No harness code is copied or modified.

---

<div align="center">

**[English](README.md)** | [简体中文](README.zh.md) ·
[Releases](https://github.com/rorygpk/dsh-plugins/releases) ·
[Install guide](docs/INSTALL.md)

</div>
