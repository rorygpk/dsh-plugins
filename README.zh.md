<div align="center">

<img src="icon.svg" alt="终端模式图标" width="84" height="84">

# dsh-terminal-mode

**为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web GUI
提供终端皮肤、CRT 特效、命令面板与快捷键。只改变外观——未改动的默认皮肤始终一键可回。**

<p>
  <a href="https://github.com/rorygpk/dsh-plugins/releases/latest"><img alt="release" src="https://img.shields.io/github/v/release/rorygpk/dsh-plugins?color=7ee787&label=release&style=for-the-badge"></a>
  <a href="LICENSE"><img alt="license" src="https://img.shields.io/github/license/rorygpk/dsh-plugins?color=88c0d0&style=for-the-badge"></a>
  <img alt="dependencies" src="https://img.shields.io/badge/dependencies-0-a3be8c?style=for-the-badge">
  <img alt="build" src="https://img.shields.io/badge/build-none-ebcb8b?style=for-the-badge">
  <img alt="runtime" src="https://img.shields.io/badge/runtime-browser--only-bf616a?style=for-the-badge">
</p>

[English](README.md) | **简体中文**

</div>

---

> [!NOTE]
> 本插件只覆盖设计令牌、字体与视觉特效，并新增自己的 UI 插槽（设置页、命令面板、状态栏、Hero 标记）。不会修改会话、模型、工具、Harness 设置，也不会改变已有快捷键行为。

## 为什么做它

Harness 的网页界面安静、够用。终端模式让它更像你每天待着的那个终端：等宽字体、磷光配色、`>` 提示符、状态栏与命令面板，同时不丢掉任何 Harness 功能。

- **8 套皮肤**：从中性 Codex 终端到绿/琥珀 CRT，再到两套浅色主题；Default 是原始皮肤，也是还原目标。
- **真正的自由度**：亮度、背景色温、强调色、圆角、扫描线、文字辉光、等宽开关与自定义等宽字体族。
- **键盘优先**：命令面板、皮肤循环、亮度快捷键、按序号直选皮肤。
- **结构上安全**：令牌覆盖在未启用皮肤时完全惰性，“还原默认皮肤”会移除最后一处覆盖。
- **可移植**：纯文件、零依赖、无构建步骤、无需 Node.js、安装时不联网。

## 皮肤

共 8 张卡片，顺序如下。全新安装默认使用 **Codex 终端** 及其预设（圆角 4 px）；**默认** 就是未改动的 Harness 皮肤，也是“一键还原”的目标。

