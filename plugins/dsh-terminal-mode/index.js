/**
 * Host half of the Terminal Mode bundle.
 *
 * This bundle is intentionally browser-only: the skin engine, the settings
 * page, the command palette and the statusline all live in `client.js`, which
 * the Web client loads through `window.__ModuleLoader__`. The Host half exists
 * only so the Loader has a plugin row to activate; it registers no services,
 * patches no UI and changes no model-facing behaviour.
 *
 * Keeping this file inert is what makes the bundle portable: another Harness
 * install needs the files in this directory and nothing else.
 */

export function apply() {}
