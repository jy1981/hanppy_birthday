'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * DustMotes — 放映机光束里缓缓漂浮的金色尘埃。
 *
 * 纯装饰，pointer-events-none，叠在 CinemaFrame 里贯穿全片。
 * 位置/时长由 index 确定性推导（避免 SSR/CSR 水合不一致），
 * 尊重 prefers-reduced-motion：用户关闭动效时整层不渲染。
 */
export default function DustMotes({ count = 18 }: { count?: number }) {
  const motes = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      // 用无理数错开的确定性伪随机，保证服务端/客户端渲染一致
      const rx = (Math.sin(i * 12.9898) * 43758.5453) % 1;
      const ry = (Math.sin(i * 78.233) * 12543.1234) % 1;
      const rs = (Math.sin(i * 3.71) * 9631.77) % 1;
      const left = Math.abs(rx) * 100;
      const top = 12 + Math.abs(ry) * 76;
      const size = 1.2 + Math.abs(rs) * 2.6;
      const dur = 14 + Math.abs(rx) * 16;
      const delay = Math.abs(ry) * 10;
      const drift = (i % 2 === 0 ? 1 : -1) * (10 + Math.abs(rs) * 26);
      const peak = 0.15 + Math.abs(rs) * 0.35;
      return { left, top, size, dur, delay, drift, peak, i };
    });
  }, [count]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden"
      style={{ zIndex: 2 }}
    >
      {motes.map((m) => (
        <motion.span
          key={m.i}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, m.peak, m.peak * 0.6, 0],
            x: [0, m.drift, m.drift * 0.4],
            y: [0, -18, -34],
          }}
          transition={{
            duration: m.dur,
            delay: m.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute rounded-full"
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: m.size,
            height: m.size,
            background:
              'radial-gradient(circle, rgba(245,224,176,0.95) 0%, rgba(212,166,86,0.5) 45%, transparent 75%)',
            boxShadow: '0 0 6px rgba(212,166,86,0.4)',
            filter: 'blur(0.4px)',
          }}
        />
      ))}
    </div>
  );
}
