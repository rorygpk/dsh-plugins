/**
 * Terminal Mode — browser half.
 *
 * Turns the Harness Web GUI into a keyboard-driven terminal look (Codex-style
 * skins, CRT effects, ASCII marks, command palette, statusline) without
 * touching a single harness feature. Every visual change is expressed as
 * design-token overrides plus a plugin-owned stylesheet, so the default skin
 * returns instantly and pixel-identically when the user asks for it.
 *
 * Design rules:
 *  - No harness component is replaced; only tokens, fonts, effects and our own
 *    additive slots are used.
 *  - All state lives in localStorage (`dsh.terminal-mode.v1`), per browser.
 *  - Every DOM change is made from `applyNow`, which is idempotent and fully
 *    reversed by `resetDom`.
 */

window.__ModuleLoader__.load({
  id: '@local/dsh-terminal-mode',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const LS_KEY = 'dsh.terminal-mode.v1';
    const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');
    const MOD = IS_MAC ? 'Cmd' : 'Ctrl'; // label only; matching below accepts both

    // ---------------------------------------------------------------------
    // Colour helpers
    // ---------------------------------------------------------------------

    function clamp(n, lo, hi) {
      return n < lo ? lo : n > hi ? hi : n;
    }

    function parseHex(input) {
      let s = String(input || '').trim().replace(/^#/, '');
      if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
      if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;
      return {
        r: parseInt(s.slice(0, 2), 16),
        g: parseInt(s.slice(2, 4), 16),
        b: parseInt(s.slice(4, 6), 16),
      };
    }

    function toHex(c) {
      const p = (n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
      return '#' + p(c.r) + p(c.g) + p(c.b);
    }

    function rgbToHsl(c) {
      const r = c.r / 255;
      const g = c.g / 255;
      const b = c.b / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const l = (max + min) / 2;
      let hue = 0;
      let sat = 0;
      if (max !== min) {
        const d = max - min;
        sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        else if (max === g) hue = ((b - r) / d + 2) / 6;
        else hue = ((r - g) / d + 4) / 6;
      }
      return { h: hue * 360, s: sat * 100, l: l * 100 };
    }

    function hslToRgb(hsl) {
      const h = ((hsl.h % 360) + 360) % 360 / 360;
      const s = clamp(hsl.s, 0, 100) / 100;
      const l = clamp(hsl.l, 0, 100) / 100;
      if (s === 0) {
        const v = Math.round(l * 255);
        return { r: v, g: v, b: v };
      }
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      const hue2rgb = (t) => {
        let x = t;
        if (x < 0) x += 1;
        if (x > 1) x -= 1;
        if (x < 1 / 6) return p + (q - p) * 6 * x;
        if (x < 1 / 2) return q;
        if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
        return p;
      };
      return {
        r: Math.round(hue2rgb(h + 1 / 3) * 255),
        g: Math.round(hue2rgb(h) * 255),
        b: Math.round(hue2rgb(h - 1 / 3) * 255),
      };
    }

    function scaleLightness(hex, factor) {
      const c = parseHex(hex);
      if (!c || factor === 1) return hex;
      const hsl = rgbToHsl(c);
      hsl.l = clamp(hsl.l * factor, 1, 99);
      return toHex(hslToRgb(hsl));
    }

    function shiftTemperature(hex, degrees) {
      const c = parseHex(hex);
      if (!c || !degrees) return hex;
      const hsl = rgbToHsl(c);
      hsl.h += degrees;
      // A temperature nudge also warms/cools saturation slightly; keep it tame.
      hsl.s = clamp(hsl.s + Math.abs(degrees) * 0.18, 0, 100);
      return toHex(hslToRgb(hsl));
    }

    function mix(a, b, t) {
      const ca = parseHex(a);
      const cb = parseHex(b);
      if (!ca || !cb) return a;
      return toHex({
        r: ca.r + (cb.r - ca.r) * t,
        g: ca.g + (cb.g - ca.g) * t,
        b: ca.b + (cb.b - ca.b) * t,
      });
    }

    function withAlpha(hex, alpha) {
      const c = parseHex(hex);
      if (!c) return hex;
      return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + alpha + ')';
    }

    // ---------------------------------------------------------------------
    // Skins
    // ---------------------------------------------------------------------

    /**
     * `pal` keys are semantic; `resolvePalette` turns them into CSS custom
     * properties named `--dsk-<key>`. `fx` is a first-run effect preset.
     */
    const SKINS = [
      {
        id: 'default',
        scheme: 'dark',
        en: 'Default',
        zh: '默认',
        descEn: 'The original Harness skin. Nothing is overridden.',
        descZh: 'Harness 原始皮肤，不做任何改动。',
        swatch: ['#111318', '#1c1f26', '#6c7a89', '#4c8dff'],
        pal: null,
        fx: { scan: false, scanIntensity: 0, glow: 0, radius: 8 },
      },
      {
        id: 'codex',
        scheme: 'dark',
        en: 'Codex Terminal',
        zh: 'Codex 终端',
        descEn: 'Near-black terminal with a green prompt accent.',
        descZh: '接近纯黑的终端底色，绿色提示符强调。',
        swatch: ['#0a0c0b', '#151a18', '#7ee787', '#d8e2dc'],
        fx: { scan: false, scanIntensity: 0, glow: 0, radius: 4 },
        pal: {
          bg: '#0a0c0b', panel: '#101413', panel2: '#151a18', overlay: '#121615', sidebar: '#080a09',
          menu: '#151a18', border: '#22302a', borderStrong: '#33473d',
          text: '#d8e2dc', dim: '#8ea197', faint: '#5f7168',
          accent: '#7ee787', error: '#ff7b72', warn: '#e3b341', ok: '#56d364',
          code: '#0d1210', selection: '#1c3527', scroll: '#26362f', scrollHover: '#3a5247',
        },
      },
      {
        id: 'phosphor',
        scheme: 'dark',
        en: 'Phosphor Green',
        zh: '磷光绿',
        descEn: 'Green-phosphor CRT with optional scanlines and glow.',
        descZh: '绿色磷光 CRT，可叠加扫描线与辉光。',
        swatch: ['#010603', '#061a10', '#39ff88', '#8bffb5'],
        fx: { scan: true, scanIntensity: 34, glow: 22, radius: 2 },
        pal: {
          bg: '#010603', panel: '#04120a', panel2: '#061a10', overlay: '#05140c', sidebar: '#010402',
          menu: '#061a10', border: '#0f3a24', borderStrong: '#1a6b42',
          text: '#8bffb5', dim: '#4fbf7a', faint: '#2f7d4e',
          accent: '#39ff88', error: '#ff6b6b', warn: '#e8d44d', ok: '#3dff8f',
          code: '#031008', selection: '#0f3d24', scroll: '#154a2e', scrollHover: '#1f6b42',
        },
      },
      {
        id: 'amber',
        scheme: 'dark',
        en: 'Amber CRT',
        zh: '琥珀 CRT',
        descEn: 'Warm amber phosphor, easier on the eyes at night.',
        descZh: '琥珀色磷光，夜间阅读更柔和。',
        swatch: ['#0d0803', '#1b1207', '#ffb000', '#ffcf8a'],
        fx: { scan: true, scanIntensity: 40, glow: 28, radius: 2 },
        pal: {
          bg: '#0d0803', panel: '#140d05', panel2: '#1b1207', overlay: '#170f06', sidebar: '#0a0602',
          menu: '#1b1207', border: '#3a2a10', borderStrong: '#6b4d1c',
          text: '#ffcf8a', dim: '#c79a58', faint: '#8a6a3a',
          accent: '#ffb000', error: '#ff6b5b', warn: '#ffd166', ok: '#9ad36b',
          code: '#120b03', selection: '#3d2a0c', scroll: '#4a3412', scrollHover: '#6b4d1c',
        },
      },
      {
        id: 'tokyonight',
        scheme: 'dark',
        en: 'Tokyo Night',
        zh: '东京夜色',
        descEn: 'Deep blue night palette with a soft blue accent.',
        descZh: '深蓝夜色配色，蓝色强调。',
        swatch: ['#1a1b26', '#24283b', '#7aa2f7', '#c0caf5'],
        fx: { scan: false, scanIntensity: 0, glow: 0, radius: 8 },
        pal: {
          bg: '#1a1b26', panel: '#1f2335', panel2: '#24283b', overlay: '#1f2335', sidebar: '#16161e',
          menu: '#24283b', border: '#2f334d', borderStrong: '#414868',
          text: '#c0caf5', dim: '#9aa5ce', faint: '#565f89',
          accent: '#7aa2f7', error: '#f7768e', warn: '#e0af68', ok: '#9ece6a',
          code: '#1b1e2e', selection: '#283457', scroll: '#2f334d', scrollHover: '#414868',
        },
      },
      {
        id: 'nord',
        scheme: 'dark',
        en: 'Nord',
        zh: '北境',
        descEn: 'Cool arctic blue-grey, low contrast, calm.',
        descZh: '冷调蓝灰，低对比度，平静耐看。',
        swatch: ['#2e3440', '#434c5e', '#88c0d0', '#eceff4'],
        fx: { scan: false, scanIntensity: 0, glow: 0, radius: 8 },
        pal: {
          bg: '#2e3440', panel: '#3b4252', panel2: '#434c5e', overlay: '#3b4252', sidebar: '#292e38',
          menu: '#434c5e', border: '#4c566a', borderStrong: '#5e6a82',
          text: '#eceff4', dim: '#d8dee9', faint: '#8d99ae',
          accent: '#88c0d0', error: '#bf616a', warn: '#ebcb8b', ok: '#a3be8c',
          code: '#2b313c', selection: '#3f4c63', scroll: '#4c566a', scrollHover: '#5e6a82',
        },
      },
      {
        id: 'solarized',
        scheme: 'light',
        en: 'Solarized Light',
        zh: 'Solarized 浅色',
        descEn: 'Warm paper background for daylight work.',
        descZh: '暖纸底色，适合白天使用。',
        swatch: ['#fdf6e3', '#eee8d5', '#268bd2', '#073642'],
        fx: { scan: false, scanIntensity: 0, glow: 0, radius: 6 },
        pal: {
          bg: '#fdf6e3', panel: '#eee8d5', panel2: '#e4ddc8', overlay: '#f7f1de', sidebar: '#f2ebd8',
          menu: '#eee8d5', border: '#d5cdb6', borderStrong: '#b9b09a',
          text: '#073642', dim: '#586e75', faint: '#93a1a1',
          accent: '#268bd2', error: '#dc322f', warn: '#b58900', ok: '#859900',
          code: '#f5efdc', selection: '#cfe3ea', scroll: '#cfc7b0', scrollHover: '#b3ab94',
        },
      },
      {
        id: 'paper',
        scheme: 'light',
        en: 'Paper',
        zh: '纸白',
        descEn: 'Clean light terminal: ink on off-white.',
        descZh: '干净浅色终端：米白纸面上的墨色。',
        swatch: ['#f7f7f4', '#ffffff', '#1f5f8b', '#16181a'],
        fx: { scan: false, scanIntensity: 0, glow: 0, radius: 6 },
        pal: {
          bg: '#f7f7f4', panel: '#ffffff', panel2: '#f0f0ec', overlay: '#ffffff', sidebar: '#efefea',
          menu: '#ffffff', border: '#dcdcd6', borderStrong: '#c2c2ba',
          text: '#16181a', dim: '#5a6066', faint: '#8a9096',
          accent: '#1f5f8b', error: '#b4231f', warn: '#8a6d1f', ok: '#2f6f4f',
          code: '#f3f3ee', selection: '#dbe7f0', scroll: '#c9c9c2', scrollHover: '#b0b0a8',
        },
      },
    ];

    const SKIN_BY_ID = Object.create(null);
    SKINS.forEach((s) => { SKIN_BY_ID[s.id] = s; });

    const MONO_STACK =
      '"JetBrains Mono","Cascadia Code","Fira Code","SFMono-Regular",Consolas,"Liberation Mono",Menlo,monospace';

    const DEFAULTS = {
      skin: 'codex',
      brightness: 100,
      temperature: 0,
      accent: '',
      mono: true,
      font: '',
      radius: 4,
      scan: false,
      scanIntensity: 45,
      glow: 0,
      fxTouched: false,
    };

    /** The factory preset a first install (and "reset all") starts from. */
    function factoryState() {
      const skin = SKIN_BY_ID.codex || SKINS[1];
      return Object.assign({}, DEFAULTS, {
        skin: skin.id,
        radius: skin.fx.radius,
        scan: !!skin.fx.scan,
        scanIntensity: skin.fx.scanIntensity || DEFAULTS.scanIntensity,
        glow: skin.fx.glow || 0,
      });
    }

    // ---------------------------------------------------------------------
    // Locale
    // ---------------------------------------------------------------------

    const STRINGS = {
      en: {
        settingsTitle: 'Terminal mode',
        settingsSubtitle: 'Skins and effects are local to this browser. Functionality is unchanged.',
        skins: 'Skin',
        skinsHint: 'Pick a look. Default restores the original Harness skin instantly.',
        display: 'Display',
        brightness: 'Brightness',
        temperature: 'Background temperature',
        accent: 'Accent colour',
        accentAuto: 'Follow skin',
        mono: 'Monospace interface text',
        font: 'Monospace family',
        fontPlaceholder: 'Leave empty for the system monospace stack',
        shape: 'Shape and effects',
        radius: 'Corner radius',
        scanlines: 'Scanlines',
        scanIntensity: 'Scanline intensity',
        glow: 'Text glow',
        restore: 'Restore default skin',
        resetAll: 'Reset all terminal settings',
        shortcuts: 'Shortcuts',
        paletteTitle: 'Command palette',
        palettePlaceholder: 'Filter actions',
        paletteEmpty: 'No matching action.',
        navigate: 'navigate',
        run: 'run',
        close: 'close',
        statusHint: 'palette',
        skinAction: 'Skin',
        displayAction: 'Display',
        togglesAction: 'Effects',
        brightnessUp: 'Brightness +5',
        brightnessDown: 'Brightness -5',
        brightnessReset: 'Brightness reset to 100',
        cycleSkin: 'Next skin',
        toggleScanlines: 'Toggle scanlines',
        toggleMono: 'Toggle monospace text',
        resetSkin: 'Restore default skin',
        resetEverything: 'Reset all terminal settings',
        active: 'active',
        footerButton: 'Terminal mode',
        footerHint: 'Terminal mode (palette shortcut)',
        heroLine: '> terminal mode ready',
        preview: 'Preview',
        previewText: 'The quick brown fox jumps over 13 lazy dogs.',
        defaultNote: 'No overrides applied',
      },
      zh: {
        settingsTitle: '终端模式',
        settingsSubtitle: '皮肤与特效仅保存在本机浏览器，功能不受影响。',
        skins: '皮肤',
        skinsHint: '选择外观。默认皮肤会立即还原为 Harness 原始样式。',
        display: '显示',
        brightness: '亮度',
        temperature: '背景色温',
        accent: '强调色',
        accentAuto: '跟随皮肤',
        mono: '界面使用等宽字体',
        font: '等宽字体族',
        fontPlaceholder: '留空则使用系统等宽字体栈',
        shape: '形状与特效',
        radius: '圆角',
        scanlines: '扫描线',
        scanIntensity: '扫描线强度',
        glow: '文字辉光',
        restore: '还原默认皮肤',
        resetAll: '重置全部终端设置',
        shortcuts: '快捷键',
        paletteTitle: '命令面板',
        palettePlaceholder: '输入以筛选操作',
        paletteEmpty: '没有匹配的操作。',
        navigate: '移动',
        run: '执行',
        close: '关闭',
        statusHint: '命令面板',
        skinAction: '皮肤',
        displayAction: '显示',
        togglesAction: '特效',
        brightnessUp: '亮度 +5',
        brightnessDown: '亮度 -5',
        brightnessReset: '亮度重置为 100',
        cycleSkin: '下一个皮肤',
        toggleScanlines: '切换扫描线',
        toggleMono: '切换等宽字体',
        resetSkin: '还原默认皮肤',
        resetEverything: '重置全部终端设置',
        active: '当前',
        footerButton: '终端模式',
        footerHint: '终端模式（打开命令面板）',
        heroLine: '> 终端模式已就绪',
        preview: '预览',
        previewText: '字体、颜色与特效会立即应用到整个界面。',
        defaultNote: '未覆盖任何样式',
      },
    };

    let LANG = 'en';

    function detectLang(ctx) {
      try {
        const locale = ctx.get('locale');
        if (locale && typeof locale.getLocale === 'function') {
          const snap = locale.getLocale();
          const id = String((snap && (snap.id || snap.locale || snap.language)) || '');
          if (id) return id.toLowerCase().startsWith('zh') ? 'zh' : 'en';
        }
      } catch (_e) { /* fall through */ }
      const nav = (typeof navigator !== 'undefined' && navigator.language) || '';
      return nav.toLowerCase().startsWith('zh') ? 'zh' : 'en';
    }

    function L(key) {
      const table = STRINGS[LANG] || STRINGS.en;
      return table[key] !== undefined ? table[key] : STRINGS.en[key];
    }

    // ---------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------

    function loadState() {
      try {
        const raw = window.localStorage.getItem(LS_KEY);
        if (!raw) return factoryState();
        const parsed = JSON.parse(raw);
        const next = Object.assign({}, factoryState(), parsed && typeof parsed === 'object' ? parsed : {});
        if (!SKIN_BY_ID[next.skin]) next.skin = factoryState().skin;
        next.brightness = clamp(Number(next.brightness) || 100, 60, 140);
        next.temperature = clamp(Number(next.temperature) || 0, -40, 40);
        next.radius = clamp(Number.isFinite(next.radius) ? next.radius : 8, 0, 14);
        next.scanIntensity = clamp(Number(next.scanIntensity) || 45, 0, 100);
        next.glow = clamp(Number(next.glow) || 0, 0, 100);
        next.accent = typeof next.accent === 'string' ? next.accent : '';
        next.font = typeof next.font === 'string' ? next.font : '';
        next.mono = next.mono !== false;
        next.scan = !!next.scan;
        next.fxTouched = !!next.fxTouched;
        return next;
      } catch (_e) {
        return Object.assign({}, DEFAULTS);
      }
    }

    function saveState(next) {
      try {
        window.localStorage.setItem(LS_KEY, JSON.stringify(next));
      } catch (_e) { /* private mode: keep the in-memory state */ }
    }

    let state = loadState();
    const stateListeners = new Set();

    function emitState() {
      stateListeners.forEach((fn) => {
        try { fn(); } catch (_e) { /* one listener must not break others */ }
      });
    }

    function patchState(patch) {
      state = Object.assign({}, state, patch);
      saveState(state);
      applyNow();
      emitState();
    }

    function subscribe(fn) {
      stateListeners.add(fn);
      return () => stateListeners.delete(fn);
    }

    function useModeState() {
      const [, force] = React.useState(0);
      React.useEffect(() => subscribe(() => force((n) => n + 1)), []);
      return state;
    }

    // Palette visibility is separate so the overlay component stays mounted
    // (it also owns the plugin stylesheet) while closed.
    let paletteOpen = false;
    const paletteListeners = new Set();

    function emitPalette() {
      paletteListeners.forEach((fn) => {
        try { fn(); } catch (_e) { /* ignore */ }
      });
    }

    function setPalette(open) {
      paletteOpen = !!open;
      emitPalette();
    }

    function togglePalette() {
      setPalette(!paletteOpen);
    }

    // ---------------------------------------------------------------------
    // Palette resolution -> CSS custom properties
    // ---------------------------------------------------------------------

    const TINTABLE = [
      'bg', 'panel', 'panel2', 'overlay', 'sidebar', 'menu', 'border', 'borderStrong',
      'code', 'selection', 'scroll', 'scrollHover',
    ];

    function resolvePalette(skin) {
      const source = skin.pal;
      const out = Object.assign({}, source);
      const brightness = state.brightness / 100;
      const temperature = state.temperature;
      Object.keys(out).forEach((key) => {
        let value = out[key];
        if (brightness !== 1) value = scaleLightness(value, brightness);
        if (temperature !== 0 && TINTABLE.indexOf(key) !== -1) value = shiftTemperature(value, temperature);
        out[key] = value;
      });
      if (state.accent) {
        const accent = state.accent;
        out.accent = accent;
        out.selection = mix(out.bg, accent, skin.scheme === 'dark' ? 0.24 : 0.18);
        out.scrollHover = mix(out.scroll, accent, 0.4);
      }
      out.shimmer = skin.scheme === 'dark' ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.22)';
      out.selection2 = mix(out.bg, out.accent, skin.scheme === 'dark' ? 0.4 : 0.28);
      out.glow = out.accent;
      return out;
    }

    function tokenDeclarations(p) {
      return [
        '--dsw-alias-bg-base: var(--dsk-bg) !important;',
        '--dsw-alias-bg-layer-1: var(--dsk-panel) !important;',
        '--dsw-alias-bg-layer-2: var(--dsk-panel2) !important;',
        '--dsw-alias-bg-layer-3: var(--dsk-panel2) !important;',
        '--dsw-alias-bg-overlay: var(--dsk-overlay) !important;',
        '--dsw-alias-bg-document-preview: var(--dsk-panel2) !important;',
        '--dsw-alias-bg-document-selection: var(--dsk-selection2) !important;',
        '--dsw-specific-sidebar-fill: var(--dsk-sidebar) !important;',
        '--dsw-specific-menu: var(--dsk-menu) !important;',
        '--dsw-alias-menu-group-header-fill: var(--dsk-menu) !important;',
        '--dsw-menu-surface-fill: var(--dsk-menu) !important;',
        '--dsw-alias-toast-bg: var(--dsk-panel2) !important;',
        '--dsw-alias-toast-label: var(--dsk-text) !important;',
        '--dsw-alias-tooltip-key-bg: var(--dsk-panel2) !important;',
        '--dsw-alias-switch-thumb: var(--dsk-text) !important;',
        '--dsw-alias-border-l1: var(--dsk-border) !important;',
        '--dsw-alias-border-l2: var(--dsk-borderStrong) !important;',
        '--dsw-alias-border-l3: var(--dsk-borderStrong) !important;',
        '--dsw-alias-label-primary: var(--dsk-text) !important;',
        '--dsw-alias-label-secondary: var(--dsk-dim) !important;',
        '--dsw-alias-label-primary-dimmed: var(--dsk-faint) !important;',
        '--dsw-alias-menu-icon: var(--dsk-dim) !important;',
        '--dsw-alias-label-shimmer: var(--dsk-shimmer) !important;',
        '--dsw-alias-label-deep-diving: var(--dsk-accent) !important;',
        '--dsw-alias-label-deep-diving-shimmer: var(--dsk-shimmer) !important;',
        '--dsw-alias-brand-primary: var(--dsk-accent) !important;',
        '--dsw-alias-state-business-primary: var(--dsk-accent) !important;',
        '--dsw-alias-state-error-primary: var(--dsk-error) !important;',
        '--dsw-alias-state-warn-primary: var(--dsk-warn) !important;',
        '--dsw-alias-state-success-primary: var(--dsk-ok) !important;',
        '--dsw-alias-state-idle-primary: var(--dsk-faint) !important;',
        '--dsw-alias-state-done-primary: var(--dsk-accent) !important;',
        '--dsw-alias-scrollbar-thumb: var(--dsk-scroll) !important;',
        '--dsw-alias-scrollbar-thumb-hover: var(--dsk-scrollHover) !important;',
        '--dsh-scrollbar-thumb: var(--dsk-scroll) !important;',
        '--dsh-scrollbar-thumb-hover: var(--dsk-scrollHover) !important;',
        '--dsw-alias-markdown-code-block: var(--dsk-code) !important;',
        '--dsw-focus-ring-color: var(--dsk-accent) !important;',
      ].join('\n  ');
    }

    // ---------------------------------------------------------------------
    // Stylesheet (plugin-owned, inert until <html data-dsk> is present)
    // ---------------------------------------------------------------------

    const CSS = [
      '/* Token overrides: only active while a non-default skin is applied. */',
      'html[data-dsk] body {',
      '  ' + tokenDeclarations(),
      '  caret-color: var(--dsk-accent);',
      '}',
      '/* Monospace interface text (toggleable). */',
      'html[data-dsk][data-dsk-mono] body {',
      '  --dsw-font-family: var(--dsk-font-family) !important;',
      '  --ds-font-family-code: var(--dsk-font-family) !important;',
      '}',
      '/* Terminal corner treatment. */',
      'html[data-dsk] :where(button, input, textarea, select, [role="dialog"], [role="menu"], [role="listbox"], [role="menuitem"], [role="tab"]) {',
      '  border-radius: var(--dsk-radius) !important;',
      '}',
      '/* Square, thin scrollbars. */',
      'html[data-dsk] ::-webkit-scrollbar { width: 10px; height: 10px; }',
      'html[data-dsk] ::-webkit-scrollbar-track { background: transparent; }',
      'html[data-dsk] ::-webkit-scrollbar-thumb {',
      '  background: var(--dsk-scroll);',
      '  border: 2px solid var(--dsk-bg);',
      '  border-radius: var(--dsk-radius);',
      '}',
      'html[data-dsk] ::-webkit-scrollbar-thumb:hover { background: var(--dsk-scrollHover); }',
      'html[data-dsk] ::selection { background: var(--dsk-selection); color: var(--dsk-text); }',
      '/* CRT scanlines, drawn above everything but never interactive. */',
      'html[data-dsk][data-dsk-scan] body::after {',
      '  content: "";',
      '  position: fixed; inset: 0;',
      '  pointer-events: none;',
      '  z-index: 2147483000;',
      '  background: repeating-linear-gradient(to bottom, var(--dsk-glow) 0, var(--dsk-glow) 1px, transparent 1px, transparent 3px);',
      '  opacity: var(--dsk-scan-opacity, 0.3);',
      '  mix-blend-mode: overlay;',
      '}',
      'html[data-dsk][data-dsk-scan][data-dsk-light] body::after { mix-blend-mode: multiply; opacity: calc(var(--dsk-scan-opacity, 0.3) * 0.35); }',
      '/* Phosphor glow on text. */',
      'html[data-dsk][data-dsk-glow] body {',
      '  text-shadow: 0 0 var(--dsk-glow-size, 0px) var(--dsk-glow-color, transparent);',
      '}',
      '/* ---- Plugin components (terminal UI) ---- */',
      '.dsk-root {',
      '  font-family: var(--dsk-font-family, ' + MONO_STACK + ');',
      '  color: var(--dsw-alias-label-primary, #e6e8eb);',
      '}',
      '/* Statusline */',
      '.dsk-status {',
      '  display: flex; align-items: center; gap: 8px; justify-content: space-between;',
      '  font-family: var(--dsk-font-family, ' + MONO_STACK + ');',
      '  font-size: 11px; line-height: 1.5; letter-spacing: 0.02em;',
      '  color: var(--dsw-alias-label-secondary, #9aa1ab);',
      '  padding: 2px 8px 0; user-select: none;',
      '}',
      '.dsk-status-left, .dsk-status-right { display: inline-flex; align-items: center; gap: 8px; min-width: 0; }',
      '.dsk-status-prompt { color: var(--dsw-alias-brand-primary, #4c8dff); font-weight: 600; }',
      '.dsk-status-skin { color: var(--dsw-alias-label-primary, #e6e8eb); }',
      '.dsk-status-sep { opacity: 0.45; }',
      '.dsk-status-hint { white-space: nowrap; }',
      '.dsk-cursor { display: inline-block; width: 6px; height: 11px; margin-left: 2px; background: currentColor; animation: dsk-blink 1.1s steps(1) infinite; }',
      '@keyframes dsk-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }',
      '/* Hero mark: a square terminal tile sized by the owner. */',
      '.dsk-hero {',
      '  display: inline-flex; align-items: center; justify-content: center;',
      '  box-sizing: border-box; flex: none;',
      '  font-family: var(--dsk-font-family, ' + MONO_STACK + ');',
      '  font-weight: 600; line-height: 1; white-space: nowrap;',
      '  color: var(--dsw-alias-brand-primary, #4c8dff);',
      '  border: 1px solid var(--dsw-alias-border-l2, #343941);',
      '  border-radius: var(--dsk-radius, 8px);',
      '  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1, #16181c) 90%, transparent);',
      '}',
      '.dsk-hero-tag { letter-spacing: -0.02em; }',
      '/* Sidebar footer action */',
      '.dsk-footer {',
      '  display: inline-flex; align-items: center; justify-content: center; gap: 6px;',
      '  height: 28px; min-width: 28px; padding: 0 7px;',
      '  border: 1px solid transparent; border-radius: 6px; background: transparent;',
      '  color: var(--dsw-alias-label-secondary, #9aa1ab); cursor: pointer;',
      '  font-family: var(--dsk-font-family, ' + MONO_STACK + '); font-size: 11px; line-height: 1;',
      '}',
      '.dsk-footer:hover { background: var(--dsw-alias-bg-layer-2, #1c1f24); color: var(--dsw-alias-label-primary, #e6e8eb); }',
      '.dsk-footer-wide { height: 32px; padding: 0 10px; justify-content: flex-start; }',
      '.dsk-footer-label { white-space: nowrap; }',
      '.dsk-footer:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary, #4c8dff); outline-offset: 1px; }',
      '/* Command palette */',
      '.dsk-overlay {',
      '  position: fixed; inset: 0; z-index: 2147483200;',
      '  pointer-events: auto;',
      '  display: flex; align-items: flex-start; justify-content: center;',
      '  padding: 12vh 16px 16px;',
      '  background: rgba(0,0,0,0.46);',
      '  backdrop-filter: blur(2px);',
      '}',
      'html[data-dsk-light] .dsk-overlay { background: rgba(20,22,24,0.32); }',
      '.dsk-panel {',
      '  width: min(560px, 94vw); max-height: 70vh; display: flex; flex-direction: column;',
      '  border: 1px solid var(--dsw-alias-border-l2, #343941);',
      '  border-radius: var(--dsk-radius, 8px);',
      '  background: var(--dsw-alias-bg-overlay, #14161a);',
      '  box-shadow: 0 18px 48px rgba(0,0,0,0.45);',
      '  overflow: hidden; font-family: var(--dsk-font-family, ' + MONO_STACK + ');',
      '}',
      '.dsk-panel-head {',
      '  display: flex; align-items: center; gap: 8px; padding: 10px 12px;',
      '  border-bottom: 1px solid var(--dsw-alias-border-l1, #2a2e35);',
      '  color: var(--dsw-alias-label-secondary, #9aa1ab); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;',
      '}',
      '.dsk-panel-input-row { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-bottom: 1px solid var(--dsw-alias-border-l1, #2a2e35); }',
      '.dsk-panel-caret { color: var(--dsw-alias-brand-primary, #4c8dff); font-weight: 600; }',
      '.dsk-panel-input {',
      '  flex: 1; min-width: 0; border: 0; outline: 0; background: transparent;',
      '  color: var(--dsw-alias-label-primary, #e6e8eb);',
      '  font-family: inherit; font-size: 13px;',
      '}',
      '.dsk-panel-input::placeholder { color: var(--dsw-alias-label-secondary, #9aa1ab); opacity: 0.7; }',
      '.dsk-panel-list { overflow: auto; padding: 4px; }',
      '.dsk-group { padding: 8px 10px 4px; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dsw-alias-label-secondary, #9aa1ab); opacity: 0.75; }',
      '.dsk-item {',
      '  display: flex; align-items: center; gap: 10px; width: 100%; box-sizing: border-box;',
      '  padding: 7px 10px; border: 0; border-radius: 4px; background: transparent;',
      '  color: var(--dsw-alias-label-primary, #e6e8eb); text-align: left; cursor: pointer;',
      '  font-family: inherit; font-size: 12.5px;',
      '}',
      '.dsk-item[data-sel="1"] { background: var(--dsw-alias-bg-document-selection, rgba(76,141,255,0.18)); }',
      '.dsk-item-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
      '.dsk-item-mark { color: var(--dsw-alias-brand-primary, #4c8dff); font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; }',
      '.dsk-kbd {',
      '  font-family: inherit; font-size: 10px; padding: 1px 5px; white-space: nowrap;',
      '  border: 1px solid var(--dsw-alias-border-l1, #2a2e35); border-radius: 3px;',
      '  color: var(--dsw-alias-label-secondary, #9aa1ab);',
      '}',
      '.dsk-panel-foot {',
      '  display: flex; align-items: center; gap: 12px; padding: 8px 12px;',
      '  border-top: 1px solid var(--dsw-alias-border-l1, #2a2e35);',
      '  color: var(--dsw-alias-label-secondary, #9aa1ab); font-size: 10.5px;',
      '}',
      '.dsk-empty { padding: 18px 12px; color: var(--dsw-alias-label-secondary, #9aa1ab); font-size: 12px; text-align: center; }',
      '/* Settings page */',
      '.dsk-page { padding: 4px 2px 28px; max-width: 760px; }',
      '.dsk-page h2 { margin: 0 0 4px; font-size: 16px; font-weight: 600; color: var(--dsw-alias-label-primary, #e6e8eb); }',
      '.dsk-page-sub { margin: 0 0 18px; font-size: 12px; line-height: 1.6; color: var(--dsw-alias-label-secondary, #9aa1ab); }',
      '.dsk-section { margin: 0 0 16px; padding: 14px; border: 1px solid var(--dsw-alias-border-l1, #2a2e35); border-radius: var(--dsk-radius, 8px); background: var(--dsw-alias-bg-layer-1, #16181c); }',
      '.dsk-section-title { margin: 0 0 2px; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--dsw-alias-label-primary, #e6e8eb); }',
      '.dsk-section-hint { margin: 0 0 10px; font-size: 11.5px; color: var(--dsw-alias-label-secondary, #9aa1ab); }',
      '.dsk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(158px, 1fr)); gap: 10px; }',
      '.dsk-skin {',
      '  display: flex; flex-direction: column; gap: 8px; text-align: left; cursor: pointer;',
      '  padding: 8px; border: 1px solid var(--dsw-alias-border-l1, #2a2e35); border-radius: var(--dsk-radius, 8px);',
      '  background: var(--dsw-alias-bg-layer-2, #1c1f24); color: var(--dsw-alias-label-primary, #e6e8eb);',
      '  font-family: inherit;',
      '}',
      '.dsk-skin:hover { border-color: var(--dsw-alias-border-l2, #343941); }',
      '.dsk-skin[data-active="1"] { border-color: var(--dsw-alias-brand-primary, #4c8dff); box-shadow: 0 0 0 1px var(--dsw-alias-brand-primary, #4c8dff) inset; }',
      '.dsk-swatch { display: flex; height: 30px; border-radius: 3px; overflow: hidden; }',
      '.dsk-swatch span { flex: 1; }',
      '.dsk-skin-name { font-size: 12.5px; font-weight: 600; }',
      '.dsk-skin-desc { font-size: 10.5px; line-height: 1.45; color: var(--dsw-alias-label-secondary, #9aa1ab); min-height: 28px; }',
      '.dsk-skin-tag { align-self: flex-start; font-size: 9.5px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dsw-alias-brand-primary, #4c8dff); }',
      '.dsk-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 7px 0; border-top: 1px solid var(--dsw-alias-border-l1, #2a2e35); }',
      '.dsk-row:first-of-type { border-top: 0; }',
      '.dsk-row-label { font-size: 12.5px; color: var(--dsw-alias-label-primary, #e6e8eb); }',
      '.dsk-row-value { display: inline-flex; align-items: center; gap: 8px; }',
      '.dsk-range { width: 190px; max-width: 44vw; accent-color: var(--dsw-alias-brand-primary, #4c8dff); }',
      '.dsk-readout { min-width: 42px; text-align: right; font-size: 11.5px; color: var(--dsw-alias-label-secondary, #9aa1ab); }',
      '.dsk-toggle { width: 16px; height: 16px; accent-color: var(--dsw-alias-brand-primary, #4c8dff); cursor: pointer; }',
      '.dsk-text {',
      '  width: 220px; max-width: 48vw; height: 28px; padding: 0 8px; box-sizing: border-box;',
      '  border: 1px solid var(--dsw-alias-border-l1, #2a2e35); border-radius: 4px;',
      '  background: var(--dsw-alias-bg-base, #111318); color: var(--dsw-alias-label-primary, #e6e8eb);',
      '  font-family: inherit; font-size: 11.5px;',
      '}',
      '.dsk-color { width: 34px; height: 26px; padding: 0; border: 1px solid var(--dsw-alias-border-l1, #2a2e35); background: transparent; cursor: pointer; }',
      '.dsk-btn {',
      '  height: 30px; padding: 0 12px; cursor: pointer;',
      '  border: 1px solid var(--dsw-alias-border-l2, #343941); border-radius: 4px;',
      '  background: transparent; color: var(--dsw-alias-label-primary, #e6e8eb);',
      '  font-family: inherit; font-size: 11.5px;',
      '}',
      '.dsk-btn:hover { background: var(--dsw-alias-bg-layer-2, #1c1f24); }',
      '.dsk-btn-primary { border-color: var(--dsw-alias-brand-primary, #4c8dff); color: var(--dsw-alias-brand-primary, #4c8dff); }',
      '.dsk-btn-danger { border-color: var(--dsw-alias-state-error-primary, #e5534b); color: var(--dsw-alias-state-error-primary, #e5534b); }',
      '.dsk-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }',
      '.dsk-preview { padding: 10px; border: 1px dashed var(--dsw-alias-border-l2, #343941); border-radius: 4px; background: var(--dsw-alias-bg-base, #111318); }',
      '.dsk-preview-line { font-size: 12px; color: var(--dsw-alias-label-primary, #e6e8eb); }',
      '.dsk-preview-dim { margin-top: 4px; font-size: 11px; color: var(--dsw-alias-label-secondary, #9aa1ab); }',
      '.dsk-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }',
      '.dsk-table td { padding: 5px 0; border-top: 1px solid var(--dsw-alias-border-l1, #2a2e35); vertical-align: middle; }',
      '.dsk-table tr:first-child td { border-top: 0; }',
      '.dsk-table td:last-child { text-align: right; }',
      '@media (prefers-reduced-motion: reduce) { .dsk-cursor { animation: none; } }',
    ].join('\n');

    // ---------------------------------------------------------------------
    // DOM application
    // ---------------------------------------------------------------------

    const ROOT = () => document.documentElement;
    const VARS = [
      'bg', 'panel', 'panel2', 'overlay', 'sidebar', 'menu', 'border', 'borderStrong',
      'text', 'dim', 'faint', 'accent', 'error', 'warn', 'ok', 'code', 'selection',
      'selection2', 'scroll', 'scrollHover', 'shimmer', 'glow',
    ];

    function clearDskVars(root) {
      VARS.forEach((key) => root.style.removeProperty('--dsk-' + key));
      [
        '--dsk-font-family', '--dsk-radius', '--dsk-scan-opacity',
        '--dsk-glow-size', '--dsk-glow-color',
      ].forEach((name) => root.style.removeProperty(name));
    }

    function setBaseScheme(scheme) {
      const root = ROOT();
      root.style.colorScheme = scheme;
      const body = document.body;
      if (!body) return;
      if (scheme === 'dark') body.setAttribute('data-ds-dark-theme', '');
      else body.removeAttribute('data-ds-dark-theme');
    }

    function restoreBaseScheme() {
      let scheme = 'dark';
      try {
        const theme = ctxRef.get('theme');
        if (theme && typeof theme.getTheme === 'function') {
          const snap = theme.getTheme();
          if (snap && snap.active && (snap.active.colorScheme === 'light' || snap.active.colorScheme === 'dark')) {
            scheme = snap.active.colorScheme;
          }
        }
      } catch (_e) { /* keep dark */ }
      const root = ROOT();
      root.style.removeProperty('color-scheme');
      setBaseScheme(scheme);
    }

    function resetDom() {
      const root = ROOT();
      root.removeAttribute('data-dsk');
      root.removeAttribute('data-dsk-scheme');
      root.removeAttribute('data-dsk-mono');
      root.removeAttribute('data-dsk-scan');
      root.removeAttribute('data-dsk-glow');
      root.removeAttribute('data-dsk-light');
      clearDskVars(root);
      restoreBaseScheme();
    }

    function applyNow() {
      const root = ROOT();
      const skin = SKIN_BY_ID[state.skin] || SKINS[0];
      if (skin.id === 'default' || !skin.pal) {
        resetDom();
        return;
      }
      const p = resolvePalette(skin);
      root.setAttribute('data-dsk', skin.id);
      root.setAttribute('data-dsk-scheme', skin.scheme);
      root.toggleAttribute('data-dsk-light', skin.scheme === 'light');
      VARS.forEach((key) => {
        if (p[key]) root.style.setProperty('--dsk-' + key, p[key]);
      });
      root.style.setProperty('--dsk-font-family', normalizeFont(state.font));
      root.style.setProperty('--dsk-radius', clamp(state.radius, 0, 14) + 'px');
      root.toggleAttribute('data-dsk-mono', !!state.mono);
      root.toggleAttribute('data-dsk-scan', !!state.scan);
      root.style.setProperty('--dsk-scan-opacity', (state.scanIntensity / 100).toFixed(2));
      const glowOn = state.glow > 0;
      root.toggleAttribute('data-dsk-glow', glowOn);
      root.style.setProperty('--dsk-glow-size', (state.glow / 100 * 6).toFixed(2) + 'px');
      root.style.setProperty('--dsk-glow-color', withAlpha(p.glow || p.accent, (state.glow / 100 * 0.55).toFixed(2)));
      setBaseScheme(skin.scheme);
    }

    function normalizeFont(input) {
      const raw = String(input || '').trim();
      if (!raw) return MONO_STACK;
      // Accept a comma-separated list of family names; quote bare names.
      const parts = raw.split(',').map((part) => part.trim()).filter(Boolean);
      const generic = /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-monospace)$/i;
      const normalized = parts.map((name) => {
        const bare = name.replace(/^['"]|['"]$/g, '');
        if (!bare) return '';
        if (generic.test(bare)) return bare;
        if (/^['"].*['"]$/.test(name)) return name;
        return '"' + bare.replace(/["\\<>]/g, '') + '"';
      }).filter(Boolean);
      if (!normalized.length) return MONO_STACK;
      return normalized.join(', ') + ', ' + MONO_STACK;
    }

    // ---------------------------------------------------------------------
    // Actions
    // ---------------------------------------------------------------------

    function setSkin(id) {
      const skin = SKIN_BY_ID[id] ? SKIN_BY_ID[id] : SKINS[0];
      const patch = { skin: skin.id };
      if (!state.fxTouched && skin.fx) {
        if (skin.id === 'default') {
          patch.scan = false;
          patch.glow = 0;
        } else {
          patch.scan = !!skin.fx.scan;
          patch.scanIntensity = skin.fx.scanIntensity || 45;
          patch.glow = skin.fx.glow || 0;
          patch.radius = skin.fx.radius !== undefined ? skin.fx.radius : state.radius;
        }
      }
      patchState(patch);
    }

    function cycleSkin() {
      const index = SKINS.findIndex((s) => s.id === state.skin);
      const next = SKINS[(index + 1 + SKINS.length) % SKINS.length];
      setSkin(next.id);
    }

    function restoreDefault() {
      patchState({ skin: 'default', scan: false, glow: 0 });
    }

    function resetAll() {
      state = factoryState();
      saveState(state);
      applyNow();
      emitState();
    }

    function touchFx(patch) {
      patchState(Object.assign({ fxTouched: true }, patch));
    }

    function brightnessBy(delta) {
      patchState({ brightness: clamp(state.brightness + delta, 60, 140) });
    }

    // ---------------------------------------------------------------------
    // Components
    // ---------------------------------------------------------------------

    function SkinSwatch(props) {
      const skin = props.skin;
      if (!skin.swatch) return null;
      return h('span', { className: 'dsk-swatch', 'aria-hidden': true },
        skin.swatch.map((color, index) => h('span', { key: index, style: { background: color } })));
    }

    function TerminalSettingsPage() {
      useModeState();
      const skin = SKIN_BY_ID[state.skin] || SKINS[0];

      function row(label, valueNode) {
        return h('div', { className: 'dsk-row', key: label },
          h('span', { className: 'dsk-row-label' }, label),
          h('span', { className: 'dsk-row-value' }, valueNode));
      }

      function rangeRow(label, key, min, max, step, suffixKey, isFx) {
        const value = state[key];
        return row(label,
          h(React.Fragment, null,
            h('input', {
              className: 'dsk-range', type: 'range', min, max, step,
              value,
              'aria-label': label,
              onChange: (e) => {
                const next = { [key]: Number(e.target.value) };
                if (isFx) touchFx(next);
                else patchState(next);
              },
            }),
            h('span', { className: 'dsk-readout' }, value + (suffixKey || ''))));
      }

      const skins = h('div', { className: 'dsk-grid' },
        SKINS.map((item) => h('button', {
          key: item.id,
          type: 'button',
          className: 'dsk-skin',
          'data-active': item.id === state.skin ? '1' : '0',
          'aria-pressed': item.id === state.skin,
          onClick: () => setSkin(item.id),
        },
          h(SkinSwatch, { skin: item }),
          h('span', { className: 'dsk-skin-name' }, LANG === 'zh' ? item.zh : item.en),
          h('span', { className: 'dsk-skin-desc' }, LANG === 'zh' ? item.descZh : item.descEn),
          h('span', { className: 'dsk-skin-tag' }, item.id === state.skin ? L('active') : ''))));

      const display = h('div', { className: 'dsk-section' },
        h('h3', { className: 'dsk-section-title' }, L('display')),
        rangeRow(L('brightness'), 'brightness', 60, 140, 1, '%'),
        row(L('temperature'),
          h(React.Fragment, null,
            h('input', {
              className: 'dsk-range', type: 'range', min: -40, max: 40, step: 1,
              value: state.temperature, 'aria-label': L('temperature'),
              onChange: (e) => patchState({ temperature: Number(e.target.value) }),
            }),
            h('span', { className: 'dsk-readout' }, (state.temperature > 0 ? '+' : '') + state.temperature))),
        row(L('accent'),
          h(React.Fragment, null,
            h('input', {
              className: 'dsk-color', type: 'color',
              value: parseHex(state.accent) ? state.accent : (skin.pal ? skin.pal.accent : '#4c8dff'),
              'aria-label': L('accent'),
              onChange: (e) => patchState({ accent: e.target.value }),
            }),
            h('button', {
              type: 'button', className: 'dsk-btn',
              onClick: () => patchState({ accent: '' }),
              disabled: !state.accent,
            }, L('accentAuto')))),
        row(L('mono'),
          h('input', {
            className: 'dsk-toggle', type: 'checkbox', checked: state.mono,
            'aria-label': L('mono'),
            onChange: (e) => patchState({ mono: e.target.checked }),
          })),
        row(L('font'),
          h('input', {
            className: 'dsk-text', type: 'text', value: state.font,
            placeholder: L('fontPlaceholder'),
            'aria-label': L('font'),
            onChange: (e) => patchState({ font: e.target.value }),
          })));

      const shape = h('div', { className: 'dsk-section' },
        h('h3', { className: 'dsk-section-title' }, L('shape')),
        rangeRow(L('radius'), 'radius', 0, 14, 1, 'px', true),
        row(L('scanlines'),
          h(React.Fragment, null,
            h('input', {
              className: 'dsk-toggle', type: 'checkbox', checked: state.scan,
              'aria-label': L('scanlines'),
              onChange: (e) => touchFx({ scan: e.target.checked }),
            }),
            h('input', {
              className: 'dsk-range', type: 'range', min: 0, max: 100, step: 1,
              value: state.scanIntensity, 'aria-label': L('scanIntensity'),
              disabled: !state.scan,
              onChange: (e) => touchFx({ scanIntensity: Number(e.target.value) }),
            }),
            h('span', { className: 'dsk-readout' }, state.scanIntensity + '%'))),
        rangeRow(L('glow'), 'glow', 0, 100, 1, '%', true));

      const preview = h('div', { className: 'dsk-section' },
        h('h3', { className: 'dsk-section-title' }, L('preview')),
        h('div', { className: 'dsk-preview' },
          h('div', { className: 'dsk-preview-line' }, L('previewText')),
          h('div', { className: 'dsk-preview-dim' },
            L('defaultNote') + ' · ' + (LANG === 'zh' ? skin.zh : skin.en) + ' · ' + state.brightness + '%')));

      const shortcuts = h('div', { className: 'dsk-section' },
        h('h3', { className: 'dsk-section-title' }, L('shortcuts')),
        h('table', { className: 'dsk-table' },
          h('tbody', null,
            [
              [MOD + '+Alt+K', L('paletteTitle')],
              [MOD + '+Alt+T', L('cycleSkin')],
              [MOD + '+Alt+0', L('restore')],
              [MOD + '+Alt+B', L('brightnessUp')],
              [MOD + '+Alt+Shift+B', L('brightnessDown')],
              ['Alt+1 … Alt+8', L('skins')],
            ].map((pair) => h('tr', { key: pair[0] },
              h('td', null, h('span', { className: 'dsk-kbd' }, pair[0])),
              h('td', null, pair[1]))))));

      const actions = h('div', { className: 'dsk-actions' },
        h('button', { type: 'button', className: 'dsk-btn dsk-btn-primary', onClick: restoreDefault }, L('restore')),
        h('button', { type: 'button', className: 'dsk-btn dsk-btn-danger', onClick: resetAll }, L('resetAll')));

      return h('div', { className: 'dsk-page dsk-root' },
        h('h2', null, L('settingsTitle')),
        h('p', { className: 'dsk-page-sub' }, L('settingsSubtitle')),
        h('div', { className: 'dsk-section' },
          h('h3', { className: 'dsk-section-title' }, L('skins')),
          h('p', { className: 'dsk-section-hint' }, L('skinsHint')),
          skins),
        display,
        shape,
        preview,
        actions,
        shortcuts);
    }

    function SettingsIcon() {
      return h('svg', {
        viewBox: '0 0 24 24', width: 18, height: 18, fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.7, 'aria-hidden': true,
      },
        h('path', { d: 'M4 6l6 6-6 6' }),
        h('rect', { x: 13, y: 16, width: 7, height: 4, rx: 1, fill: 'currentColor', stroke: 'none' }));
    }

    function Statusline(props) {
      useModeState();
      const [, tick] = React.useState(0);
      React.useEffect(() => {
        const id = window.setInterval(() => tick((n) => n + 1), 1000);
        return () => window.clearInterval(id);
      }, []);
      if (state.skin === 'default') return null;
      const skin = SKIN_BY_ID[state.skin] || SKINS[0];
      const time = new Date().toLocaleTimeString(LANG === 'zh' ? 'zh-CN' : 'en-GB', { hour12: false });
      return h('div', { className: 'dsk-status dsk-root', role: 'status' },
        h('span', { className: 'dsk-status-left' },
          h('span', { className: 'dsk-status-prompt' }, '>'),
          h('span', { className: 'dsk-status-skin' }, LANG === 'zh' ? skin.zh : skin.en),
          h('span', { className: 'dsk-status-sep' }, '·'),
          h('span', null, state.brightness + '%'),
          h('span', { className: 'dsk-status-sep' }, '·'),
          h('span', null, time),
          h('span', { className: 'dsk-cursor', 'aria-hidden': true })),
        h('span', { className: 'dsk-status-right' },
          h('span', { className: 'dsk-status-hint' }, MOD + '+Alt+K ' + L('statusHint'))));
    }

    function HeroMark(props) {
      useModeState();
      if (state.skin === 'default') return null;
      const skin = SKIN_BY_ID[state.skin] || SKINS[0];
      const size = props && typeof props.size === 'number' && props.size > 0 ? props.size : 40;
      const className = 'dsk-hero dsk-root' + (props && props.className ? ' ' + props.className : '');
      return h('div', {
        className,
        style: { width: size, height: size, fontSize: Math.max(8, Math.round(size * 0.24)) },
        title: LANG === 'zh' ? skin.zh : skin.en,
        'aria-label': (LANG === 'zh' ? '终端模式：' : 'Terminal mode: ') + (LANG === 'zh' ? skin.zh : skin.en),
      }, h('span', { className: 'dsk-hero-tag' }, '>_'));
    }

    function SidebarButton(props) {
      useModeState();
      const wide = !!(props && props.wide);
      return h('button', {
        type: 'button',
        className: 'dsk-footer' + (wide ? ' dsk-footer-wide' : ''),
        title: L('footerHint') + ' — ' + MOD + '+Alt+K',
        'aria-label': L('footerButton'),
        onClick: () => togglePalette(),
      },
        h('span', { 'aria-hidden': true }, '>_'),
        wide ? h('span', { className: 'dsk-footer-label' }, L('footerButton')) : null);
    }

    function Palette() {
      useModeState();
      const [, force] = React.useState(0);
      React.useEffect(() => {
        const listener = () => force((n) => n + 1);
        paletteListeners.add(listener);
        return () => { paletteListeners.delete(listener); };
      }, []);
      const [query, setQuery] = React.useState('');
      const [selected, setSelected] = React.useState(0);
      const inputRef = React.useRef(null);
      const listRef = React.useRef(null);

      React.useEffect(() => {
        if (paletteOpen) {
          setQuery('');
          setSelected(0);
          window.setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
          }, 10);
        }
      }, [paletteOpen]);

      React.useEffect(() => {
        if (!paletteOpen) return undefined;
        const onEscape = (event) => {
          if (event.key !== 'Escape') return;
          event.preventDefault();
          event.stopPropagation();
          setPalette(false);
        };
        window.addEventListener('keydown', onEscape, true);
        return () => window.removeEventListener('keydown', onEscape, true);
      }, [paletteOpen]);

      const actions = React.useMemo(() => buildActions(), [state.skin, state.brightness, state.scan, state.mono, state.accent, state.font]);

      const filtered = actions.filter((action) => {
        if (!query.trim()) return true;
        const q = query.trim().toLowerCase();
        return (action.label + ' ' + (action.keywords || '')).toLowerCase().indexOf(q) !== -1;
      });

      React.useEffect(() => { setSelected(0); }, [query]);

      function run(action) {
        if (!action) return;
        setPalette(false);
        try { action.run(); } catch (_e) { /* action errors stay local */ }
      }

      function onKeyDown(event) {
        if (event.key === 'Escape') {
          event.preventDefault();
          setPalette(false);
          return;
        }
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSelected((index) => Math.min(index + 1, filtered.length - 1));
          return;
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSelected((index) => Math.max(index - 1, 0));
          return;
        }
        if (event.key === 'Enter') {
          event.preventDefault();
          run(filtered[selected]);
        }
      }

      React.useEffect(() => {
        if (!listRef.current) return;
        const node = listRef.current.querySelector('[data-sel="1"]');
        if (node && typeof node.scrollIntoView === 'function') {
          node.scrollIntoView({ block: 'nearest' });
        }
      }, [selected]);

      if (!paletteOpen) return h(React.Fragment, null, h('style', { key: 'style' }, CSS));

      let lastGroup = '';
      const rows = [];
      filtered.forEach((action, index) => {
        if (action.group !== lastGroup) {
          lastGroup = action.group;
          rows.push(h('div', { key: 'group-' + action.group, className: 'dsk-group' }, action.group));
        }
        rows.push(h('button', {
          key: action.id,
          type: 'button',
          className: 'dsk-item',
          'data-sel': index === selected ? '1' : '0',
          onMouseEnter: () => setSelected(index),
          onClick: () => run(action),
        },
          h('span', { className: 'dsk-item-label' }, action.label),
          action.mark ? h('span', { className: 'dsk-item-mark' }, action.mark) : null,
          action.key ? h('span', { className: 'dsk-kbd' }, action.key) : null));
      });

      return h(React.Fragment, null,
        h('style', { key: 'style' }, CSS),
        h('div', {
          key: 'overlay',
          className: 'dsk-overlay dsk-root',
          role: 'presentation',
          onMouseDown: (event) => {
            if (event.target === event.currentTarget) setPalette(false);
          },
        },
          h('div', { className: 'dsk-panel', role: 'dialog', 'aria-modal': true, 'aria-label': L('paletteTitle') },
            h('div', { className: 'dsk-panel-head' }, L('paletteTitle')),
            h('div', { className: 'dsk-panel-input-row' },
              h('span', { className: 'dsk-panel-caret', 'aria-hidden': true }, '>'),
              h('input', {
                ref: inputRef,
                className: 'dsk-panel-input',
                type: 'text',
                value: query,
                placeholder: L('palettePlaceholder'),
                'aria-label': L('palettePlaceholder'),
                onChange: (event) => setQuery(event.target.value),
                onKeyDown,
              })),
            h('div', { className: 'dsk-panel-list', ref: listRef },
              filtered.length ? rows : h('div', { className: 'dsk-empty' }, L('paletteEmpty'))),
            h('div', { className: 'dsk-panel-foot' },
              h('span', null, h('span', { className: 'dsk-kbd' }, '↑↓'), ' ', L('navigate')),
              h('span', null, h('span', { className: 'dsk-kbd' }, 'Enter'), ' ', L('run')),
              h('span', null, h('span', { className: 'dsk-kbd' }, 'Esc'), ' ', L('close'))))));
    }

    function buildActions() {
      const list = [];
      SKINS.forEach((skin, index) => {
        list.push({
          id: 'skin:' + skin.id,
          group: L('skinAction'),
          label: (LANG === 'zh' ? skin.zh : skin.en),
          mark: state.skin === skin.id ? L('active') : '',
          key: index === 0 ? MOD + '+Alt+0' : 'Alt+' + (index + 1),
          keywords: skin.id,
          run: () => setSkin(skin.id),
        });
      });
      list.push({
        id: 'brightness-up',
        group: L('displayAction'),
        label: L('brightnessUp'),
        key: MOD + '+Alt+B',
        keywords: 'brightness lighter',
        run: () => brightnessBy(5),
      });
      list.push({
        id: 'brightness-down',
        group: L('displayAction'),
        label: L('brightnessDown'),
        key: MOD + '+Alt+Shift+B',
        keywords: 'brightness darker',
        run: () => brightnessBy(-5),
      });
      list.push({
        id: 'brightness-reset',
        group: L('displayAction'),
        label: L('brightnessReset'),
        keywords: 'brightness reset',
        run: () => patchState({ brightness: 100 }),
      });
      list.push({
        id: 'cycle-skin',
        group: L('displayAction'),
        label: L('cycleSkin'),
        key: MOD + '+Alt+T',
        keywords: 'cycle next skin',
        run: () => cycleSkin(),
      });
      list.push({
        id: 'toggle-scan',
        group: L('togglesAction'),
        label: L('toggleScanlines'),
        keywords: 'scanlines crt',
        run: () => touchFx({ scan: !state.scan }),
      });
      list.push({
        id: 'toggle-mono',
        group: L('togglesAction'),
        label: L('toggleMono'),
        keywords: 'monospace font',
        run: () => patchState({ mono: !state.mono }),
      });
      list.push({
        id: 'reset-skin',
        group: L('togglesAction'),
        label: L('resetSkin'),
        keywords: 'default restore reset',
        run: () => restoreDefault(),
      });
      list.push({
        id: 'reset-all',
        group: L('togglesAction'),
        label: L('resetEverything'),
        keywords: 'reset all clear',
        run: () => resetAll(),
      });
      return list;
    }

    // ---------------------------------------------------------------------
    // Keyboard shortcuts
    //
    // Preferred path: the client shortcuts registry, so the bindings show up in
    // the app's shortcut reference and follow the platform's dispatch policy.
    // Fallback path: a capture-phase key listener, for builds where the
    // shortcuts service is not mounted. Only one path is ever installed.
    // ---------------------------------------------------------------------

    function expectedModifiers(modifiers) {
      const set = Object.create(null);
      (modifiers || []).forEach((name) => {
        if (name === 'primary') set[IS_MAC ? 'meta' : 'control'] = true;
        else set[name] = true;
      });
      return set;
    }

    function gestureMatches(gesture, binding) {
      if (!gesture || gesture.code !== binding.code) return false;
      const expected = expectedModifiers(binding.modifiers);
      const actual = {
        control: !!gesture.control,
        alt: !!gesture.alt,
        shift: !!gesture.shift,
        meta: !!gesture.meta,
      };
      // Some adapters expose the platform-resolved primary flag directly.
      if (typeof gesture.primary === 'boolean' && !binding.modifiers.includes('primary')) {
        actual.control = actual.control || (!IS_MAC && gesture.primary);
        actual.meta = actual.meta || (IS_MAC && gesture.primary);
      }
      return ['control', 'alt', 'shift', 'meta'].every((name) => actual[name] === !!expected[name]);
    }

    function shortcutRows() {
      const rows = [
        {
          id: 'terminal-mode.palette',
          binding: { code: 'KeyK', modifiers: ['primary', 'alt'] },
          label: () => L('paletteTitle'),
          run: togglePalette,
        },
        {
          id: 'terminal-mode.cycle-skin',
          binding: { code: 'KeyT', modifiers: ['primary', 'alt'] },
          label: () => L('cycleSkin'),
          run: cycleSkin,
        },
        {
          id: 'terminal-mode.default-skin',
          binding: { code: 'Digit0', modifiers: ['primary', 'alt'] },
          label: () => L('restore'),
          run: restoreDefault,
        },
        {
          id: 'terminal-mode.brightness-up',
          binding: { code: 'KeyB', modifiers: ['primary', 'alt'] },
          label: () => L('brightnessUp'),
          run: () => brightnessBy(5),
        },
        {
          id: 'terminal-mode.brightness-down',
          binding: { code: 'KeyB', modifiers: ['primary', 'alt', 'shift'] },
          label: () => L('brightnessDown'),
          run: () => brightnessBy(-5),
        },
      ];
      SKINS.forEach((skin, index) => {
        rows.push({
          id: 'terminal-mode.skin.' + skin.id,
          binding: { code: 'Digit' + (index + 1), modifiers: ['alt'] },
          label: () => (LANG === 'zh' ? skin.zh : skin.en),
          run: () => setSkin(skin.id),
        });
      });
      return rows;
    }

    function installServiceShortcuts(shortcuts) {
      const rows = shortcutRows();
      const disposers = [];
      let registered = 0;
      rows.forEach((row) => {
        try {
          const keys = shortcuts.describeBinding(row.binding).keys;
          const dispose = shortcuts.registerFixed({
            id: row.id,
            label: row.label,
            keys,
            bindings: [row.binding],
            group: 'application',
          });
          registered += 1;
          if (typeof dispose === 'function') disposers.push(dispose);
        } catch (_e) {
          // A single refused row must not disable the rest.
        }
      });
      let disposeObserve = null;
      try {
        disposeObserve = shortcuts.observeFixedInput((input) => {
          if (!input || input.type === 'reset') return;
          const gesture = input.gesture;
          if (!gesture || gesture.composing || gesture.defaultPrevented || gesture.repeat) return;
          const match = rows.find((row) => gestureMatches(gesture, row.binding));
          if (!match) return;
          if (typeof input.consume === 'function') input.consume();
          try { match.run(); } catch (_e) { /* action failures stay local */ }
        });
      } catch (_e) {
        disposeObserve = null;
      }
      if (typeof disposeObserve !== 'function' || registered === 0) {
        // Without rows or the observer this path is decorative at best; drop
        // it and let the DOM fallback handle the same keys.
        if (typeof disposeObserve === 'function') {
          try { disposeObserve(); } catch (_e) { /* ignore */ }
        }
        disposers.forEach((dispose) => { try { dispose(); } catch (_e) { /* ignore */ } });
        return null;
      }
      disposers.push(disposeObserve);
      return () => { disposers.forEach((dispose) => { try { dispose(); } catch (_e) { /* ignore */ } }); };
    }

    function installDomShortcuts() {
      const onKeyDown = (event) => {
        if (event.defaultPrevented || event.isComposing || event.repeat) return;
        const code = event.code || '';
        const mod = event.ctrlKey || event.metaKey;
        const alt = event.altKey;
        const shift = event.shiftKey;

        if (mod && alt && code === 'KeyK' && !shift) {
          event.preventDefault();
          event.stopPropagation();
          togglePalette();
          return;
        }
        if (mod && alt && code === 'KeyT' && !shift) {
          event.preventDefault();
          event.stopPropagation();
          cycleSkin();
          return;
        }
        if (mod && alt && !shift && (code === 'Digit0' || code === 'Backquote')) {
          event.preventDefault();
          event.stopPropagation();
          restoreDefault();
          return;
        }
        if (mod && alt && code === 'KeyB') {
          event.preventDefault();
          event.stopPropagation();
          brightnessBy(shift ? -5 : 5);
          return;
        }
        if (!mod && alt && !shift && /^Digit[1-8]$/.test(code)) {
          const index = Number(code.slice(5)) - 1;
          const skin = SKINS[index];
          if (skin) {
            event.preventDefault();
            event.stopPropagation();
            setSkin(skin.id);
          }
        }
      };
      window.addEventListener('keydown', onKeyDown, true);
      return () => window.removeEventListener('keydown', onKeyDown, true);
    }

    function installShortcuts(ctx) {
      let shortcuts;
      try { shortcuts = ctx.get('shortcuts'); } catch (_e) { shortcuts = undefined; }
      if (shortcuts) {
        let cleanup = null;
        try { cleanup = installServiceShortcuts(shortcuts); } catch (_e) { cleanup = null; }
        if (cleanup) return cleanup;
      }
      return installDomShortcuts();
    }

    // ---------------------------------------------------------------------
    // Engine
    // ---------------------------------------------------------------------

    const ctxRef = { get: () => undefined };
    let engineInstalled = false;

    function syncBaseMode() {
      const skin = SKIN_BY_ID[state.skin] || SKINS[0];
      if (!skin.pal) return;
      setBaseScheme(skin.scheme);
    }

    function installEngine(ctx) {
      if (engineInstalled) return;
      engineInstalled = true;
      ctxRef.get = (name) => {
        try { return ctx.get(name); } catch (_e) { return undefined; }
      };
      LANG = detectLang(ctx);
      applyNow();
    }

    // ---------------------------------------------------------------------
    // Plugin
    // ---------------------------------------------------------------------

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.effect(() => {
          installEngine(ctx);
          const disposeShortcuts = installShortcuts(ctx);
          // The theme runtime re-applies the base palette after a preference or
          // OS scheme change; re-assert this skin's mode afterwards.
          let disposeTheme = () => {};
          try {
            disposeTheme = ctx.on('theme/change', syncBaseMode) || (() => {});
          } catch (_e) { /* older builds without the event */ }
          return () => {
            try { disposeTheme(); } catch (_e) { /* ignore */ }
            try { disposeShortcuts(); } catch (_e) { /* ignore */ }
            setPalette(false);
            resetDom();
            engineInstalled = false;
            try { delete window.__dshTerminalMode; } catch (_e) { /* ignore */ }
          };
        }, 'terminal-mode engine');

        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'dsh-terminal-mode-palette',
          order: 900,
        }, Palette));

        ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section',
          id: 'terminal-mode',
          order: 900,
          label: () => L('settingsTitle'),
        }, TerminalSettingsPage));

        ctx.slots.inject('settings.section.icon', () => ctx.slots.register({
          name: 'settings.section.icon',
          id: 'terminal-mode',
          order: 900,
        }, SettingsIcon));

        ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
          name: 'sidebar.footer.action',
          id: 'terminal-mode',
          order: 900,
        }, SidebarButton));

        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
          name: 'conversation.composer.dock',
          id: 'terminal-mode-status',
          order: 900,
        }, Statusline));

        ctx.slots.inject('conversation.hero.brand.mark', () => ctx.slots.register({
          name: 'conversation.hero.brand.mark',
          id: 'terminal-mode-hero',
          order: 900,
        }, HeroMark));

        // Debug/automation handle: lets a user or a script switch skins from
        // the console without digging into localStorage.
        try {
          window.__dshTerminalMode = {
            getState: () => Object.assign({}, state),
            setSkin,
            cycleSkin,
            restoreDefault,
            reset: resetAll,
            openPalette: () => setPalette(true),
            closePalette: () => setPalette(false),
            skins: () => SKINS.map((skin) => skin.id),
          };
        } catch (_e) { /* non-browser host */ }
      },
    };
  },
});
