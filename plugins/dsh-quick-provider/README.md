<div align="center">

<img src="icon.svg" alt="Quick provider icon" width="84" height="84">

# dsh-quick-provider

**Add any OpenAI-compatible model provider to DeepSeek Harness with four fields:
provider id, display name, base URL and API key. Every advertised model is
discovered and registered automatically.**

<p>
  <a href="https://github.com/rorygpk/dsh-plugins/releases/latest"><img alt="release" src="https://img.shields.io/github/v/release/rorygpk/dsh-plugins?color=7ee787&label=release&style=for-the-badge"></a>
  <a href="LICENSE"><img alt="license" src="https://img.shields.io/github/license/rorygpk/dsh-plugins?color=88c0d0&style=for-the-badge"></a>
  <img alt="dependencies" src="https://img.shields.io/badge/dependencies-0-a3be8c?style=for-the-badge">
  <img alt="surface" src="https://img.shields.io/badge/host%20%2B%20web--ui-7aa2f7?style=for-the-badge">
</p>

**English** | [简体中文](README.zh.md)

Part of the [dsh-plugins](../../README.md) collection.

</div>

---

> [!NOTE]
> The API key is stored through the Harness credential seam and referenced by an
> environment-variable name in the provider config. It is never written to the
> profile patch file in plain text.

## What it does

A provider normally needs a hand-written config block per model. This plugin
turns that into a four-field form:

```text
Provider ID   apiyi
Display name  API易
Base URL      https://api.apimyi.com/v1
API key       <your key>
```

It calls `GET {baseURL}/models`, maps every advertised model, stores the key as a
credential record, and writes the provider plus its model list into the pi-ai
adapter's `providers` settings namespace.

## Install

The plugin lives in the `dsh-plugins` repository at `plugins/dsh-quick-provider`.

**From a clone** — install that directory by absolute path:

```bash
git clone https://github.com/rorygpk/dsh-plugins
```

```text
plugin_manager install_bundle({ target: "<repo>/plugins/dsh-quick-provider" })
```

**From a release** — download `dsh-quick-provider-<version>.zip` from the
[Releases](https://github.com/rorygpk/dsh-plugins/releases) page, extract it to a
permanent folder, and point `install_bundle` at the extracted folder.

Then **refresh the Harness window once** so the client half loads.

## Use

1. Open **Settings > Models** and scroll to the bottom card,
   **Quick provider** / “快速添加第三方模型 API”.
2. Fill in the four fields and submit; the form reports how many models were
   discovered and registered.
3. Pick one of the new models in the composer's model selector.

The same operation is exposed to the agent as the tool `add_llm_provider`, so a
session can do it in one call:

```text
add_llm_provider({ provider: "apiyi", displayName: "API易",
                   baseURL: "https://api.apimyi.com/v1", apiKey: "<key>" })
```

## How it works

1. `llm.discoverModels()` calls `GET {baseURL}/models` with the
   `openai-completions` API shape and maps id, name, input modalities, context
   window and max tokens.
2. `credentials.set()` stores the key under a derived env name such as
   `APIYI_API_KEY`.
3. `settings.mutate("llm-pi-ai", ...)` writes `providers.<id>` with the base URL,
   the key reference and every discovered model.
4. The Web form reaches the host through the authenticated
   `POST /api/quick-provider/add` fetch route — no extra server is needed.

## Requirements

- The `@deepseek-ai/dsh-llm-pi-ai` adapter is mounted in the profile (default in
  the Web profile).
- The platform answers an OpenAI-compatible `GET /models` with JSON. If it does
  not, discovery fails with a readable error and nothing is written.

## Files

| File | Role |
|---|---|
| `index.js` | Host half: discovery, credential storage, pi-ai config write, `add_llm_provider` tool, `/api/quick-provider/add` route |
| `client.js` | Settings > Models form card |
| `cordis.patch.yml` | Bundle row |
| `locale/en.json`, `locale/zh.json` | Plugin manager title and description |
| `icon.svg` | Plugin icon |
| `scripts/pack.ps1` | Portable zip builder |

## Development

```bash
node --check index.js
node --check client.js
```

No build step, no runtime dependency; the bundle is plain files.

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">

**[English](README.md)** | [简体中文](README.zh.md)

</div>
