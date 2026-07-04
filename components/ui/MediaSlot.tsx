'use client';

import { useState } from 'react';

type Ratio = 'portrait' | 'landscape' | 'square';

const ratioClass: Record<Ratio, string> = {
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  square: 'aspect-square',
};

/**
 * 照片占位：图片不存在时显示优雅的中国风占位。
 */
export function PhotoSlot({
  src,
  alt = '',
  ratio = 'portrait',
  label,
  className = '',
}: {
  src?: string;
  alt?: string;
  ratio?: Ratio;
  label?: string;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  const showImg = !!src && !errored;

  return (
    <div
      className={`relative overflow-hidden rounded-sm ${ratioClass[ratio]} ${className}`}
      style={{
        background:
          'linear-gradient(150deg, #1c1815 0%, #2a221c 45%, #3a2e24 100%)',
        boxShadow:
          '0 18px 50px -12px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(201,163,104,0.18)',
      }}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setErrored(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gold/30">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect
              x="3"
              y="5"
              width="18"
              height="14"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <circle cx="9" cy="10.5" r="1.5" fill="currentColor" opacity="0.6" />
            <path
              d="M4 17 L10 12 L14 15 L20 9"
              stroke="currentColor"
              strokeWidth="1.2"
              fill="none"
            />
          </svg>
          <div className="font-kai text-xs tracking-[0.3em] mt-2">
            {label ?? '照片占位'}
          </div>
        </div>
      )}
      {/* 边角金线点缀 */}
      <span className="absolute top-1 left-1 w-3 h-3 border-t border-l border-gold/60" />
      <span className="absolute top-1 right-1 w-3 h-3 border-t border-r border-gold/60" />
      <span className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-gold/60" />
      <span className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-gold/60" />
    </div>
  );
}

/**
 * 视频占位：找不到文件时静默显示渐变背景。
 */
export function VideoSlot({
  src,
  poster,
  loop = true,
  muted = true,
  autoPlay = true,
  playsInline = true,
  className = '',
  fallback,
}: {
  src?: string;
  poster?: string;
  loop?: boolean;
  muted?: boolean;
  autoPlay?: boolean;
  playsInline?: boolean;
  className?: string;
  fallback?: React.ReactNode;
}) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div
        className={`relative overflow-hidden ${className}`}
        style={{
          background:
            'radial-gradient(ellipse at 40% 30%, #2a221c 0%, #1a1512 50%, #0d0a08 100%)',
        }}
      >
        {fallback}
      </div>
    );
  }

  return (
    <video
      src={src}
      poster={poster}
      loop={loop}
      muted={muted}
      autoPlay={autoPlay}
      playsInline={playsInline}
      onError={() => setErrored(true)}
      className={`object-cover ${className}`}
    />
  );
}
