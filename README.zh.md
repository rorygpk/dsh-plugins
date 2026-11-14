# dsh-terminal-mode

为 DeepSeek Harness Web GUI 提供终端模式：终端皮肤、CRT 特效、命令面板、状态栏与快捷键，同时始终可以一键回到未改动的默认皮肤。

本插件只改变外观，不会修改任何 Harness 功能、会话、模型、工具或设置。无依赖、无构建步骤，也不需要 Node.js。

## 预览

截图尚未随包提供。拍摄后请放入 `docs/media/`，并在此处引用：

```text
docs/media/terminal-mode-codex.png
docs/media/terminal-mode-phosphor.png
docs/media/terminal-mode-settings.png
```

## 皮肤

共 8 张卡片，顺序如下。第一张是原始皮肤，同时就是还原入口。全新安装默认使用 Codex 终端及其预设（圆角 4 px）；未改动的 Harness 皮肤就是“默认”卡片，随时一键可回。

| # | 卡片 | ID | 外观 |
|---|---|---|---|
| 1 | 默认 | `default` | 未改动的 DeepSeek Harness 皮肤 |
| 2 | Codex 终端 | `codex` | 近黑终端底色，绿色提示符强调色 |
| 3 | 磷光绿 | `phosphor` | 绿色磷光 CRT，可叠加扫描线与辉光 |
| 4 | 琥珀 CRT | `amber` | 暖调琥珀磷光，适合夜间 |
| 5 | 东京夜色 | `tokyonight` | 深蓝夜色配色 |
| 6 | 北境 | `nord` | 冷调蓝灰，低对比度 |
| 7 | Solarized 浅色 | `solarized` | 暖纸底色，适合白天 |
| 8 | 纸白 | `paper` | 干净浅色终端，米白纸面配墨色 |

## 安装

本包是本地私有包（`"private": true`），通过绝对目录路径安装；不会发布到 npm，也不需要联网。

### 方式一：使用发布压缩包（另一台机器）

1. 解压 `dsh-terminal-mode-1.0.1.zip` 到固定位置，例如 `C:\Tools\dsh-terminal-mode`。
2. 在 DeepSeek Harness 会话中按绝对路径安装：

```text
plugin_manager install_bundle({ target: "C:/Tools/dsh-terminal-mode" })
```

3. 刷新一次 Harness 窗口以加载新的客户端 bundle（Ctrl+R，macOS 为 Cmd+R）。

路径必须是包含 `package.json` 的解压文件夹，不能是 zip 文件或它的上级目录。正斜杠在各平台均可用；在引号字符串内使用 Windows 反斜杠时需写成双反斜杠。

### 方式二：链接本地工作目录

```text
plugin_manager install_bundle({ target: "C:/Users/me/src/dsh-terminal-mode" })
```

插件从该链接目录加载。修改文件后重新执行命令，并刷新一次 Harness 窗口以加载新的客户端 bundle；移动该目录后需重新安装。

### 方式三：自行生成发布压缩包

需要 Windows PowerShell 5.1+ 或 PowerShell 7+，不需要 Node.js：

```powershell
powershell -ExecutionPolicy Bypass -File scripts\pack.ps1
```

生成 `dist/dsh-terminal-mode-1.0.1.zip` 并打印 SHA-256。缺少运行时文件会中止构建；缺少可选文档只给出警告。生成后按方式一安装。

### 方式四：从 GitHub 获取

```bash
git clone https://github.com/rorygpk/dsh-plugins
```

