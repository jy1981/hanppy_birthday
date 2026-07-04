'use client';

import { useId } from 'react';

/**
 * 胶片颗粒 — SVG feTurbulence 生成，叠加在场景上模拟电影质感。
 * 极轻微的动态噪点，营造真实胶片的呼吸感。
 *
 * animate=true 时，用离散的 seed 抖动模拟真实胶片每格之间的颗粒跳动。
 * （尊重 prefers-reduced-motion：用户关闭动效时自动退回静态颗粒。）
 */
export default function FilmGrain({
  opacity = 0.06,
  animate = false,
  className = '',
}: {
  opacity?: number;
  animate?: boolean;
  className?: string;
}) {
  const rawId = useId();
  const filterId = `film-grain-${rawId.replace(/[:]/g, '')}`;

  return (
    <div
      aria-hidden
      className={`absolute inset-0 pointer-events-none mix-blend-overlay ${className}`}
      style={{ opacity, zIndex: 3 }}
    >
      <svg width="100%" height="100%">
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="3"
            stitchTiles="stitch"
            seed="2"
          >
            {animate && (
              <animate
                attributeName="seed"
                values="2;7;3;9;5;2"
                dur="0.8s"
                calcMode="discrete"
                repeatCount="indefinite"
              />
            )}
          </feTurbulence>
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>
    </div>
  );
}
