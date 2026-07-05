'use client';

/**
 * 背景音乐挂起/恢复的轻量事件桥。
 * 录音、试听等需要独占音频的场景，先挂起 BGM，结束后恢复。
 * BgmToggle 监听这两个事件，记住挂起前是否在播放。
 */
export function suspendBgm(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('bgm:suspend'));
  }
}

export function resumeBgm(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('bgm:resume'));
  }
}
