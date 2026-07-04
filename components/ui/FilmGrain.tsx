'use client';

/**
 * 胶片颗粒 — SVG feTurbulence 生成，叠加在场景上模拟电影质感。
 * 极轻微的动态噪点，营造真实胶片的呼吸感。
 */
export default function FilmGrain({
  opacity = 0.06,
  className = '',
}: {
  opacity?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`absolute inset-0 pointer-events-none mix-blend-overlay ${className}`}
      style={{ opacity, zIndex: 3 }}
    >
      <svg width="100%" height="100%">
        <filter id="film-grain-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#film-grain-noise)" />
      </svg>
    </div>
  );
}
