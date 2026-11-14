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

## 安装

先克隆仓库，再按绝对路径安装需要的插件：

```bash
git clone https://github.com/rorygpk/dsh-plugins
```

在 DeepSeek Harness 会话中执行：

```text
plugin_manager install_bundle({ target: "<仓库路径>/plugins/dsh-terminal-mode" })
plugin_manager install_bundle({ target: "<仓库路径>/plugins/dsh-quick-provider" })
```

然后**刷新一次 Harness 窗口**（Ctrl+R，macOS 为 Cmd+R），以加载新的客户端 bundle。路径必须是包含
`package.json` 的插件目录，不是仓库根目录。

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
.github/workflows/          CI 校验 + 标签触发的发布
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
