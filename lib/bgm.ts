'use client';

import { useEffect, useState } from 'react';

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

/* ------------------------------------------------------------------ */
/**
 * BGM 播放状态广播。
 * BgmToggle 是唯一的状态源，playing 变化时调用 setBgmPlaying 广播；
 * 唱片按钮等组件用 useBgmPlaying() 订阅，未播放时不旋转。
 */
let bgmPlaying = false;

export function setBgmPlaying(playing: boolean): void {
  bgmPlaying = playing;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bgm:playing', { detail: playing }));
  }
}

export function getBgmPlaying(): boolean {
  return bgmPlaying;
}

export function useBgmPlaying(): boolean {
  const [playing, setPlaying] = useState(bgmPlaying);

  useEffect(() => {
    // 挂载时同步当前状态，避免错过挂载前的广播
    setPlaying(bgmPlaying);
    const onChange = (e: Event) => {
      setPlaying((e as CustomEvent<boolean>).detail);
    };
    window.addEventListener('bgm:playing', onChange);
    return () => window.removeEventListener('bgm:playing', onChange);
  }, []);

  return playing;
}
