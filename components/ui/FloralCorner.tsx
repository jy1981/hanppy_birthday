'use client';

/**
 * 四角工笔花卉 SVG 装饰，可调色。
 */
export default function FloralCorner({
  color = '#B03A48',
  opacity = 0.18,
  size = 90,
}: {
  color?: string;
  opacity?: number;
  size?: number;
}) {
  const Branch = ({ className = '' }: { className?: string }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      style={{ opacity }}
      aria-hidden
    >
      <g stroke={color} strokeWidth="0.9" strokeLinecap="round" fill="none">
        {/* 主枝条 */}
        <path d="M2 2 C 30 18, 50 30, 70 60 C 80 78, 90 96, 118 118" />
        {/* 小分枝 */}
        <path d="M28 18 C 38 28, 42 38, 40 52" />
        <path d="M55 38 C 68 42, 78 48, 82 60" />
        <path d="M70 60 C 60 70, 52 78, 48 92" />
        {/* 叶子 */}
        <path d="M40 52 q 8 -4 14 -2 q -4 8 -14 2 z" fill={color} fillOpacity="0.35" />
        <path d="M82 60 q 6 -8 14 -8 q -2 10 -14 8 z" fill={color} fillOpacity="0.3" />
        <path d="M48 92 q -8 -2 -14 4 q 6 8 14 -4 z" fill={color} fillOpacity="0.3" />
      </g>
      {/* 花朵：五瓣梅 */}
      <g transform="translate(72,32)">
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse
            key={deg}
            cx="0"
            cy="-6"
            rx="4.5"
            ry="6.5"
            transform={`rotate(${deg})`}
            fill={color}
            fillOpacity="0.55"
          />
        ))}
        <circle r="2" fill="#C9A368" />
      </g>
      <g transform="translate(30,80)">
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse
            key={deg}
            cx="0"
            cy="-4"
            rx="3"
            ry="4.5"
            transform={`rotate(${deg})`}
            fill={color}
            fillOpacity="0.45"
          />
        ))}
        <circle r="1.4" fill="#C9A368" />
      </g>
    </svg>
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-[1]">
      <div className="absolute top-0 left-0">
        <Branch />
      </div>
      <div className="absolute top-0 right-0 -scale-x-100">
        <Branch />
      </div>
      <div className="absolute bottom-0 left-0 -scale-y-100">
        <Branch />
      </div>
      <div className="absolute bottom-0 right-0 -scale-x-100 -scale-y-100">
        <Branch />
      </div>
    </div>
  );
}