按方式二用克隆目录的绝对路径安装即可。预构建的压缩包在
[Releases](https://github.com/rorygpk/dsh-plugins/releases) 页面：推送 `v*` 标签后由
GitHub Actions 自动构建 zip 并附加到 Release。

## 使用

### 设置页

打开 **设置 > 终端模式**。页面副标题为：“皮肤与特效仅保存在本机浏览器，功能不受影响。”

| 控件 | 范围 | 作用 |
|---|---|---|
| 皮肤卡片 | 8 套皮肤 | 选择外观；默认皮肤立即还原原始样式 |
| 亮度 | 60-140% | 整体提亮或压暗 |
| 背景色温 | -40 到 +40 | 调整界面底色的暖/冷倾向，不影响对比度 |
| 强调色 | 取色器 + 跟随皮肤 | 强调色、链接、焦点框、光标 |
| 界面使用等宽字体 | 开关 | 强制界面使用等宽字体 |
| 等宽字体族 | 文本框 | 本机已安装的字体名；留空使用系统等宽字体栈 |
| 圆角 | 0-14 px | 从方正终端角到圆角 |
| 扫描线 | 开关 + 强度 0-100% | CRT 扫描线叠层 |
| 文字辉光 | 0-100% | 终端文字柔光 |
| 还原默认皮肤 | 按钮 | 回到默认皮肤，并关闭扫描线与辉光 |
| 重置全部终端设置 | 按钮 | 恢复到首次安装预设：Codex 终端，圆角 4 px |

字号不在此重复提供，请继续使用 设置 > 通用 > 外观。

### 命令面板

按 **Mod+Alt+K**，或使用侧边栏底部的 `>_` 按钮。面板支持筛选并执行：应用任意皮肤、亮度 +5/-5/重置、下一个皮肤、切换扫描线、切换等宽字体、还原默认皮肤、重置全部设置。方向键移动，Enter 执行，Esc 关闭。`Mod` 在 Windows 和 Linux 上是 Ctrl，在 macOS 上是 Cmd。

### 快捷键

| 快捷键 | 操作 |
|---|---|
| Mod+Alt+K | 打开命令面板 |
| Mod+Alt+T | 下一个皮肤（依次循环 8 套，纸白之后回到默认） |
| Mod+Alt+0 | 还原默认皮肤 |
| Mod+Alt+B | 亮度 +5% |
| Mod+Alt+Shift+B | 亮度 -5% |
| Alt+1 | 默认 |
| Alt+2 | Codex 终端 |
| Alt+3 | 磷光绿 |
| Alt+4 | 琥珀 CRT |
| Alt+5 | 东京夜色 |
| Alt+6 | 北境 |
| Alt+7 | Solarized 浅色 |
| Alt+8 | 纸白 |

在回退快捷键路径下，同时按下修饰键与反引号键同样可还原默认皮肤。浏览器或桌面环境可能占用部分组合键；若快捷键无响应，请使用侧边栏底部按钮打开命令面板。

### 状态栏与标记

除默认皮肤外，输入框下方会显示状态栏，例如：

```text
> Codex 终端 · 100% · 22:59:00                        Ctrl+Alt+K 命令面板
```

左侧是提示符、当前皮肤、亮度与实时时钟，并带闪烁光标；右侧是命令面板快捷键。空会话的主视觉区显示一个方形 `>_` 终端徽标作为品牌标记，悬停可查看当前皮肤名。消息与输入框继承终端配色和等宽字体。还原默认皮肤后这些元素全部消失。

## 持久化与重置

外观设置按浏览器保存在 `localStorage` 的 `dsh.terminal-mode.v1` 键下。不会写入 Harness 配置或会话数据，因此每台机器保留各自的观感；浏览器没有已保存状态时，从首次安装预设（Codex 终端）开始。

- **还原默认皮肤**：切回默认皮肤并关闭扫描线与辉光，但保留亮度、色温、强调色、圆角、等宽字体等显示偏好，供下次选择主题皮肤时继续使用。
- **重置全部终端设置**：清除已保存状态，恢复首次安装预设（Codex 终端，圆角 4 px），不会恢复未改动的 Harness 皮肤；如需原始外观请使用“还原默认皮肤”。

可从设置页、Mod+Alt+0 或 Alt+1 还原。以上操作都不会影响会话、模型或任何其他 Harness 设置。

## 卸载

1. 先还原默认皮肤（可选，但这样移除过程不可见）。
2. 用 `plugin_manager` 移除该 bundle，然后刷新页面。
3. 删除目录；如需彻底清理，可删除 `dsh.terminal-mode.v1` 这个 `localStorage` 键。

## 文件结构

运行时文件：`package.json`、`cordis.patch.yml`、`index.js`、`client.js`、`locale/en.json`、`locale/zh.json`、`icon.svg`。其余为文档或工具：`README.md`、`README.zh.md`、`docs/INSTALL*.md`、`CHANGELOG.md`、`LICENSE`、`NOTICE`、`scripts/pack.ps1`。

## 可移植性与 GitHub

本包只是一组文件：把文件夹复制到任意机器，用 `install_bundle` 安装即可；目标机器上不需要构建、安装或下载任何东西。运行时文件为 `package.json`、`cordis.patch.yml`、`index.js`、`client.js`、`locale/en.json`、`locale/zh.json`、`icon.svg`。用新版本替换文件后，请重新执行 `install_bundle` 并刷新一次 Harness 窗口，以加载新的客户端 bundle。

源码发布在 <https://github.com/rorygpk/dsh-plugins>（MIT）。仓库包含源码、安装文档、无头自测与发布工作流：推送 `v*` 标签会由 GitHub Actions 构建 `dist/dsh-terminal-mode-<version>.zip` 并附加到 Release，因此发布包可用 `scripts/pack.ps1` 从源码复现。

由于 `private` 为 `true`，npm 不会发布该包。通过文件夹或压缩包分发是刻意设计。

## 开发

`node test/selftest.mjs` 运行客户端半侧的无头自测（共 50 项：皮肤切换、还原/重置、快捷键注册表与回退、组件渲染）。只有运行该测试需要 Node，安装和使用插件都不需要。`test/` 目录仅用于源码仓库，不会包含在发布压缩包中。

## 许可证

MIT，见 [LICENSE](LICENSE)。配色来源与致谢见 [NOTICE](NOTICE)。
