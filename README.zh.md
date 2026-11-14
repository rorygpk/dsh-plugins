<div align="center">

# dsh-plugins

**为 DeepSeek Harness 编写的插件。每个插件都是一个普通目录：无需构建、没有运行时依赖，
也不需要在应用之外运行任何东西。**

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
> 安装以目录为单位。把 `install_bundle` 指向插件目录，然后刷新一次 Harness 窗口。

## 插件

| 插件 | 用途 | 类型 | 版本 | 文档 |
|---|---|---|---|---|
| <img src="plugins/dsh-terminal-mode/icon.svg" alt="" width="26" height="26"> **[dsh-terminal-mode](plugins/dsh-terminal-mode/README.zh.md)** | 网页界面的终端外观：八套配色、CRT 特效、命令面板与状态栏。只改变外观，且完全可回退。 | ![](https://img.shields.io/badge/web--ui-skin-7ee787?style=flat-square) | `1.0.2` | [中文](plugins/dsh-terminal-mode/README.zh.md) · [English](plugins/dsh-terminal-mode/README.md) |
| <img src="plugins/dsh-quick-provider/icon.svg" alt="" width="26" height="26"> **[dsh-quick-provider](plugins/dsh-quick-provider/README.zh.md)** | 用四项输入添加一个 OpenAI 兼容模型提供商，并注册该端点声明的全部模型。 | ![](https://img.shields.io/badge/host%20%2B%20web--ui-provider-7aa2f7?style=flat-square) | `1.0.0` | [中文](plugins/dsh-quick-provider/README.zh.md) · [English](plugins/dsh-quick-provider/README.md) |

## dsh-terminal-mode

Harness 网页界面的皮肤。它只改变外观：配色、字体、间距与特效。所有设置都可以撤销，
“还原默认皮肤”会把界面恢复到初始状态。

- 八套配色：默认、Codex 终端、磷光绿、琥珀 CRT、东京夜色、北境、Solarized 浅色、纸白。
- 可调亮度、背景色温、强调色、圆角、扫描线强度、文字辉光，以及等宽字体开关。
- 命令面板（`Ctrl/Cmd+Alt+K`）、切换与还原快捷键、输入框下方状态栏，以及空会话的 `>_` 标记。
- 外观保存在浏览器的 `localStorage` 中，不写入 Harness profile。

实现方式是把 `<html data-dsk>` 上的 CSS 自定义属性映射到应用的 `--dsw-alias-*` 设计令牌；
新增界面全部通过公开插槽渲染，不替换任何组件。

```text
plugin_manager install_bundle({ target: "<仓库路径>/plugins/dsh-terminal-mode" })
```

## dsh-quick-provider

用四项输入添加一个 OpenAI 兼容提供商：提供商 ID、显示名称、API 地址、API Key。

- 请求 `GET /models`，注册该端点声明的每个模型。
- 通过凭据通道保存密钥；提供商配置里只保留环境变量引用。
- 既可以在 **设置 > 模型** 的表单中操作，也可以由会话调用 `add_llm_provider` 工具完成。

`index.js` 负责模型发现、保存凭据，并把提供商写入 `llm-pi-ai` 设置命名空间，流式、重试与
目录解析仍由既有适配器承担；`client.js` 只渲染表单。

```text
plugin_manager install_bundle({ target: "<仓库路径>/plugins/dsh-quick-provider" })
```

## 安装到你的 DSH

DeepSeek Harness 是这些插件所扩展的 Agent 运行时。如果尚未安装，请先安装，然后：

1. 克隆仓库。

   ```bash
   git clone https://github.com/rorygpk/dsh-plugins
   ```

2. 在 DSH 会话中安装插件目录。

   ```text
   plugin_manager install_bundle({ target: "<仓库路径>/plugins/dsh-terminal-mode" })
   plugin_manager install_bundle({ target: "<仓库路径>/plugins/dsh-quick-provider" })
   ```

3. 刷新一次 Harness 窗口，让客户端 bundle 生效。

| 位置 | 内容 |
|---|---|
| 设置 > 终端模式 | 皮肤卡片、亮度、扫描线、命令面板快捷键 |
| 设置 > 模型（页面上部下方） | 快速添加提供商表单 |
| 侧边栏 `>_` 按钮，或 <kbd>Mod</kbd>+<kbd>Alt</kbd>+<kbd>K</kbd> | 命令面板 |

卸载时，在插件管理器中移除 bundle，刷新页面并删除目录。终端模式的外观偏好仍留在浏览器中；
提供商条目会保留在 profile 里，直到手动移除。

每个插件也会以独立 zip 附在对应的 Release 上。解压到固定位置后，把 `install_bundle`
指向解压目录即可。

## 兼容性

基于 DeepSeek Harness **0.2.2-rc.1**（Web profile）构建并测试。插件是一个目录，其
`package.json` 声明：

- `dsh.bundle.patch`：插入插件行的 Cordis 补丁；
- `dsh.client`：可选的浏览器半部，由 Web 模块加载器加载；
- `locale/<lang>.json`：插件管理器中显示的标题与描述；
- `icon.svg`：应用内展示的图标。

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
.github/workflows/         CI 校验与标签触发的发布
```

## 新增插件

每个插件目录自成一体，CI 与发布工作流会自动发现：

1. 新建 `plugins/<name>/`，放入 `package.json`、`cordis.patch.yml`、`index.js`
   （空的 `apply()` 即可）、可选的 `client.js`、`locale/en.json`、`locale/zh.json`
   与 `icon.svg`。
2. 添加 `scripts/pack.ps1`，可从 `dsh-terminal-mode` 复制。
3. 补上 `README.md`、`README.zh.md`，并在上表增加一行。
4. 打标签前运行 `powershell -ExecutionPolicy Bypass -File scripts\pack-all.ps1`。

## 方向

目前有两个插件。下一步做什么，同样由日常使用中缺少什么来决定。

- 正在考虑的插件：会话导出、工作区 diff 审阅、提示词库、按会话的模型预设。
- 一个按 DSH 版本列出兼容构建的插件索引。
- 一套起始模板，让新插件从一个可用的 bundle 开始。
- 更多界面语言。
- 针对各插件所声明 DSH 版本线的 CI 覆盖。

欢迎 issue 与 pull request。标准不高，但不会改变：插件应当值得安装。

## 发布

推送 `v*` 标签后，GitHub Actions 会构建每个插件的压缩包，并把 zip 附加到该标签的 Release。
本地可用 `scripts/pack-all.ps1` 复现构建。

## 许可证

MIT，见 [LICENSE](LICENSE)。第三方配色灵感在各插件的 `NOTICE` 中致谢。未复制或修改任何
Harness 代码。

---

<div align="center">

[English](README.md) | **简体中文** ·
[Releases](https://github.com/rorygpk/dsh-plugins/releases)

</div>
