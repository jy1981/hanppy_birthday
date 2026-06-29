'use client';

/**
 * 水墨笔触分隔线。
 */
export default function InkBrushDivider({
  color = '#1F1B1A',
  width = 240,
  className = '',
}: {
  color?: string;
  width?: number;
  className?: string;
}) {
  return (
    <svg
      width={width}
      height="18"
      viewBox="0 0 240 18"
      className={className}
      aria-hidden
    >
      <path
        d="M2 10 C 30 4, 60 14, 90 9 S 150 4, 180 11 S 220 14, 238 8"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        opacity="0.25"
      />
      <path
        d="M14 12 C 50 8, 100 14, 150 10 S 210 6, 234 11"
        stroke={color}
        strokeWidth="0.6"
        fill="none"
        strokeLinecap="round"
        opacity="0.15"
      />
      <circle cx="2" cy="10" r="2" fill={color} opacity="0.3" />
      <circle cx="238" cy="8" r="2" fill={color} opacity="0.3" />
    </svg>
  );
}
