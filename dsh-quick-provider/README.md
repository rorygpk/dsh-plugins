# dsh-quick-provider

一个 DeepSeek Harness 极简插件：只需输入 **Provider ID、显示名称、API 地址、API Key** 四项，自动发现并添加该第三方 OpenAI 兼容平台的全部模型。

> 界面采用 Google 四色（蓝 `#4285F4` / 红 `#EA4335` / 黄 `#FBBC05` / 绿 `#34A853`）为主视觉，带分层动效（顶部流光条、漂浮光晕、按钮扫光），并自适应亮/暗主题。

## 安装

### 方式一：从 GitHub 安装（推荐）

在 DeepSeek Harness 的 Agent 会话里让它执行：

```text
用 plugin_manager 的 install_bundle，target 填 git+https://github.com/rorygpk/dsh-plugins.git
```

### 方式二：本地目录安装

把本仓库克隆/下载到本地后，在 DSH 里执行：

```text
plugin_manager install_bundle({ target: "<克隆后的绝对路径>" })
```

安装成功后插件会自动启用并热加载。

## 使用

1. **刷新页面**（首次安装后需要）
2. 进入 **设置 → 模型**，滑到页面底部，使用「快速添加第三方模型 API」卡片
3. 填写 4 项后点「自动发现并添加全部模型」

也可以直接让 Agent 调用工具 `add_llm_provider`（参数同上）。

## 工作原理

1. 以 `openai-completions` 协议请求 `GET {baseURL}/models`，自动发现全部模型
2. 把 API Key 存入 DSH 凭据存储（不会以明文写入配置文件）
3. 通过 Settings 服务把 provider 与全部模型写入内置的 `@deepseek-ai/dsh-llm-pi-ai` 适配器

## 前提条件

- DSH 自带 `@deepseek-ai/dsh-llm-pi-ai` 适配器（默认已在 Web 配置中挂载）
- 平台需支持 OpenAI 兼容的 `GET /models`（返回 JSON）；若不支持，模型发现会返回明确错误

## 文件结构

| 文件 | 作用 |
|---|---|
| `index.js` | Host 端：模型发现、凭据存储、写入 pi-ai 配置、注册 `add_llm_provider` 工具与 `/api/quick-provider/add` 路由 |
| `client.js` | 设置页底部表单（Google 四色动效卡片） |
| `cordis.patch.yml` | 插件行声明（bundle patch） |
| `locale/en.json`、`locale/zh.json` | 插件标题与描述 |
| `icon.svg` | 插件图标 |

## License

MIT