| # | 皮肤 | 明暗 | 背景 | 面板 | 强调色 | 特征 |
|---|---|---|---|---|---|---|
| 1 | **默认** | — | — | — | — | 未改动的 DeepSeek Harness 皮肤 |
| 2 | **Codex 终端** | 暗 | ![](https://img.shields.io/badge/0a0c0b-0a0c0b?style=flat-square) | ![](https://img.shields.io/badge/151a18-151a18?style=flat-square) | ![](https://img.shields.io/badge/7ee787-7ee787?style=flat-square) | 近黑终端底色，绿色提示符强调 |
| 3 | **磷光绿** | 暗 | ![](https://img.shields.io/badge/010603-010603?style=flat-square) | ![](https://img.shields.io/badge/061a10-061a10?style=flat-square) | ![](https://img.shields.io/badge/39ff88-39ff88?style=flat-square) | 绿色磷光 CRT，可叠加扫描线与辉光 |
| 4 | **琥珀 CRT** | 暗 | ![](https://img.shields.io/badge/0d0803-0d0803?style=flat-square) | ![](https://img.shields.io/badge/1b1207-1b1207?style=flat-square) | ![](https://img.shields.io/badge/ffb000-ffb000?style=flat-square) | 暖调琥珀磷光，适合夜间 |
| 5 | **东京夜色** | 暗 | ![](https://img.shields.io/badge/1a1b26-1a1b26?style=flat-square) | ![](https://img.shields.io/badge/24283b-24283b?style=flat-square) | ![](https://img.shields.io/badge/7aa2f7-7aa2f7?style=flat-square) | 深蓝夜色配色 |
| 6 | **北境** | 暗 | ![](https://img.shields.io/badge/2e3440-2e3440?style=flat-square) | ![](https://img.shields.io/badge/434c5e-434c5e?style=flat-square) | ![](https://img.shields.io/badge/88c0d0-88c0d0?style=flat-square) | 冷调蓝灰，低对比度，平静耐看 |
| 7 | **Solarized 浅色** | 亮 | ![](https://img.shields.io/badge/fdf6e3-fdf6e3?style=flat-square) | ![](https://img.shields.io/badge/eee8d5-eee8d5?style=flat-square) | ![](https://img.shields.io/badge/268bd2-268bd2?style=flat-square) | 暖纸底色，适合白天 |
| 8 | **纸白** | 亮 | ![](https://img.shields.io/badge/f7f7f4-f7f7f4?style=flat-square) | ![](https://img.shields.io/badge/ffffff-ffffff?style=flat-square) | ![](https://img.shields.io/badge/1f5f8b-1f5f8b?style=flat-square) | 干净浅色终端，米白纸面配墨色 |

## 安装

本地私有包（`"private": true`），通过绝对目录路径安装，不发布到 npm，不需要联网。

**最快路径**——安装目录后刷新一次 Harness 窗口：

```text
plugin_manager install_bundle({ target: "C:/Tools/dsh-terminal-mode" })
```

<details>
<summary><b>三种获取目录的方式</b></summary>

**一、发布压缩包**——从 [Releases](https://github.com/rorygpk/dsh-plugins/releases)
下载 `dsh-terminal-mode-<version>.zip`，解压到固定位置（例如
`C:\Tools\dsh-terminal-mode`），再执行上面的安装调用。路径必须是包含
`package.json` 的解压文件夹，不能是 zip 文件或它的上级目录。

**二、克隆仓库**——再按绝对路径安装该克隆目录：

```bash
git clone https://github.com/rorygpk/dsh-plugins
```

**三、自行构建压缩包**——Windows PowerShell 5.1+ 或 PowerShell 7+，无需 Node.js：

```powershell
powershell -ExecutionPolicy Bypass -File scripts\pack.ps1
```

会生成 `dist/dsh-terminal-mode-<version>.zip` 并打印 SHA-256。

</details>

安装或更新后，请**刷新一次 Harness 窗口**（Ctrl+R，macOS 为 Cmd+R），以加载新的客户端 bundle。升级、回滚与排障见 [docs/INSTALL.zh.md](docs/INSTALL.zh.md)。

## 使用

### 设置页

打开 **设置 > 终端模式**。

| 控件 | 范围 | 作用 |
|---|---|---|
| 皮肤卡片 | 8 套皮肤 | 选择外观；默认皮肤立即还原原始样式 |
| 亮度 | 60–140% | 整体提亮或压暗 |
| 背景色温 | −40 到 +40 | 调整底色的暖/冷倾向，不影响对比度 |
| 强调色 | 取色器 + 跟随皮肤 | 强调色、链接、焦点框、光标 |
| 界面使用等宽字体 / 字体族 | 开关 + 文本框 | 强制界面使用等宽字体；留空使用系统等宽字体栈 |
| 圆角 | 0–14 px | 从方正的终端角到圆角 |
| 扫描线 | 开关 + 强度 0–100% | CRT 扫描线叠加 |
| 文字辉光 | 0–100% | 文字上的柔和磷光辉光 |
| **还原默认皮肤** | 按钮 | 回到默认皮肤，并关闭扫描线与辉光 |
| **重置全部终端设置** | 按钮 | 回到首次安装预设：Codex 终端，圆角 4 px |

字号仍在 **设置 > 通用 > 外观** 中调整。

### 命令面板

按下 <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>K</kbd>（macOS 为
<kbd>Cmd</kbd>+<kbd>Alt</kbd>+<kbd>K</kbd>），或点击设置旁的 `>_` 按钮。输入以筛选，
<kbd>↑</kbd>/<kbd>↓</kbd> 移动，<kbd>Enter</kbd> 执行，<kbd>Esc</kbd> 关闭。

### 快捷键

| 快捷键 | 动作 |
|---|---|
| <kbd>Mod</kbd>+<kbd>Alt</kbd>+<kbd>K</kbd> | 打开命令面板 |
| <kbd>Mod</kbd>+<kbd>Alt</kbd>+<kbd>T</kbd> | 下一个皮肤（循环 8 套，最后回到默认） |
| <kbd>Mod</kbd>+<kbd>Alt</kbd>+<kbd>0</kbd> | 还原默认皮肤 |
| <kbd>Mod</kbd>+<kbd>Alt</kbd>+<kbd>B</kbd> | 亮度 +5% |
| <kbd>Mod</kbd>+<kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd> | 亮度 −5% |
| <kbd>Alt</kbd>+<kbd>1</kbd> … <kbd>Alt</kbd>+<kbd>8</kbd> | 按序号选皮肤：1 默认，2 Codex 终端，… 8 纸白 |
| <kbd>Mod</kbd>+<kbd>Alt</kbd>+<kbd>`</kbd> | 还原默认皮肤（兜底路径） |

`Mod` 在 Windows/Linux 上是 <kbd>Ctrl</kbd>，在 macOS 上是 <kbd>Cmd</kbd>。这些绑定通过
Harness 快捷键注册表登记（会出现在应用的快捷键参考中），并保留 DOM 兜底；若某个组合被浏览器或系统占用，
`>_` 按钮始终可以打开命令面板。

### 状态栏与 Hero 标记

每套非默认皮肤都会在输入框下方停靠一条状态栏：

```text
> Codex 终端 · 100% · 22:59:00                        Ctrl+Alt+K 命令面板
```

左侧：提示符、当前皮肤、亮度、实时时钟、闪烁光标。右侧：命令面板快捷键。空会话会在 Hero 位置显示一个
方形 `>_` 终端标记，悬停可看到当前皮肤名。还原默认皮肤后这些都会消失。

## 持久化与重置

外观设置**按浏览器**保存在 `localStorage` 的 `dsh.terminal-mode.v1` 键下。不会写入 Harness
配置或会话数据，因此每台机器保留各自的观感。

| 操作 | 结果 |
|---|---|
| **还原默认皮肤** | 切回默认皮肤并关闭扫描线/辉光；保留亮度、色温、强调色、圆角、等宽与字体选择，供下次选择主题皮肤时继续使用 |
| **重置全部终端设置** | 清除已保存状态，恢复首次安装预设（Codex 终端，圆角 4 px） |

可从设置页、<kbd>Mod</kbd>+<kbd>Alt</kbd>+<kbd>0</kbd> 或
<kbd>Alt</kbd>+<kbd>1</kbd> 还原。以上操作都不会影响会话、模型或任何其他 Harness 设置。

## 工作原理

未启用皮肤时完全惰性：插件在 `<html>` 上发布 `data-dsk` 属性，并把调色板映射到 Harness 的
`--dsw-alias-*` 设计令牌上；只有在此之后，它自己样式表里的令牌覆盖与特效才会生效。
“还原默认皮肤”会移除该属性与所有内联自定义属性，因此原始外观能精确恢复。

```text
client.js
├── SKINS[]             每套皮肤的调色板 + 特效预设
├── resolvePalette()    亮度 / 色温 / 强调色计算
├── applyNow()          html 属性 + --dsk-* 自定义属性
├── STYLESHEET          令牌映射、CRT 叠加、组件样式
├── SettingsPage        设置 > 终端模式
├── Palette             shell.overlay 命令面板
├── Statusline          conversation.composer.dock
├── HeroMark            conversation.hero.brand.mark
└── shortcuts           注册表路径 + DOM 兜底
```

## 开发

```bash
node test/selftest.mjs     # 50 项客户端半侧无头自测
node --check client.js     # 语法检查
```

只有运行测试需要 Node.js，安装和使用插件都不需要。CI 在每次推送时运行同样的检查；推送 `v*`
标签时，发布工作流会构建压缩包并附加到 Release。

## 仓库结构

```text
README.md / README.zh.md   本文档，英文与中文
docs/INSTALL*.md           跨机器部署指南
index.js                   惰性的 Host 半部
client.js                  皮肤、设置页、命令面板、状态栏、快捷键
locale/                    bundle 显示元数据（en、zh）
scripts/pack.ps1           生成可移植 zip 并打印 SHA-256
test/selftest.mjs          无头自测（仅仓库，不随包发布）
```

## 卸载

1. 先还原默认皮肤（可选，这样移除过程不可见）。
2. 用 `plugin_manager` 移除该 bundle，然后刷新页面。
3. 删除目录；如需彻底清理，可删除 `dsh.terminal-mode.v1` 这个 `localStorage` 键。

## 许可证

MIT，见 [LICENSE](LICENSE)。配色来源与致谢见 [NOTICE](NOTICE)。未复制或修改任何 Harness 代码。

---

<div align="center">

[English](README.md) | **简体中文** ·
[Releases](https://github.com/rorygpk/dsh-plugins/releases) ·
[安装指南](docs/INSTALL.zh.md)

</div>
