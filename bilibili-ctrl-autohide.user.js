// ==UserScript==
// @name         bilibili 网页全屏控制栏自动隐藏修复
// @namespace    duofu.bili.ctrl-autohide
// @version      1.0.0
// @description  修复网页全屏下鼠标缓慢移出窗口时底部控制栏卡住不自动隐藏的问题
// @author       duofu
// @license      MIT
// @match        *://*.bilibili.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const PLAYER = '.bpx-player-container';
  // 依次触发播放器自己的"离开画面区/离开控制区"处理：清掉悬停状态并收起控制栏
  const RELEASE_TARGETS = [
    '.bpx-player-video-area',
    '.bpx-player-control-wrap',
    '.bpx-player-top-wrap',
  ];
  const EDGE_PX = 4;
  const QUIET_MS = 300;
  const DEBOUNCE_MS = 200;

  let lastX = -1;
  let lastY = -1;
  let edgeTimer = 0;
  let lastAction = 0;

  function releaseHover(reason) {
    if (lastX < 0 || lastY < 0) return;
    const now = Date.now();
    if (now - lastAction < DEBOUNCE_MS) return;
    const x = Math.min(Math.max(lastX, 0), innerWidth - 1);
    const y = Math.min(Math.max(lastY, 0), innerHeight - 1);
    const player = document.elementFromPoint(x, y)?.closest(PLAYER);
    if (!player) return;
    lastAction = now;
    for (const sel of RELEASE_TARGETS) {
      const el = player.querySelector(sel);
      if (el) {
        el.dispatchEvent(new MouseEvent('mouseleave', {
          bubbles: false, cancelable: true, view: window, relatedTarget: null,
        }));
      }
    }
    console.debug('[bili-ctrl-autohide] released control hover (' + reason + ')');
  }

  function inEdgeBand(x, y) {
    return x <= EDGE_PX || y <= EDGE_PX ||
      x >= innerWidth - 1 - EDGE_PX || y >= innerHeight - 1 - EDGE_PX;
  }

  document.documentElement.addEventListener('mouseleave', (e) => {
    if (!e.relatedTarget) releaseHover('mouseleave');
  }, true);

  document.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget) releaseHover('mouseout-null');
  }, true);

  document.addEventListener('mousemove', (e) => {
    lastX = e.clientX;
    lastY = e.clientY;
    if (e.buttons || !inEdgeBand(e.clientX, e.clientY)) {
      if (edgeTimer) { clearTimeout(edgeTimer); edgeTimer = 0; }
      return;
    }
    if (edgeTimer) clearTimeout(edgeTimer);
    edgeTimer = setTimeout(() => { edgeTimer = 0; releaseHover('edge-quiet'); }, QUIET_MS);
  }, true);
})();
