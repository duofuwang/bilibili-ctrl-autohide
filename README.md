# bilibili 网页全屏控制栏自动隐藏修复

<img src="icon.png" width="80" alt="icon">

修复网页全屏下鼠标缓慢移出窗口后，底部播放条卡住不自动隐藏的问题（快速移出不受影响）。

## 安装

需先装有用户脚本管理器（Tampermonkey / Violentmonkey / 脚本猫），然后二选一：

- GreasyFork（自动更新）：<https://greasyfork.org/zh-CN/scripts/597878>
- 本仓库直装（国内可直连）：`https://cdn.jsdelivr.net/gh/duofuwang/bilibili-ctrl-autohide@main/bilibili-ctrl-autohide.user.js`

## 说明

原因：控制栏被判定为「悬停中」后，只有它自己收到 `mouseleave` 才会取消该状态，而从窗口底部移出时这个事件不保证到达，此时自动隐藏定时器也已被取消。

做法：检测到指针已离开窗口时，给播放器自己的画面区和控制栏补发一次离开事件，让它原有的隐藏逻辑恢复工作。判断「指针已离开窗口」有三种方式：

1. 浏览器派发的移出事件（`mouseleave`，或 `relatedTarget` 为空的 `mouseout`）；
2. 指针进入窗口边缘 4 像素内，且随后 300 毫秒内没有新事件、也没有按住鼠标键；
3. 指针最后一次位置在控制条区域内、全屏模式下静置 1.2 秒没有任何新事件（对应「快速把鼠标甩出窗口、最后一次采样停在控制条上」的情况）。

第 3 条只在网页全屏/全屏下生效，且每次进入控制条区域只收敛一次；如果判断错了（指针其实还停在控制条上），指针再动一下就会自动恢复显示。

反馈问题时请附上控制台里的 `[bili-ctrl-autohide] released control hover (原因)` 一行。

## 许可证

MIT
