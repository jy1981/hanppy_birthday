'use client';

/**
 * 中式印章：朱红底 + 白字。
 * text 1-4 个字最佳。
 */
export default function ChineseSeal({
  text,
  size = 64,
  color = '#B03A48',
  rotate = -6,
  className = '',
}: {
  text: string;
  size?: number;
  color?: string;
  rotate?: number;
  className?: string;
}) {
  const chars = text.split('');
  const cols = chars.length <= 2 ? 1 : 2;
  const rows = Math.ceil(chars.length / cols);

  // 朱泥纹理：用 SVG noise filter 模拟
  return (
    <div
      className={`inline-block select-none drop-shadow-soft ${className}`}
      style={{
        width: size,
        height: size,
        transform: `rotate(${rotate}deg)`,
      }}
      aria-label={`印章 ${text}`}
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <defs>
          <filter id="seal-noise" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="7" />
            <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -0.7 0.6" />
            <feComposite in="SourceGraphic" operator="in" />
          </filter>
          <filter id="seal-rough" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="11" />
            <feDisplacementMap in="SourceGraphic" scale="2.5" />
          </filter>
        </defs>
        {/* 印章主体 — 不规则边缘 */}
        <g filter="url(#seal-rough)">
          <rect
            x="3"
            y="3"
            width="94"
            height="94"
            rx="2"
            fill={color}
            stroke={color}
            strokeWidth="1.5"
          />
        </g>
        {/* 内框 */}
        <rect
          x="9"
          y="9"
          width="82"
          height="82"
          rx="1"
          fill="none"
          stroke="#FFF6E5"
          strokeWidth="1.2"
          opacity="0.85"
        />
        {/* 文字 */}
        {chars.map((ch, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const cellW = 82 / cols;
          const cellH = 82 / rows;
          const x = 9 + col * cellW + cellW / 2;
          const y = 9 + row * cellH + cellH / 2;
          return (
            <text
              key={i}
              x={x}
              y={y}
              fill="#FFF6E5"
              fontSize={Math.min(cellW, cellH) * 0.72}
              fontFamily="var(--font-kai), KaiTi, serif"
              textAnchor="middle"
              dominantBaseline="central"
              fontWeight={700}
              opacity="0.92"
            >
              {ch}
            </text>
          );
        })}
        {/* 朱泥磨损纹理 */}
        <rect x="0" y="0" width="100" height="100" filter="url(#seal-noise)" opacity="0.35" />
      </svg>
    </div>
  );
}
