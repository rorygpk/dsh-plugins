# 在另一台机器上安装 dsh-terminal-mode

本指南用于把插件部署到从未安装过它的机器。全部工作只有三步：复制文件夹（或解压压缩包）、执行一次 `plugin_manager` 调用、刷新一次 Harness 窗口以加载新的客户端 bundle。

本插件是本地私有 bundle：不发布到 npm，运行时也不访问网络，所需内容全部在包文件夹内。

## 前提条件

- 一个可用的 DeepSeek Harness Web GUI 会话，且带有 `plugin_manager` 工具。
- DSH 支持的操作系统均可（示例使用 Windows 路径）。
- 目标机器不需要 Node.js、pnpm、构建步骤或任何下载。
- 为 bundle 准备固定目录，例如 `C:\Tools\dsh-terminal-mode` 或 `~/dsh-bundles/dsh-terminal-mode`。不要放在会被清理或移动的临时、同步目录中。

DSH 会链接该安装路径。之后若移动或重命名文件夹，请用新路径重新执行 `install_bundle`。

## 1. 获取文件

### 使用发布压缩包

1. 下载 `dsh-terminal-mode-1.0.2.zip`。
2. 解压。压缩包内是顶层 `dsh-terminal-mode/` 文件夹。
3. 确认 `dsh-terminal-mode\package.json` 位于文件夹根部。

如需校验，可与发布页公布的 SHA-256 比对：

```powershell
Get-FileHash .\dsh-terminal-mode-1.0.2.zip -Algorithm SHA256
```

```bash
shasum -a 256 dsh-terminal-mode-1.0.2.zip
```

### 从源码文件夹或网络共享复制

复制整个 `dsh-terminal-mode` 文件夹。运行时必需文件为：`package.json`、`cordis.patch.yml`、`index.js`、`client.js`、`locale/`、`icon.svg`。`scripts/` 与 `docs/` 不参与运行，但建议保留，以保持包自描述。

压缩包本身不能直接安装，必须先解压。

## 2. 安装 bundle

在 DeepSeek Harness 的 Agent 会话中，用绝对文件夹路径调用 `plugin_manager`：

```text
plugin_manager install_bundle({ target: "C:/Tools/dsh-terminal-mode" })
```

注意：

- 目标必须是直接包含 `package.json` 的文件夹，不是其上级目录，也不是 zip 文件。
- 各平台都可用正斜杠；Windows 上也可用转义反斜杠（`"C:\\Tools\\dsh-terminal-mode"`）。
- 路径含空格时放在引号字符串内即可。
- 同一目标可重复安装；替换文件后再次执行即可刷新包。

## 3. 激活

刷新一次 Harness 窗口以加载新的客户端 bundle（Ctrl+R，macOS 为 Cmd+R）。无需重启应用，也无需重新构建。若首次刷新后仍看不到外观变化，强制刷新（Ctrl+Shift+R）以清除客户端缓存。

## 4. 验证

按顺序检查：

1. 设置中出现 **终端模式** 入口。全新安装已默认应用 **Codex 终端** 及其预设（圆角 4 px）。
2. 选择 **Codex 终端** 卡片后，界面底色、字体与输入框下方状态栏发生变化。
3. **Mod+Alt+K** 打开命令面板；Esc 关闭。
4. 侧边栏底部的终端按钮可打开同一个命令面板。
5. 亮度与强调色修改无需刷新即生效。
6. **还原默认皮肤** 后界面恢复未改动状态；**重置全部终端设置** 则恢复首次安装预设（Codex 终端），不会回到未改动的皮肤。
7. 刷新页面后，本机选择的皮肤与特效仍然保留。

若第 1-2 步失败，说明 bundle 未安装成功；见“故障排查”。若第 3-7 步失败，说明客户端半侧未加载；检查浏览器控制台中的插件加载错误并重新安装。

## 5. 更新

1. 用新版本替换包文件（在原文件夹上解压覆盖，或整体替换文件夹并保持路径不变）。
2. 再次执行同一命令：

```text
plugin_manager install_bundle({ target: "C:/Tools/dsh-terminal-mode" })
```

3. 刷新一次 Harness 窗口以加载新的客户端 bundle。

浏览器保存的外观设置会跨版本保留。若新版本调整了存储结构，请在 设置 > 终端模式 中重置。

## 6. 部署到更多机器

在每台机器上重复第 1-3 步。同一文件夹或压缩包适用于所有机器，没有服务端状态。每个浏览器各自保留皮肤、亮度与特效，因此一台可以停在默认皮肤，另一台使用磷光绿。

## 7. 卸载与回滚

卸载：

1. 先还原默认皮肤（设置 > 终端模式 > 还原默认皮肤，或按 Mod+Alt+0）。
2. 用 `plugin_manager` 移除该 bundle，然后刷新页面。
3. 删除文件夹。可选：清除该来源下的 `dsh.terminal-mode.v1` 这个 `localStorage` 键。

回滚：用上一版发布文件替换文件夹，再次执行 `install_bundle`。1.0.2 无需迁移步骤。

## 8. 在开发机上生成压缩包

需要 Windows PowerShell 5.1+ 或 PowerShell 7+，不需要 Node.js：

```powershell
powershell -ExecutionPolicy Bypass -File scripts\pack.ps1
```

脚本会：

- 从 `package.json` 读取 `version`；
- 把运行时必需文件与文档复制到暂存目录；
- 生成 `dist/dsh-terminal-mode-<version>.zip`，压缩包内为顶层 `dsh-terminal-mode/` 文件夹；
- 打印压缩包路径与 SHA-256。

缺少运行时文件（`client.js`、`cordis.patch.yml`、`locale/*.json` 等）会中止构建；缺少可选文档（README、CHANGELOG、NOTICE、docs）只给出警告。可用 `-OutputDirectory <path>` 指定其他输出目录。

## 故障排查

| 现象 | 可能原因与处理 |
|---|---|
| `install_bundle` 失败 | 目标是 zip、上级目录或缺少 `package.json`；解压后指向文件夹 |
| 设置里没有终端模式入口 | 安装失败或页面未刷新；用绝对路径重装并强制刷新 |
| 皮肤生效但状态栏/命令面板缺失 | 客户端半侧未加载；查看浏览器控制台，确认已复制 `client.js`，再重新安装 |
| 设置无法保留 | 浏览器存储被禁用或在会话间被清理；按浏览器持久化是设计行为 |
| 快捷键无反应 | 组合键被浏览器或系统占用；改用侧边栏底部终端按钮 |
| 自定义等宽字体未生效 | 字体必须已在本机安装；否则回退到系统等宽字体栈 |
| 安装后移动了文件夹 | 用新的绝对路径重新执行 `install_bundle` |
