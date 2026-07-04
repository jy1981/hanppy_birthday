'use client';

import { useEffect, useRef, useState } from 'react';
import { audio } from '@/lib/manifest';

/**
 * 背景音乐开关。autoplay 仅当 user 已交互（entered）时尝试播放。
 * iOS 安全：必须用户手势触发。
 */
export default function BgmToggle({ autoplay = false }: { autoplay?: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [hasFile, setHasFile] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0;
    a.play()
      .then(() => {
        setPlaying(true);
        // 淡入
        let v = 0;
        const id = setInterval(() => {
          v = Math.min(0.55, v + 0.05);
          a.volume = v;
          if (v >= 0.55) clearInterval(id);
        }, 120);
      })
      .catch(() => {
        // 自动播放失败：等用户点击按钮
        setPlaying(false);
      });
  }, [autoplay]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  if (!hasFile) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={audio.bgm}
        loop
        preload="auto"
        onError={() => setHasFile(false)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? '暂停音乐' : '播放音乐'}
        className="fixed top-4 right-4 z-[200] w-10 h-10 rounded-full bg-paper/60 backdrop-blur-md border border-gold/60 flex items-center justify-center shadow-md active:scale-95 transition"
      >
        {playing ? <WaveIcon /> : <MuteIcon />}
      </button>
    </>
  );
}

function WaveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <g stroke="#B03A48" strokeWidth="1.6" strokeLinecap="round">
        <line x1="5" y1="10" x2="5" y2="14">
          <animate attributeName="y1" values="9;6;9" dur="1s" repeatCount="indefinite" />
          <animate attributeName="y2" values="15;18;15" dur="1s" repeatCount="indefinite" />
        </line>
        <line x1="10" y1="7" x2="10" y2="17">
          <animate attributeName="y1" values="7;4;7" dur="0.8s" repeatCount="indefinite" />
          <animate attributeName="y2" values="17;20;17" dur="0.8s" repeatCount="indefinite" />
        </line>
        <line x1="15" y1="9" x2="15" y2="15">
          <animate attributeName="y1" values="9;6;9" dur="0.9s" repeatCount="indefinite" />
          <animate attributeName="y2" values="15;18;15" dur="0.9s" repeatCount="indefinite" />
        </line>
        <line x1="20" y1="11" x2="20" y2="13">
          <animate attributeName="y1" values="11;8;11" dur="1.1s" repeatCount="indefinite" />
          <animate attributeName="y2" values="13;16;13" dur="1.1s" repeatCount="indefinite" />
        </line>
      </g>
    </svg>
  );
}

function MuteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 9v6h4l5 4V5L8 9H4z"
        stroke="#7A7A7A"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <line x1="16" y1="9" x2="22" y2="15" stroke="#7A7A7A" strokeWidth="1.6" />
      <line x1="22" y1="9" x2="16" y2="15" stroke="#7A7A7A" strokeWidth="1.6" />
    </svg>
  );
}
