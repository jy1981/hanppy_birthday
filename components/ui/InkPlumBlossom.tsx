'use client';

/**
 * 水墨梅花枝 — 中式工笔写意风格
 * 纯 SVG 手绘，非几何拼凑。枝干用贝塞尔曲线模拟毛笔枯笔效果，
 * 花瓣用渐变+模糊模拟水墨晕染，花蕊点朱砂。
 */
export default function InkPlumBlossom({
  className = '',
  opacity = 0.7,
  flip = false,
}: {
  className?: string;
  opacity?: number;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 300 400"
      className={className}
      style={{ opacity, transform: flip ? 'scaleX(-1)' : undefined }}
      fill="none"
      aria-hidden
    >
      <defs>
        {/* 枯笔渐变 — 模拟墨色浓淡 */}
        <linearGradient id="branch-ink" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a1a1a" stopOpacity="0.7" />
          <stop offset="40%" stopColor="#2a2018" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#3a3028" stopOpacity="0.3" />
        </linearGradient>
        {/* 花瓣晕染 — 白梅带淡粉 */}
        <radialGradient id="petal-white" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFFCF5" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#F8F0E8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#E8DDD0" stopOpacity="0.4" />
        </radialGradient>
        <radialGradient id="petal-pink" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFF5F0" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#F5E0DC" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#E8C8C0" stopOpacity="0.3" />
        </radialGradient>
        {/* 花苞渐变 */}
        <radialGradient id="bud-pink" cx="40%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#F5D0CA" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#D49890" stopOpacity="0.5" />
        </radialGradient>
        {/* 模糊滤镜 — 水墨晕染 */}
        <filter id="ink-bleed">
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
        <filter id="petal-soft">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>

      {/* ===== 主枝干 — 从右下斜向左上 ===== */}
      <g filter="url(#ink-bleed)">
        {/* 主干 */}
        <path
          d="M 280 390 C 260 360, 240 320, 230 280 C 220 240, 210 200, 200 170 C 190 140, 175 110, 160 85 C 150 70, 140 55, 130 42"
          stroke="url(#branch-ink)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* 枯笔飞白 — 主干上的断续线 */}
        <path
          d="M 275 385 C 255 355, 238 315, 228 278"
          stroke="#1a1a1a"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.3"
          strokeDasharray="8 4 3 5 6 3"
        />
        {/* 分枝 1 — 中段向右 */}
        <path
          d="M 225 270 C 240 260, 255 255, 268 250 C 275 248, 282 247, 290 246"
          stroke="url(#branch-ink)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        {/* 分枝 2 — 上段向左 */}
        <path
          d="M 195 165 C 180 155, 165 150, 148 148 C 138 147, 128 148, 118 150"
          stroke="url(#branch-ink)"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.65"
        />
        {/* 分枝 3 — 顶端继续 */}
        <path
          d="M 155 80 C 148 65, 142 50, 138 35 C 136 28, 135 22, 134 16"
          stroke="url(#branch-ink)"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
        {/* 细枝 — 分枝1的延伸 */}
        <path
          d="M 260 252 C 265 245, 268 238, 270 230"
          stroke="#2a2018"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
        {/* 细枝 — 分枝2的小分叉 */}
        <path
          d="M 155 150 C 150 142, 148 135, 146 128"
          stroke="#2a2018"
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.35"
        />
      </g>

      {/* ===== 花朵 ===== */}
      {/* 花 1 — 主干中段，盛开 */}
      <g transform="translate(228, 272)" filter="url(#petal-soft)">
        <Petal radius={9} fill="url(#petal-white)" />
        <Petal radius={9} fill="url(#petal-white)" rotate={72} />
        <Petal radius={9} fill="url(#petal-white)" rotate={144} />
        <Petal radius={9} fill="url(#petal-white)" rotate={216} />
        <Petal radius={9} fill="url(#petal-white)" rotate={288} />
        {/* 花蕊 — 朱砂点 */}
        <circle cx="0" cy="0" r="1.8" fill="#B03A48" opacity="0.7" />
        <circle cx="2.5" cy="1" r="0.8" fill="#B03A48" opacity="0.5" />
        <circle cx="-2" cy="2" r="0.8" fill="#B03A48" opacity="0.5" />
        <circle cx="1" cy="-2.5" r="0.8" fill="#B03A48" opacity="0.5" />
      </g>

      {/* 花 2 — 分枝1末端，盛开 */}
      <g transform="translate(285, 248)" filter="url(#petal-soft)">
        <Petal radius={8} fill="url(#petal-pink)" />
        <Petal radius={8} fill="url(#petal-pink)" rotate={72} />
        <Petal radius={8} fill="url(#petal-pink)" rotate={144} />
        <Petal radius={8} fill="url(#petal-pink)" rotate={216} />
        <Petal radius={8} fill="url(#petal-pink)" rotate={288} />
        <circle cx="0" cy="0" r="1.5" fill="#B03A48" opacity="0.65" />
        <circle cx="2" cy="0.8" r="0.7" fill="#B03A48" opacity="0.45" />
        <circle cx="-1.5" cy="1.5" r="0.7" fill="#B03A48" opacity="0.45" />
      </g>

      {/* 花 3 — 分枝2中部，半开 */}
      <g transform="translate(150, 148)" filter="url(#petal-soft)">
        <Petal radius={7} fill="url(#petal-white)" />
        <Petal radius={7} fill="url(#petal-white)" rotate={72} />
        <Petal radius={7} fill="url(#petal-white)" rotate={144} />
        <Petal radius={7} fill="url(#petal-white)" rotate={216} />
        <Petal radius={7} fill="url(#petal-white)" rotate={288} />
        <circle cx="0" cy="0" r="1.3" fill="#B03A48" opacity="0.6" />
      </g>

      {/* 花 4 — 顶端，盛开 */}
      <g transform="translate(136, 38)" filter="url(#petal-soft)">
        <Petal radius={8.5} fill="url(#petal-pink)" />
        <Petal radius={8.5} fill="url(#petal-pink)" rotate={72} />
        <Petal radius={8.5} fill="url(#petal-pink)" rotate={144} />
        <Petal radius={8.5} fill="url(#petal-pink)" rotate={216} />
        <Petal radius={8.5} fill="url(#petal-pink)" rotate={288} />
        <circle cx="0" cy="0" r="1.6" fill="#B03A48" opacity="0.7" />
        <circle cx="2.2" cy="1" r="0.7" fill="#B03A48" opacity="0.5" />
        <circle cx="-1.8" cy="1.8" r="0.7" fill="#B03A48" opacity="0.5" />
      </g>

      {/* 花 5 — 主干下段 */}
      <g transform="translate(255, 350)" filter="url(#petal-soft)">
        <Petal radius={7.5} fill="url(#petal-white)" />
        <Petal radius={7.5} fill="url(#petal-white)" rotate={72} />
        <Petal radius={7.5} fill="url(#petal-white)" rotate={144} />
        <Petal radius={7.5} fill="url(#petal-white)" rotate={216} />
        <Petal radius={7.5} fill="url(#petal-white)" rotate={288} />
        <circle cx="0" cy="0" r="1.4" fill="#B03A48" opacity="0.6" />
      </g>

      {/* ===== 花苞 ===== */}
      <g transform="translate(270, 232)" filter="url(#petal-soft)">
        <ellipse cx="0" cy="0" rx="3" ry="4" fill="url(#bud-pink)" />
        <ellipse cx="-1" cy="-1" rx="1.5" ry="2" fill="#FFF5F0" opacity="0.5" />
      </g>
      <g transform="translate(118, 152)" filter="url(#petal-soft)">
        <ellipse cx="0" cy="0" rx="2.5" ry="3.5" fill="url(#bud-pink)" />
      </g>
      <g transform="translate(146, 128)" filter="url(#petal-soft)">
        <ellipse cx="0" cy="0" rx="2.5" ry="3" fill="url(#bud-pink)" />
      </g>

      {/* ===== 散落的小花瓣 ===== */}
      <ellipse cx="50" cy="320" rx="3" ry="4.5" fill="url(#petal-white)" opacity="0.3" transform="rotate(30 50 320)" filter="url(#petal-soft)" />
      <ellipse cx="80" cy="200" rx="2.5" ry="4" fill="url(#petal-pink)" opacity="0.25" transform="rotate(-20 80 200)" filter="url(#petal-soft)" />
      <ellipse cx="200" cy="380" rx="2.5" ry="4" fill="url(#petal-white)" opacity="0.2" transform="rotate(45 200 380)" filter="url(#petal-soft)" />
    </svg>
  );
}

/** 单片花瓣 — 椭圆形，底部窄顶部圆 */
function Petal({
  radius,
  fill,
  rotate = 0,
}: {
  radius: number;
  fill: string;
  rotate?: number;
}) {
  return (
    <ellipse
      cx="0"
      cy={-radius * 0.75}
      rx={radius * 0.55}
      ry={radius}
      fill={fill}
      transform={`rotate(${rotate})`}
    />
  );
}
