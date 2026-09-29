// ==UserScript==
// @name         bilibili 网页全屏控制栏自动隐藏修复
// @namespace    duofu.bili.ctrl-autohide
// @version      1.0.2
// @description  修复网页全屏下鼠标移出窗口后底部控制栏卡住不自动隐藏的问题
// @author       duofu
// @license      MIT
// @icon         https://cdn.jsdelivr.net/gh/duofuwang/bilibili-ctrl-autohide@main/icon.png
// @match        *://*.bilibili.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const PLAYER = '.bpx-player-container';
  const CONTROL_WRAP = '.bpx-player-control-wrap';
  const RELEASE_TARGETS = ['.bpx-player-video-area', CONTROL_WRAP, '.bpx-player-top-wrap'];
  const EDGE_PX = 4;           // 视口边缘判定带宽度
  const EDGE_QUIET_MS = 300;   // 进入边缘带后多久没有新事件，判为已移出窗口
  const WRAP_QUIET_MS = 1200;  // 指针停在控制条区域、全屏模式下静置多久，判为指针已不在窗口内
  const DEBOUNCE_MS = 200;

  let lastX = -1;
  let lastY = -1;
  let edgeTimer = 0;
  let wrapTimer = 0;
  let wrapQuietUsed = false;
  let released = false;
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
    released = true;
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

  // 上一次是我们主动释放的悬停：指针又动了，说明还在窗口里，把控制条恢复显示
  function restoreHover(wrap) {
    released = false;
    const player = wrap.closest(PLAYER);
    if (!player) return;
    for (const sel of [CONTROL_WRAP, '.bpx-player-top-wrap']) {
      const el = player.querySelector(sel);
      if (el) {
        el.dispatchEvent(new MouseEvent('mouseenter', {
          bubbles: false, cancelable: true, view: window, relatedTarget: null,
        }));
      }
    }
  }

  function inEdgeBand(x, y) {
    return x <= EDGE_PX || y <= EDGE_PX ||
      x >= innerWidth - 1 - EDGE_PX || y >= innerHeight - 1 - EDGE_PX;
  }

  function inFullscreen(player) {
    const screen = player.getAttribute('data-screen');
    return screen === 'web' || screen === 'full';
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

    const wrap = e.target && e.target.closest ? e.target.closest(CONTROL_WRAP) : null;
    if (wrap) {
      if (released) restoreHover(wrap);
      // 每次进入控制条区域只收敛一次，避免指针停在上面时反复隐藏
      if (!wrapQuietUsed) {
        const player = wrap.closest(PLAYER);
        if (player && inFullscreen(player)) {
          clearTimeout(wrapTimer);
          wrapTimer = setTimeout(() => {
            wrapTimer = 0;
            wrapQuietUsed = true;
            releaseHover('wrap-quiet');
          }, WRAP_QUIET_MS);
        }
      }
    } else {
      clearTimeout(wrapTimer);
      wrapTimer = 0;
      wrapQuietUsed = false;
      released = false;
    }

    if (e.buttons || !inEdgeBand(e.clientX, e.clientY)) {
      clearTimeout(edgeTimer);
      edgeTimer = 0;
      return;
    }
    clearTimeout(edgeTimer);
    edgeTimer = setTimeout(() => {
      edgeTimer = 0;
      releaseHover('edge-quiet');
    }, EDGE_QUIET_MS);
  }, true);
})();
