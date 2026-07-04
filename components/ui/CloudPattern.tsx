'use client';

/**
 * 中式祥云纹 — 线描风格，极低 opacity 做底纹装饰
 * 纯 SVG 手绘螺旋云头，模拟传统纹样
 */
export default function CloudPattern({
  className = '',
  opacity = 0.08,
  color = '#1F1B1A',
}: {
  className?: string;
  opacity?: number;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 400 120"
      className={className}
      style={{ opacity }}
      fill="none"
      aria-hidden
    >
      <g stroke={color} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
        {/* 云头 1 — 左侧 */}
        <path d="M 20 60 C 20 45, 35 35, 50 40 C 55 30, 70 28, 78 38 C 88 30, 100 35, 100 48 C 110 45, 118 55, 112 62 C 105 68, 90 66, 85 58 C 78 65, 60 64, 55 55 C 45 62, 28 58, 20 60 Z" />
        {/* 云尾 1 */}
        <path d="M 112 62 C 120 58, 128 56, 135 60 C 132 64, 125 65, 120 63" opacity="0.6" />

        {/* 云头 2 — 中左 */}
        <path d="M 150 55 C 150 40, 165 30, 180 35 C 185 25, 200 23, 208 33 C 218 25, 230 30, 230 43 C 240 40, 248 50, 242 57 C 235 63, 220 61, 215 53 C 208 60, 190 59, 185 50 C 175 57, 158 53, 150 55 Z" />
        <path d="M 242 57 C 250 53, 258 51, 265 55 C 262 59, 255 60, 250 58" opacity="0.6" />

        {/* 云头 3 — 中右 */}
        <path d="M 280 62 C 280 47, 295 37, 310 42 C 315 32, 330 30, 338 40 C 348 32, 360 37, 360 50 C 370 47, 378 57, 372 64 C 365 70, 350 68, 345 60 C 338 67, 320 66, 315 57 C 305 64, 288 60, 280 62 Z" />
        <path d="M 372 64 C 380 60, 388 58, 395 62 C 392 66, 385 67, 380 65" opacity="0.6" />
      </g>
    </svg>
  );
}
