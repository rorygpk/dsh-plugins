window.__ModuleLoader__.load({
  id: '@local/dsh-quick-provider',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    // Google search-page palette; surfaces/text use host theme tokens.
    const G_BLUE = '#1a73e8';
    const G_BLUE_DARK = '#1765cc';
    const G_BLUE_LIGHT = '#4285F4';
    const G_RED = '#EA4335';
    const G_YELLOW = '#FBBC05';
    const G_GREEN = '#34A853';

    const CSS = [
      // flat white card, thin hairline, minimal shadow (chrome.google.cn style)
      '.dq-card{position:relative;border-radius:12px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);padding:24px;box-shadow:0 1px 2px rgba(60,64,67,.10),0 1px 3px rgba(60,64,67,.06);}',
      '.dq-head{display:flex;align-items:center;gap:9px;}',
      '.dq-mark{display:inline-flex;gap:2px;flex:none;}',
      '.dq-dot{width:7px;height:7px;border-radius:50%;display:inline-block;}',
      '.dq-d1{background:' + G_BLUE_LIGHT + ';}',
      '.dq-d2{background:' + G_RED + ';}',
      '.dq-d3{background:' + G_YELLOW + ';}',
      '.dq-d4{background:' + G_GREEN + ';}',
      '.dq-title{font-size:15px;font-weight:600;color:var(--dsw-alias-label-primary);}',
      '.dq-subtitle{margin-top:5px;font-size:12px;line-height:1.55;color:var(--dsw-alias-label-secondary);}',
      // static four-color rule under the header
      '.dq-rule{height:2px;margin-top:14px;border-radius:2px;background:linear-gradient(90deg,' + G_BLUE_LIGHT + ',' + G_RED + ',' + G_YELLOW + ',' + G_GREEN + ');opacity:.9;}',
      // form
      '.dq-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 14px;}',
      '.dq-field{display:block;margin-top:14px;min-width:0;}',
      '.dq-field-full{grid-column:1 / -1;}',
      '.dq-label{display:block;font-size:13px;font-weight:500;color:var(--dsw-alias-label-primary);margin-bottom:6px;}',
      '.dq-input{width:100%;box-sizing:border-box;height:40px;padding:0 12px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:14px;outline:none;transition:border-color .15s ease,box-shadow .15s ease;}',
      '.dq-input:hover{border-color:var(--dsw-alias-border-l2);}',
      '.dq-input:focus{border-color:' + G_BLUE + ';box-shadow:0 0 0 2px rgba(26,115,232,.18);}',
      '.dq-input::placeholder{color:var(--dsw-alias-label-secondary);}',
      // actions
      '.dq-actions{display:flex;align-items:center;gap:12px;margin-top:18px;}',
      '.dq-btn{height:40px;padding:0 20px;border-radius:8px;border:none;cursor:pointer;font-size:14px;font-weight:500;color:#fff;background:' + G_BLUE + ';transition:background .15s ease,box-shadow .15s ease;}',
      '.dq-btn:hover:not(:disabled){background:' + G_BLUE_DARK + ';box-shadow:0 1px 3px rgba(60,64,67,.3);}',
      '.dq-btn:active:not(:disabled){background:#1557b0;}',
      '.dq-btn:disabled{background:rgba(60,64,67,.22);color:rgba(255,255,255,.9);cursor:not-allowed;}',
      '.dq-spin{display:inline-block;width:13px;height:13px;margin-right:8px;border:2px solid rgba(255,255,255,.85);border-top-color:transparent;border-radius:50%;vertical-align:-2px;animation:dq-spin .7s linear infinite;}',
      // messages
      '.dq-msg{margin-top:14px;font-size:12px;line-height:1.6;}',
      '.dq-err{color:' + G_RED + ';}',
      '.dq-ok{color:var(--dsw-alias-label-primary);}',
      '.dq-ok strong{color:' + G_GREEN + ';}',
      '.dq-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;}',
      '.dq-chip{font-size:11px;padding:3px 9px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-base);}',
      '@keyframes dq-spin{to{transform:rotate(360deg);}}',
    ].join('');

    function QuickProviderForm() {
      const [provider, setProvider] = React.useState('');
      const [displayName, setDisplayName] = React.useState('');
      const [baseURL, setBaseURL] = React.useState('');
      const [apiKey, setApiKey] = React.useState('');
      const [busy, setBusy] = React.useState(false);
      const [result, setResult] = React.useState(null);
      const [error, setError] = React.useState(null);

      async function submit() {
        setBusy(true);
        setResult(null);
        setError(null);
        try {
          const res = await fetch('/api/quick-provider/add', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ provider, displayName, baseURL, apiKey }),
          });
          const text = await res.text();
          let data = null;
          try { data = text ? JSON.parse(text) : null; } catch (_e) { data = null; }
          if (data && data.ok) {
            setResult(data.result);
            setProvider('');
            setDisplayName('');
            setBaseURL('');
            setApiKey('');
          } else {
            setError((data && data.error) || ('HTTP ' + res.status + (text ? ' — ' + text.slice(0, 300) : '')));
          }
        } catch (err) {
          setError(err && err.message ? err.message : String(err));
        } finally {
          setBusy(false);
        }
      }

      function field(label, value, onChange, placeholder, type, full) {
        return h('label', { className: 'dq-field' + (full ? ' dq-field-full' : '') },
          h('span', { className: 'dq-label' }, label),
          h('input', {
            className: 'dq-input',
            type: type || 'text',
            value,
            placeholder,
            onChange: (e) => onChange(e.target.value),
          }));
      }

      return h('div', null,
        h('style', null, CSS),
        h('div', { className: 'dq-card' },
          h('div', { className: 'dq-head' },
            h('span', { className: 'dq-mark' },
              h('span', { className: 'dq-dot dq-d1' }),
              h('span', { className: 'dq-dot dq-d2' }),
              h('span', { className: 'dq-dot dq-d3' }),
              h('span', { className: 'dq-dot dq-d4' })),
            h('span', { className: 'dq-title' }, '第三方自定义 API')),
          h('div', { className: 'dq-subtitle' },
            '只填 4 项即可自动发现并添加全部模型。'),
          h('div', { className: 'dq-rule', 'aria-hidden': true }),
          h('div', { className: 'dq-grid' },
            field('Provider ID', provider, setProvider, 'apikey'),
            field('显示名称', displayName, setDisplayName, 'API易'),
            field('API 地址', baseURL, setBaseURL, 'https://api.apimyi.com/v1', 'text', true),
            field('API 密钥', apiKey, setApiKey, '输入 API 密钥', 'password', true)),
          h('div', { className: 'dq-actions' },
            h('button', {
              className: 'dq-btn',
              onClick: submit,
              disabled: busy || !provider || !baseURL || !apiKey,
            }, busy ? h('span', null, h('span', { className: 'dq-spin' }), '处理中…') : '自动发现并添加全部模型')),
          error ? h('div', { className: 'dq-msg dq-err' }, error) : null,
          result ? h('div', { className: 'dq-msg dq-ok' },
            h('strong', null, '已添加“' + result.provider + '”'),
            '，共 ' + result.models.length + ' 个模型：',
            h('div', { className: 'dq-chips' },
              result.models.map((m) => h('span', { key: m.id, className: 'dq-chip' }, m.id)))) : null));
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('settings.models.footer', () => ctx.slots.register({
          name: 'settings.models.footer',
          id: 'quick-provider',
          order: 100,
        }, QuickProviderForm));
      },
    };
  },
});
