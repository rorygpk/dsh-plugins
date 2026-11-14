# Installing dsh-terminal-mode on another machine

This guide moves the plugin to a machine that has never had it. Total work: copy a
folder (or unzip an archive), run one `plugin_manager` call, then refresh the Harness
window once so the new client bundle is loaded.

The plugin is a local, private bundle. It is not published to npm and does not contact
the network at runtime. Everything it needs is inside the package folder.

## Requirements

- A DeepSeek Harness Web GUI session with the `plugin_manager` tool available.
- Any OS supported by DSH (the examples below use Windows paths).
- No Node.js, pnpm, build step, or package download is needed on the target.
- A permanent directory for the bundle, for example
  `C:\Tools\dsh-terminal-mode` or `~/dsh-bundles/dsh-terminal-mode`. Avoid
  temporary or synced folders that may move or clean themselves.

The installed path is linked by DSH. If you move or rename the folder later,
run `install_bundle` again with the new path.

## 1. Get the files

### From a release archive

1. Download `dsh-terminal-mode-1.0.2.zip`.
2. Extract it. The archive contains a top-level `dsh-terminal-mode/` folder.
3. Confirm `dsh-terminal-mode\package.json` exists at the folder root.

Optionally verify the checksum against the value published with the release:

```powershell
Get-FileHash .\dsh-terminal-mode-1.0.2.zip -Algorithm SHA256
```

```bash
shasum -a 256 dsh-terminal-mode-1.0.2.zip
```

### From a source folder or network share

Copy the whole `dsh-terminal-mode` folder. Runtime files are required:
`package.json`, `cordis.patch.yml`, `index.js`, `client.js`, `locale/`,
`icon.svg`. The `scripts/` and `docs/` folders are not needed to run, but keep
them so the package stays self-describing.

The `.zip` file itself is not installable. Extract it first.

## 2. Install the bundle

In a DeepSeek Harness agent session, call `plugin_manager` with the absolute
folder path:

```text
plugin_manager install_bundle({ target: "C:/Tools/dsh-terminal-mode" })
```

Notes:

- Use the folder that directly contains `package.json`, not its parent and not
  the zip file.
- Forward slashes work on every platform. On Windows, escaped backslashes
  (`"C:\\Tools\\dsh-terminal-mode"`) also work.
- Paths with spaces are fine inside the quoted string.
- `install_bundle` is idempotent for a given target; rerun it after replacing
  the files to refresh the package.

## 3. Activate

Refresh the Harness window once so the new client bundle is loaded (Ctrl+R, or
Cmd+R on macOS). No application restart and no rebuild is required. If the skin
is not visible right after the first refresh, hard-refresh (Ctrl+Shift+R) to drop
cached client assets.

## 4. Verify

Run these checks in order:

1. Settings shows a **Terminal mode** entry. A fresh install already runs the
   **Codex Terminal** skin with its preset (radius 4 px).
2. Selecting the **Codex Terminal** card changes surfaces, typography, and adds
   the statusline under the composer.
3. **Mod+Alt+K** opens the command palette; Esc closes it.
4. The terminal button in the sidebar footer opens the same palette.
5. Brightness and accent changes apply without a page reload.
6. **Restore default skin** returns the interface to the untouched look. **Reset
   all terminal settings** returns to the first-run preset (Codex Terminal), not
   to the untouched skin.
7. Reload the page: the chosen skin and effects are still applied on this
   machine.

If steps 1-2 fail, the bundle did not install; see Troubleshooting. If steps 3-7
fail, the client half did not load; check the browser console for plugin load
errors and reinstall.

## 5. Update

1. Replace the package files with the new release (extract over the existing
   folder, or replace the folder and keep the same path).
2. Run the same command again:

```text
plugin_manager install_bundle({ target: "C:/Tools/dsh-terminal-mode" })
```

3. Refresh the Harness window once so the new client bundle is loaded.

Appearance settings stored by the browser are preserved across updates. If a
new version changes the storage layout, reset from Settings > Terminal mode.

## 6. More machines

Repeat steps 1-3 on each machine. The same folder or archive works everywhere;
there is no server-side state. Each browser keeps its own skin, brightness, and
effects, so one machine can stay on Default while another uses Phosphor green.

## 7. Uninstall and rollback

To uninstall:

1. Restore the default skin first (Settings > Terminal mode > Restore default
   skin, or Mod+Alt+0).
2. Remove the bundle with `plugin_manager`, then refresh the page.
3. Delete the folder. Optionally clear the `dsh.terminal-mode.v1`
   `localStorage` key for the origin.

To roll back, replace the folder with the previous release and run
`install_bundle` again. No migration step is required for 1.0.2.

## 8. Build the archive on a development machine

Windows PowerShell 5.1+ or PowerShell 7+, no Node.js:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\pack.ps1
```

The script:

- reads `version` from `package.json`;
- copies required runtime files plus documentation into a staging folder;
- writes `dist/dsh-terminal-mode-<version>.zip` containing the top-level
  `dsh-terminal-mode/` folder;
- prints the archive path and its SHA-256.

A missing runtime file (`client.js`, `cordis.patch.yml`, `locale/*.json`, ...)
aborts the build. Missing optional docs (README, CHANGELOG, NOTICE, docs) only
produce a warning. Use `-OutputDirectory <path>` to place the archive elsewhere.

## Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| `install_bundle` fails | Target is a zip, a parent folder, or a path without `package.json`; extract the zip and point at the folder |
| No Terminal mode entry in Settings | Install failed or the page is stale; reinstall with the absolute path and hard-refresh |
| Skin changes but statusline/palette missing | Client half failed to load; check the browser console, confirm `client.js` was copied, then reinstall |
| Settings do not persist | Browser storage is disabled or cleared between sessions; per-browser persistence is by design |
| Shortcut does nothing | The combination is reserved by the browser or OS; use the sidebar footer terminal button |
| Custom mono font ignored | The font family must be installed locally; otherwise the system mono stack is used |
| Folder moved after install | Run `install_bundle` again with the new absolute path |
