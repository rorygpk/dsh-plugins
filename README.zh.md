<div align="center">

# dsh-plugins

**一组小巧、自包含的 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
插件——每个都只是一个目录、一份清单，别无其他。**

<p>
  <a href="https://github.com/rorygpk/dsh-plugins/releases/latest"><img alt="release" src="https://img.shields.io/github/v/release/rorygpk/dsh-plugins?color=7ee787&label=release&style=for-the-badge"></a>
  <a href="LICENSE"><img alt="license" src="https://img.shields.io/github/license/rorygpk/dsh-plugins?color=88c0d0&style=for-the-badge"></a>
  <img alt="plugins" src="https://img.shields.io/badge/plugins-2-7aa2f7?style=for-the-badge">
  <img alt="build" src="https://img.shields.io/badge/build-none-ebcb8b?style=for-the-badge">
  <img alt="dsh" src="https://img.shields.io/badge/dsh-0.2.2--rc.1-bf616a?style=for-the-badge">
</p>

[English](README.md) | **简体中文**

</div>

---

> [!NOTE]
> 这里的每个条目都是本地 DSH bundle：无构建步骤、无运行时依赖、不发布到 npm。安装包含
> `package.json` 的那个目录，然后刷新一次 Harness 窗口即可。

## 插件列表

