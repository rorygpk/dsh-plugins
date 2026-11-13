# dsh-terminal-mode

Terminal mode for the DeepSeek Harness Web GUI: terminal skins, CRT effects, a
command palette, a statusline, and keyboard shortcuts, with the untouched default
skin always one click away.

Presentation only. No Harness feature, session, model, tool, or setting is
modified. No dependencies, no build step, no Node.js required.

## Preview

Screenshots are not bundled yet; add them under `docs/media/` and reference them here:

```text
docs/media/terminal-mode-{codex,phosphor,settings}.png
```

## Skins

Eight cards in this order; the first is the original skin and the restore action. A
fresh install starts on Codex Terminal with its preset (corner radius 4 px); the
untouched Harness skin is the Default card, always one click away.

| # | Card | ID | Look |
|---|---|---|---|
| 1 | Default | `default` | Untouched DeepSeek Harness skin |
| 2 | Codex Terminal | `codex` | Near-black terminal with a green prompt accent |
| 3 | Phosphor Green | `phosphor` | Green-phosphor CRT, optional scanlines and glow |
| 4 | Amber CRT | `amber` | Warm amber phosphor for night work |
| 5 | Tokyo Night | `tokyonight` | Deep blue night palette |
| 6 | Nord | `nord` | Cool arctic blue-grey, low contrast |
| 7 | Solarized Light | `solarized` | Warm paper background for daylight |
| 8 | Paper | `paper` | Clean light terminal, ink on off-white |

## Install

Private local bundle (`"private": true`). It is installed from a directory by
absolute path, never from npm, and needs no network access.

### A. Release archive (another machine)

1. Extract `dsh-terminal-mode-1.0.0.zip` to a permanent folder such as `C:\Tools\dsh-terminal-mode`.
2. In a DeepSeek Harness session, install it by absolute path:

```text
plugin_manager install_bundle({ target: "C:/Tools/dsh-terminal-mode" })
```

3. Refresh the Harness window once so the new client bundle is loaded (Ctrl+R, or
   Cmd+R on macOS).

The path must be the extracted folder containing `package.json`, not the zip or its
parent. Forward slashes work everywhere; Windows backslashes must be doubled inside
the quoted string.

### B. Linked working copy

```text
plugin_manager install_bundle({ target: "C:/Users/me/src/dsh-terminal-mode" })
```

The bundle is loaded from that linked directory. Rerun the command after changing
files and refresh the Harness window once so the new client bundle is loaded; moving
the folder requires reinstalling.

### C. Build the archive

Windows PowerShell 5.1+ or PowerShell 7+, no Node.js:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\pack.ps1
```

Produces `dist/dsh-terminal-mode-1.0.0.zip` and prints its SHA-256. Missing runtime
files abort the build; missing optional docs only warn. Install it as in A.

## Use

### Settings

Open **Settings > Terminal mode**. The subtitle reads: "Skins and effects are
local to this browser. Functionality is unchanged."

| Control | Range | Effect |
|---|---|---|
| Skin cards | 8 skins | Pick a look; Default restores the original instantly |
| Brightness | 60-140% | Lifts or dims the whole skin |
| Background temperature | -40 to +40 | Warms or cools surfaces without hurting contrast |
| Accent colour | picker + Follow skin | Accent, links, focus ring, cursor |
| Monospace interface text / family | toggle + text | Force a mono UI font; enter an installed family, empty uses the system stack |
| Corner radius | 0-14 px | Square terminal corners up to rounded |
| Scanlines | toggle + intensity 0-100% | CRT scanline overlay |
| Text glow | 0-100% | Soft glow on terminal text |
| Restore default skin | button | Back to Default; turns scanlines and glow off |
| Reset all terminal settings | button | Back to the first-run preset: Codex Terminal, radius 4 px |

Font sizes stay under Settings > General > Appearance.

### Command palette

Press **Mod+Alt+K**, or use the `>_` button in the sidebar footer. Filter and run:
apply any skin, brightness +5/-5/reset, next skin, toggle scanlines or monospace text,
restore default skin, reset all. Arrows move, Enter runs, Esc closes. `Mod` is Ctrl on
Windows and Linux, Cmd on macOS.

### Shortcuts

| Shortcut | Action |
|---|---|
| Mod+Alt+K | Open the command palette |
| Mod+Alt+T | Next skin (cycles all eight, wrapping to Default) |
| Mod+Alt+0 | Restore the default skin |
| Mod+Alt+B | Brightness +5% |
| Mod+Alt+Shift+B | Brightness -5% |
| Alt+1 … Alt+8 | Skin by index: 1 Default, 2 Codex Terminal, 3 Phosphor Green, 4 Amber CRT, 5 Tokyo Night, 6 Nord, 7 Solarized Light, 8 Paper |

The backquote-key fallback (same modifiers plus the backquote key) also restores the
default skin. If a browser or OS reserves a shortcut, the sidebar footer button always
opens the palette.

### Statusline and marks

Every non-default skin docks a statusline under the composer, for example:

```text
> Codex Terminal · 100% · 22:59:00                     Ctrl+Alt+K palette
```

Left: prompt mark, active skin, brightness, live clock, blinking cursor. Right: the
palette shortcut. Empty sessions show a square `>_` terminal tile as the hero mark;
hover for the active skin name. Messages and composer inherit the terminal palette and
mono type. Restoring the default skin removes all of it.

## Persistence and reset

Appearance settings persist per browser under the `localStorage` key `dsh.terminal-mode.v1`.
Nothing is written to the Harness profile or session data, so each machine keeps its own
look; a browser with no stored state starts on the first-run preset, Codex Terminal.

- **Restore default skin**: switches to Default and turns scanlines and glow off,
  but keeps brightness, temperature, accent, corner radius, mono, and font choices
  for the next themed skin.
- **Reset all terminal settings**: clears the stored state and returns to the
  first-run preset (Codex Terminal, radius 4 px). It does not restore the untouched
  Harness skin; use Restore default skin for that.

Restore from the settings page, Mod+Alt+0, or Alt+1; none of these touch sessions,
models, or other Harness settings.

To uninstall, restore the default skin first (optional), remove the bundle with
`plugin_manager`, refresh the page, then delete the folder and optionally the `dsh.terminal-mode.v1` key.

## Portability and GitHub

The package is plain files: copy the folder to any machine and install it with
`install_bundle`; nothing is built, installed, or downloaded on the target. When you
replace the files with a new version, rerun `install_bundle` and refresh the Harness
window once so the new client bundle is loaded.

To publish a release: push the folder contents to a repository and tag it (for example
`v1.0.0`); run `scripts/pack.ps1` and attach `dist/dsh-terminal-mode-1.0.0.zip` to the
release (`dist/` and `*.zip` are gitignored); bump `version` in `package.json` before
the next release and the archive name follows automatically.

`private` is `true`: npm will not publish the package, and folder or archive
distribution is intentional.

## Development

`node test/selftest.mjs` runs a headless self-test of the client half (50 checks:
skin switching, restore/reset, shortcut fallback, component rendering). Node is only
needed for that test, never for installing or using the plugin. The `test/` directory
is repository-only and is not included in the release archive.

## License

MIT. See [LICENSE](LICENSE). Palette inspiration is credited in [NOTICE](NOTICE).
