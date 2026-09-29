# bilibili 网页全屏控制栏自动隐藏修复

修复网页全屏下鼠标缓慢移出窗口后，底部播放条卡住不自动隐藏的问题（快速移出不受影响）。

## 安装

需先装有用户脚本管理器（Tampermonkey / Violentmonkey / 脚本猫），然后二选一：

- GreasyFork（自动更新）：<https://greasyfork.org/zh-CN/scripts/597878>
- 本仓库直装（国内可直连）：`https://cdn.jsdelivr.net/gh/duofuwang/bilibili-ctrl-autohide@main/bilibili-ctrl-autohide.user.js`

## 说明

原因：控制栏被判定为「悬停中」后，只有它自己收到 `mouseleave` 才会取消该状态，而从窗口底部移出时这个事件不保证到达，此时自动隐藏定时器也已被取消。

做法：检测到指针离开窗口时，给播放器自己的画面区和控制栏补发一次离开事件，让它原有的隐藏逻辑恢复工作。只在指针最后位置落在播放器范围内时才动手，正常悬停、拖动进度条不受影响。

中等速度移出（既没触发浏览器移出事件、也没经过边缘判定带）仍可能不触发，可把脚本里的 `EDGE_PX` 从 4 调大。

反馈问题时请附上控制台里的 `[bili-ctrl-autohide] released control hover (原因)` 一行。

## 许可证

MIT