| 插件 | 作用 | 类型 | 版本 | 文档 |
|---|---|---|---|---|
| <img src="plugins/dsh-terminal-mode/icon.svg" alt="" width="26" height="26"> **[dsh-terminal-mode](plugins/dsh-terminal-mode/README.zh.md)** | 为网页界面提供 Codex 风格终端皮肤、CRT 特效、命令面板、状态栏与快捷键；只改外观，一键回到原始皮肤。 | ![](https://img.shields.io/badge/web--ui-skin-7ee787?style=flat-square) | `1.0.2` | [中文](plugins/dsh-terminal-mode/README.zh.md) · [English](plugins/dsh-terminal-mode/README.md) |
| <img src="plugins/dsh-quick-provider/icon.svg" alt="" width="26" height="26"> **[dsh-quick-provider](plugins/dsh-quick-provider/README.zh.md)** | 只填四项就接入任意 OpenAI 兼容模型提供商，自动发现并注册其全部模型。 | ![](https://img.shields.io/badge/host%20%2B%20web--ui-provider-7aa2f7?style=flat-square) | `1.0.0` | [中文](plugins/dsh-quick-provider/README.zh.md) · [English](plugins/dsh-quick-provider/README.md) |

## 两个插件，详细介绍

### dsh-terminal-mode —— Codex 风格终端

把 Harness 网页界面变成你每天待着的那个终端，同时不丢任何一个 Harness 功能。插件只使用应用
自己的设计令牌，并新增几个属于自己的 UI 位置；不替换任何组件。

**亮点**

- **8 套皮肤一键切换**：默认（未改动的 Harness 皮肤）、Codex 终端、磷光绿、琥珀 CRT、
  东京夜色、北境、Solarized 浅色、纸白。
- **实时调节**：亮度 60–140%、背景色温、强调色、圆角、扫描线强度、文字辉光、等宽开关与自定义
  等宽字体族。
- **真正的命令面板**（`Ctrl/Cmd+Alt+K`），外加下一个皮肤、还原、亮度、按序号直选
  （`Alt+1`…`Alt+8`）等快捷键。
- **终端细节**：输入框下方状态栏（提示符、皮肤、亮度、实时时钟、闪烁光标）；空会话的 `>_`
  Hero 方块；侧边栏 `>_` 按钮。
- **结构上安全**：未启用皮肤时令牌覆盖完全惰性，“还原默认皮肤”会移除最后一处覆盖——原始外观
  精确恢复。外观保存在本浏览器 `localStorage`，不写进 profile。

**工作方式**——`client.js` 在 `<html data-dsk>` 上注册 CSS 自定义属性，映射到应用的
`--dsw-alias-*` 令牌，并通过文档化插槽（`settings.section`、`shell.overlay`、
`conversation.composer.dock`、`conversation.hero.brand.mark`、`sidebar.footer.action`）
渲染命令面板、设置页、状态栏与 Hero 标记；快捷键走应用快捷键注册表，并保留 DOM 兜底。

**安装**

```text
plugin_manager install_bundle({ target: "<仓库路径>/plugins/dsh-terminal-mode" })
```

[中文说明](plugins/dsh-terminal-mode/README.zh.md) ·
[English guide](plugins/dsh-terminal-mode/README.md) ·
[安装指南](plugins/dsh-terminal-mode/docs/INSTALL.zh.md)

### dsh-quick-provider —— 四项输入接入任意提供商

平时接一个提供商，往往要为每个模型手写配置块。这个插件把它变成四项输入加一个按钮：
提供商 ID、显示名称、API 地址、API Key。

**亮点**

- **自动发现**：请求 `GET {baseURL}/models`，映射平台声明的每个模型（id、名称、输入模态、
  上下文窗口、最大 token）。
- **凭据安全**：API Key 走 Harness 的凭据通道，提供商配置里只保存环境变量引用。
- **两个入口**：**设置 > 模型** 页面底部的表单，以及 Agent 工具 `add_llm_provider`，
  会话里一次调用即可完成。
- **无需额外服务**：表单通过同一进程内已认证的 `POST /api/quick-provider/add` 路由访问 Host。
- **可回退**：在设置里移除提供商即可连带移除其模型；凭据记录可按需单独删除。

**工作方式**——`index.js` 负责模型发现、用 `credentials.set()` 保存密钥、再用
`settings.mutate("llm-pi-ai", …)` 写入提供商与模型列表，让现有的 pi-ai 适配器继续负责流式、
重试与目录解析；`client.js` 只是那张表单卡片。

**安装**

```text
plugin_manager install_bundle({ target: "<仓库路径>/plugins/dsh-quick-provider" })
```

[中文说明](plugins/dsh-quick-provider/README.zh.md) ·
[English guide](plugins/dsh-quick-provider/README.md)

## 如何装进你的 DSH

这些插件扩展的是 **[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)**——
把桌面或浏览器窗口变成真正的终端、并带上工具、会话与模型选择的 Agent 运行时。
已经在用 DSH？三条命令即可装好。还没装？先安装 DSH，这里的每个插件都只是一个“丢进去”的目录。

> [!TIP]
> 不需要 npm、不需要构建、安装时不联网。`install_bundle` 会把插件目录链接进你的
> profile，每个插件都自带设置页。

**1. 克隆本仓库**

```bash
git clone https://github.com/rorygpk/dsh-plugins
```

**2. 安装你需要的插件**——在任意 DSH 会话中执行：

```text
plugin_manager install_bundle({ target: "<仓库路径>/plugins/dsh-terminal-mode" })
plugin_manager install_bundle({ target: "<仓库路径>/plugins/dsh-quick-provider" })
```

**3. 刷新一次 Harness 窗口**（Ctrl+R，macOS 为 Cmd+R）。

**4. 在应用里找到它们**

| 位置 | 你会看到 |
|---|---|
| 设置 > 终端模式 | 皮肤卡片、亮度、扫描线、命令面板快捷键 |
| 设置 > 模型（页面底部卡片） | “快速添加第三方模型 API”：四项输入，自动发现全部模型 |
| 侧边栏 `>_` 按钮 / <kbd>Mod</kbd>+<kbd>Alt</kbd>+<kbd>K</kbd> | 终端命令面板 |

**卸载**——在插件管理器里移除 bundle、刷新页面、删除目录。终端模式外观仍留在本浏览器的
`localStorage` 中；提供商条目会留在 DSH profile 里，直到你手动移除。

每个插件也会以独立 zip 形式发布在 [Releases](https://github.com/rorygpk/dsh-plugins/releases)
页面；解压到任意固定位置后，把 `install_bundle` 指向解压目录即可。

## 兼容性

基于 DeepSeek Harness **0.2.2-rc.1** Web profile 构建并测试。一个插件就是一个带 `package.json`
的目录，其中声明：

- `dsh.bundle.patch` —— 插入插件行的 Cordis 补丁；
- `dsh.client` —— 可选的浏览器半部，由 Web 模块加载器加载；
- `locale/<lang>.json` —— 插件管理器中显示的标题与描述；
- `icon.svg` —— 应用内展示的插件图标。

## 仓库结构

```text
plugins/
├── dsh-terminal-mode/     Web UI 皮肤插件（仅浏览器）
│   ├── package.json       bundle 清单
│   ├── client.js          皮肤引擎、设置页、命令面板、状态栏
│   ├── docs/              安装指南（中/英）
│   ├── scripts/pack.ps1   可移植 zip 打包
│   └── test/selftest.mjs  无头自测
└── dsh-quick-provider/    模型提供商插件（Host + 浏览器）
    ├── package.json
    ├── index.js           模型发现、凭据存储、HTTP 路由
    └── client.js          设置页表单
scripts/pack-all.ps1       构建全部插件压缩包
scripts/check-links.mjs    CI 使用的文档检查
.github/workflows/         CI 校验 + 标签触发的发布
```

## 新增插件

插件目录自包含，CI 与发布工作流会自动发现它：

1. 新建 `plugins/<name>/`，放入 `package.json`、`cordis.patch.yml`、`index.js`
   （可以只导出空的 `apply()`）、可选的 `client.js`、`locale/en.json`、`locale/zh.json`
   与 `icon.svg`；
2. 添加 `scripts/pack.ps1`（可从 `dsh-terminal-mode` 复制）；
3. 补上 `README.md` 与 `README.zh.md`，并在上面的表格里加一行；
4. 打标签前先本地运行
   `powershell -ExecutionPolicy Bypass -File scripts\pack-all.ps1`。

## 路线图 —— 更多插件，公开构建

这个仓库只是开始：我们要把它做成 DeepSeek Harness 上一个可靠、社区共建的插件生态。插件格式
刻意保持“无聊”——一个目录、一份清单、一个补丁——这样难点只剩想法，而不是管道工程。

**已规划、公开讨论中的方向**

- **更多官方插件**：会话导出与分享、工作区 diff 审阅、可复用提示词库、按会话的模型预设。
- **插件索引**：一个可发现目录，按 DSH 版本列出兼容插件，并支持一步安装。
- **脚手架与生成器**：`create-dsh-plugin` 式的模板，让新插件从想法到可安装 bundle 只需几分钟。
- **更广的本地化**：不止中英文，由社区贡献与审阅。
- **CI 兼容矩阵**：每个插件都针对它声明支持的 DSH 版本线测试，升级不再有意外。

如果你也在为 DeepSeek Harness 构建东西，这就是给你的邀请：提 issue、提交插件、或者 fork 一套
皮肤。贡献会在这里署名——目标很简单：让 DSH 成为地球上最可折腾的 Agent 运行时，并给人值得安装
的插件。

## 发布

推送 `v*` 标签后，GitHub Actions 会构建每个插件的压缩包，并把所有 zip 附加到该标签的 Release
（`v1.0.0`、`v1.0.1`、`v1.0.2`……）。本地可用 `scripts/pack-all.ps1` 复现构建。

## 许可证

MIT，见 [LICENSE](LICENSE)。第三方配色灵感在各插件的 `NOTICE` 中致谢。未复制或修改任何
Harness 代码。

---

<div align="center">

[English](README.md) | **简体中文** ·
[Releases](https://github.com/rorygpk/dsh-plugins/releases)

</div>
