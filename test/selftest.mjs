/**
 * Headless self-test for the Terminal Mode client half.
 *
 * It stubs the tiny browser surface the plugin uses (module loader, React
 * primitives, document, localStorage, shortcuts/theme services) and then:
 *   1. loads client.js through its real `window.__ModuleLoader__` entry,
 *   2. calls apply() with a recording Cordis context,
 *   3. asserts the HTML attributes and CSS custom properties per skin,
 *   4. exercises restore / reset / keyboard fallback,
 *   5. renders every registered component to catch runtime errors.
 *
 * Run: node test/selftest.mjs
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const CLIENT = join(here, '..', 'client.js');

// ---------------------------------------------------------------- react stub
let hookIndex = 0;
let hookStore = [];
const effectRuns = new Set();

const React = {
  Fragment: Symbol.for('react.fragment'),
  createElement(type, props, ...children) {
    const flat = [];
    for (const child of children) {
      if (Array.isArray(child)) flat.push(...child);
      else if (child !== null && child !== undefined && child !== false) flat.push(child);
    }
    if (props && props.children !== undefined) flat.push(...(Array.isArray(props.children) ? props.children : [props.children]));
    return { type, props: props || {}, children: flat };
  },
  useState(initial) {
    const index = hookIndex++;
    if (!(index in hookStore)) hookStore[index] = typeof initial === 'function' ? initial() : initial;
    return [hookStore[index], (next) => {
      hookStore[index] = typeof next === 'function' ? next(hookStore[index]) : next;
    }];
  },
  useEffect(fn) {
    const index = hookIndex++;
    if (!effectRuns.has(index)) {
      effectRuns.add(index);
      // Run once; timers are stubbed, so cleanup is not exercised.
      fn();
    }
  },
  useMemo(fn) { return fn(); },
  useRef(initial) { const index = hookIndex++; if (!(index in hookStore)) hookStore[index] = { current: initial }; return hookStore[index]; },
};

// ---------------------------------------------------------------- dom stubs
function createStyle() {
  const values = new Map();
  return {
    values,
    setProperty(name, value) { values.set(name, String(value)); },
    removeProperty(name) { values.delete(name); },
  };
}

const attributes = new Map();
const html = {
  style: createStyle(),
  setAttribute: (name, value) => attributes.set(name, String(value)),
  removeAttribute: (name) => attributes.delete(name),
  toggleAttribute(name, force) {
    const present = force === undefined ? !attributes.has(name) : !!force;
    if (present) attributes.set(name, '');
    else attributes.delete(name);
  },
  hasAttribute: (name) => attributes.has(name),
  getAttribute: (name) => attributes.get(name),
};

const bodyAttributes = new Map();
const body = {
  setAttribute: (name, value) => bodyAttributes.set(name, String(value)),
  removeAttribute: (name) => bodyAttributes.delete(name),
  hasAttribute: (name) => bodyAttributes.has(name),
};

const listeners = [];
const timers = new Set();
let timerSeq = 0;
const windowStub = {
  __ModuleLoader__: { load: (definition) => { windowStub.__definition = definition; } },
  localStorage: (() => {
    const store = new Map();
    return {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key),
      clear: () => store.clear(),
      _store: store,
    };
  })(),
  addEventListener: (type, fn) => listeners.push({ type, fn }),
  removeEventListener: (type, fn) => {
    const index = listeners.findIndex((entry) => entry.type === type && entry.fn === fn);
    if (index !== -1) listeners.splice(index, 1);
  },
  setInterval: () => { const id = ++timerSeq; timers.add(id); return id; },
  clearInterval: (id) => timers.delete(id),
  setTimeout: (fn) => { fn(); return 0; },
  clearTimeout: () => {},
  navigator: { platform: 'Win32', language: 'en-US', userAgent: 'selftest' },
  document: undefined,
};

Object.defineProperty(globalThis, 'window', { value: windowStub, configurable: true });
Object.defineProperty(globalThis, 'document', { value: { documentElement: html, body }, configurable: true });
Object.defineProperty(globalThis, 'navigator', { value: windowStub.navigator, configurable: true });

// ---------------------------------------------------------------- ctx stub
const registrations = [];
const cleanups = [];
const themeListeners = [];
const ctxStub = {
  effect(fn) {
    const cleanup = fn();
    if (typeof cleanup === 'function') cleanups.push(cleanup);
    return () => {};
  },
  on(name, fn) {
    if (name === 'theme/change') themeListeners.push(fn);
    return () => {
      const index = themeListeners.indexOf(fn);
      if (index !== -1) themeListeners.splice(index, 1);
    };
  },
  get(name) {
    if (name === 'theme') return { getTheme: () => ({ active: { colorScheme: 'dark' } }) };
    if (name === 'locale') return { getLocale: () => ({ id: 'en' }) };
    return undefined;
  },
  slots: {
    inject(slot, callback) { callback(); return () => {}; },
    register(options, component) {
      registrations.push({ slot: options.name, options, component });
      return () => {};
    },
  },
};

// ---------------------------------------------------------------- load plugin
const source = readFileSync(CLIENT, 'utf8');
const load = new Function('window', 'document', 'navigator', 'console', 'require', source);
const requireStub = (id) => {
  if (id === 'react') return React;
  throw new Error('unexpected require: ' + id);
};
load(windowStub, globalThis.document, globalThis.navigator, console, requireStub);
if (!windowStub.__definition) throw new Error('client.js did not call __ModuleLoader__.load');
if (windowStub.__definition.id !== '@local/dsh-terminal-mode') throw new Error('unexpected plugin id');

const plugin = windowStub.__definition.factory(requireStub);
if (!plugin || typeof plugin.apply !== 'function') throw new Error('factory did not return apply()');
plugin.apply(ctxStub);

// ---------------------------------------------------------------- assertions
let failures = 0;
function check(name, condition, detail) {
  if (condition) {
    console.log('ok   ' + name);
  } else {
    failures += 1;
    console.error('FAIL ' + name + (detail === undefined ? '' : ' -> ' + JSON.stringify(detail)));
  }
}

const mode = windowStub.__dshTerminalMode;
check('debug handle installed', !!mode);
check('expected slot registrations', registrations.length === 6, registrations.map((r) => r.slot));
check('registrations cover settings + overlay + sidebar + composer + hero',
  ['settings.section', 'settings.section.icon', 'shell.overlay', 'sidebar.footer.action', 'conversation.composer.dock', 'conversation.hero.brand.mark']
    .every((slot) => registrations.some((r) => r.slot === slot)));

// First run: factory preset = codex.
check('first run starts on codex skin', mode.getState().skin === 'codex', mode.getState());
check('html data-dsk=codex', html.getAttribute('data-dsk') === 'codex', html.getAttribute('data-dsk'));
check('base palette forced dark', body.hasAttribute('data-ds-dark-theme'));
check('bg token published', html.style.values.has('--dsk-bg'), [...html.style.values.keys()].slice(0, 6));
check('font stack published', /mono/i.test(html.style.values.get('--dsk-font-family') || ''));
check('mono attribute on', attributes.has('data-dsk-mono'));

// Skin switch applies its effect preset.
mode.setSkin('phosphor');
check('phosphor skin applied', html.getAttribute('data-dsk') === 'phosphor');
check('phosphor preset enables scanlines', attributes.has('data-dsk-scan'));
check('phosphor preset enables glow', attributes.has('data-dsk-glow'));
check('phosphor preset radius 2px', html.style.values.get('--dsk-radius') === '2px', html.style.values.get('--dsk-radius'));

// Light skin forces the light base palette.
mode.setSkin('paper');
check('paper is a light skin', html.getAttribute('data-dsk-scheme') === 'light');
check('light base palette restored', !body.hasAttribute('data-ds-dark-theme'));

// Restore: untouched default, every override removed.
mode.setSkin('default');
check('default skin clears data-dsk', !attributes.has('data-dsk'));
check('default skin clears custom props', !html.style.values.has('--dsk-bg'));
check('default skin clears scheme attribute', !attributes.has('data-dsk-scheme'));
check('default skin restores dark base per theme snapshot', body.hasAttribute('data-ds-dark-theme'));

// Keyboard fallback (shortcuts service absent in the stub).
const keydown = listeners.find((entry) => entry.type === 'keydown');
check('keyboard fallback installed', !!keydown);
function press(init) {
  const event = Object.assign({ preventDefault() { this.defaultPrevented = true; }, stopPropagation() {}, defaultPrevented: false, isComposing: false, repeat: false }, init);
  keydown.fn(event);
  return event;
}
press({ code: 'KeyT', ctrlKey: true, altKey: true, shiftKey: false, metaKey: false });
check('Mod+Alt+T cycles skin', mode.getState().skin === 'codex', mode.getState().skin);
press({ code: 'Digit3', ctrlKey: false, altKey: true, shiftKey: false, metaKey: false });
check('Alt+3 applies Phosphor Green', mode.getState().skin === 'phosphor', mode.getState().skin);
press({ code: 'Digit1', ctrlKey: false, altKey: true, shiftKey: false, metaKey: false });
check('Alt+1 restores default', mode.getState().skin === 'default');
press({ code: 'KeyK', ctrlKey: true, altKey: true, shiftKey: false, metaKey: false });
check('Mod+Alt+K opens the palette without throwing', true);
mode.closePalette();

// Render every registered component once. Hook state is per-component.
function render(registration) {
  hookIndex = 0;
  hookStore = [];
  effectRuns.clear();
  return registration.component({ size: 40, wide: true, close: () => {} });
}
for (const registration of registrations) {
  try {
    const tree = render(registration);
    check('renders ' + registration.slot + ' (' + registration.options.id + ')', tree !== undefined);
  } catch (error) {
    check('renders ' + registration.slot, false, error && error.message);
  }
}

// Settings page under an active skin, and under the default skin.
mode.setSkin('nord');
for (const registration of registrations.filter((r) => r.slot === 'settings.section')) {
  try {
    render(registration);
    check('settings page renders with nord', true);
  } catch (error) {
    check('settings page renders with nord', false, error && error.message);
  }
}
mode.reset();
check('reset all returns to the factory preset', mode.getState().skin === 'codex', mode.getState().skin);
mode.restoreDefault();
check('restoreDefault returns to the untouched skin', mode.getState().skin === 'default', mode.getState().skin);
mode.reset();

// Cleanup must remove the skin and the debug handle.
cleanups.forEach((fn) => { try { fn(); } catch (error) { check('cleanup runs', false, error && error.message); } });
check('cleanup removes data-dsk', !attributes.has('data-dsk'), html.getAttribute('data-dsk'));
check('cleanup removes debug handle', !windowStub.__dshTerminalMode);

// ---------------------------------------------------------------- service path
// The live page mounts the shortcuts service, so the registered-command path is
// the one that actually runs there. Exercise it in an isolated environment.
function makeEnvironment() {
  const envAttributes = new Map();
  const envHtml = {
    style: createStyle(),
    setAttribute: (name, value) => envAttributes.set(name, String(value)),
    removeAttribute: (name) => envAttributes.delete(name),
    toggleAttribute(name, force) {
      const present = force === undefined ? !envAttributes.has(name) : !!force;
      if (present) envAttributes.set(name, '');
      else envAttributes.delete(name);
    },
    hasAttribute: (name) => envAttributes.has(name),
    getAttribute: (name) => envAttributes.get(name),
  };
  const envBodyAttributes = new Map();
  const envBody = {
    setAttribute: (name, value) => envBodyAttributes.set(name, String(value)),
    removeAttribute: (name) => envBodyAttributes.delete(name),
    hasAttribute: (name) => envBodyAttributes.has(name),
  };
  const envListeners = [];
  const envWindow = {
    __ModuleLoader__: { load: (definition) => { envWindow.__definition = definition; } },
    localStorage: (() => {
      const store = new Map();
      return {
        getItem: (key) => (store.has(key) ? store.get(key) : null),
        setItem: (key, value) => store.set(key, String(value)),
        removeItem: (key) => store.delete(key),
      };
    })(),
    addEventListener: (type, fn) => envListeners.push({ type, fn }),
    removeEventListener: () => {},
    setInterval: () => 1,
    clearInterval: () => {},
    setTimeout: (fn) => { fn(); return 0; },
    clearTimeout: () => {},
    navigator: { platform: 'Win32', language: 'en-US', userAgent: 'selftest' },
  };
  return { envWindow, envDocument: { documentElement: envHtml, body: envBody }, envHtml, envBody, envListeners, envAttributes };
}

{
  const env = makeEnvironment();
  const fixedCommands = [];
  const observers = [];
  let observeDisposals = 0;
  const shortcuts = {
    describeBinding: (binding) => ({ keys: binding.modifiers.concat(binding.code).join('+') }),
    registerFixed: (command) => { fixedCommands.push(command); return () => {}; },
    observeFixedInput: (fn) => { observers.push(fn); return () => { observeDisposals += 1; }; },
  };
  const envCleanups = [];
  const envCtx = {
    effect(fn) { const cleanup = fn(); if (typeof cleanup === 'function') envCleanups.push(cleanup); return () => {}; },
    on() { return () => {}; },
    get(name) {
      if (name === 'theme') return { getTheme: () => ({ active: { colorScheme: 'dark' } }) };
      if (name === 'locale') return { getLocale: () => ({ id: 'zh' }) };
      if (name === 'shortcuts') return shortcuts;
      return undefined;
    },
    slots: { inject: (slot, cb) => { cb(); return () => {}; }, register: () => () => {} },
  };
  const load2 = new Function('window', 'document', 'navigator', 'console', 'require', source);
  load2(env.envWindow, env.envDocument, env.envWindow.navigator, console, requireStub);
  const plugin2 = env.envWindow.__definition.factory(requireStub);
  plugin2.apply(envCtx);
  const mode2 = env.envWindow.__dshTerminalMode;

  check('service path: engine still applies the skin', env.envHtml.getAttribute('data-dsk') === 'codex');
  check('service path: zh locale detected', plugin2 !== undefined);
  check('service path: fixed commands registered', fixedCommands.length >= 13, fixedCommands.length);
  check('service path: one fixed-input observer', observers.length === 1);
  check('service path: no DOM keydown fallback installed', env.envListeners.filter((l) => l.type === 'keydown').length === 0);

  let consumed = false;
  const observer = observers[0];
  observer({
    type: 'input',
    gesture: { code: 'Digit3', alt: true, control: false, shift: false, meta: false },
    consume: () => { consumed = true; },
  });
  check('service path: Alt+3 gesture switches skin', mode2.getState().skin === 'phosphor', mode2.getState().skin);
  check('service path: matched input is consumed', consumed);

  observer({
    type: 'input',
    gesture: { code: 'KeyT', alt: true, control: true, shift: false, meta: false },
    consume: () => {},
  });
  check('service path: Mod+Alt+T gesture cycles skin', mode2.getState().skin === 'amber', mode2.getState().skin);

  observer({ type: 'reset' });
  observer({ type: 'input', gesture: { code: 'KeyK', control: true, alt: true, composing: true } });
  check('service path: composing gestures are ignored', mode2.getState().skin === 'amber');

  envCleanups.forEach((fn) => { try { fn(); } catch (error) { check('service path: cleanup', false, error && error.message); } });
  check('service path: observer disposed on cleanup', observeDisposals === 1);
  check('service path: cleanup removes the skin', !env.envHtml.hasAttribute('data-dsk'));
}

