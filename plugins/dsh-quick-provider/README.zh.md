<div align="center">

<img src="icon.svg" alt="快速添加模型提供商图标" width="84" height="84">

# dsh-quick-provider

**只填四项——提供商 ID、显示名称、API 地址、API Key——就能给 DeepSeek Harness
接入任意 OpenAI 兼容模型平台，自动发现并注册其全部模型。**

<p>
  <a href="https://github.com/rorygpk/dsh-plugins/releases/latest"><img alt="release" src="https://img.shields.io/github/v/release/rorygpk/dsh-plugins?color=7ee787&label=release&style=for-the-badge"></a>
  <a href="LICENSE"><img alt="license" src="https://img.shields.io/github/license/rorygpk/dsh-plugins?color=88c0d0&style=for-the-badge"></a>
  <img alt="dependencies" src="https://img.shields.io/badge/dependencies-0-a3be8c?style=for-the-badge">
  <img alt="surface" src="https://img.shields.io/badge/host%20%2B%20web--ui-7aa2f7?style=for-the-badge">
</p>

[English](README.md) | **简体中文**

属于 [dsh-plugins](../../README.zh.md) 插件集合。

</div>

---

> [!NOTE]
> API Key 通过 Harness 的凭据存储保存，提供商配置里只写入环境变量名引用；
> 不会以明文写进 profile 的补丁文件。

## 它做什么

平时接入一个提供商要为每个模型手写配置块。这个插件把它变成一张四栏表单：

```text
Provider ID   apiyi
显示名称      API易
API 地址      https://api.apimyi.com/v1
API 密钥      <你的密钥>
```

它会请求 `GET {baseURL}/models`，映射平台上声明的每个模型，把密钥存成凭据记录，再把提供商
与模型列表写入 pi-ai 适配器的 `providers` 设置命名空间。

## 安装

插件位于 `dsh-plugins` 仓库的 `plugins/dsh-quick-provider`。

**从克隆仓库安装**——按绝对路径安装该目录：

```bash
git clone https://github.com/rorygpk/dsh-plugins
```

```text
plugin_manager install_bundle({ target: "<仓库路径>/plugins/dsh-quick-provider" })
```

**从发布包安装**——在 [Releases](https://github.com/rorygpk/dsh-plugins/releases) 页面下载
`dsh-quick-provider-<version>.zip`，解压到固定位置，再让 `install_bundle` 指向解压目录。

然后**刷新一次 Harness 窗口**，让浏览器半部加载。

## 使用

1. 打开 **设置 > 模型**，滑到最底部的
   **快速添加第三方模型 API** / “Quick provider”卡片。
2. 填写四项并提交；表单会报告发现了多少个模型、是否注册成功。
3. 在输入框的模型选择器里选择新出现的模型。

同一操作也以工具 `add_llm_provider` 暴露给 Agent，会话里一次调用即可：

```text
add_llm_provider({ provider: "apiyi", displayName: "API易",
                   baseURL: "https://api.apimyi.com/v1", apiKey: "<密钥>" })
```

## 工作原理

1. `llm.discoverModels()` 以 `openai-completions` 协议请求
   `GET {baseURL}/models`，映射 id、名称、输入模态、上下文窗口与最大 token。
2. `credentials.set()` 把密钥存到派生出的环境变量名下，例如 `APIYI_API_KEY`。
3. `settings.mutate("llm-pi-ai", ...)` 把 `providers.<id>` 写入 base URL、密钥引用
   与全部已发现模型。
4. Web 表单通过已认证的 `POST /api/quick-provider/add` 路由访问 Host，无需另起服务。

## 前提条件

- profile 中已挂载 `@deepseek-ai/dsh-llm-pi-ai` 适配器（Web profile 默认已挂载）。
- 平台支持 OpenAI 兼容的 `GET /models`（返回 JSON）。若不支持，模型发现会给出可读错误，
  且不会写入任何配置。

## 文件结构

| 文件 | 作用 |
|---|---|
| `index.js` | Host 端：模型发现、凭据存储、写入 pi-ai 配置、`add_llm_provider` 工具、`/api/quick-provider/add` 路由 |
| `client.js` | 设置 > 模型 页底部的表单卡片 |
| `cordis.patch.yml` | bundle 插件行声明 |
| `locale/en.json`、`locale/zh.json` | 插件管理器中显示的标题与描述 |
| `icon.svg` | 插件图标 |
| `scripts/pack.ps1` | 可移植 zip 打包脚本 |

## 开发

```bash
node --check index.js
node --check client.js
```

无构建步骤、无运行时依赖，bundle 就是一组文件。

## 许可证

MIT，见 [LICENSE](LICENSE)。

---

<div align="center">

[English](README.md) | **简体中文**

</div>
