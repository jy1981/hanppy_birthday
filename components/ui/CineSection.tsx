'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import FilmGrain from './FilmGrain';

type Tone = 'ink' | 'amber' | 'rouge' | 'warm' | 'dai' | 'gold';

/** 各色温对应的深色电影渐变底 */
const toneBg: Record<Tone, string> = {
  ink: 'radial-gradient(ellipse at 50% 30%, #16130f 0%, #0c0a08 70%, #070605 100%)',
  amber:
    'radial-gradient(ellipse at 50% 28%, #241a10 0%, #160f09 65%, #0c0805 100%)',
  rouge:
    'radial-gradient(ellipse at 50% 28%, #241010 0%, #160a0a 65%, #0c0606 100%)',
  warm: 'radial-gradient(ellipse at 50% 28%, #241b11 0%, #17110a 65%, #0d0905 100%)',
  dai: 'radial-gradient(ellipse at 50% 28%, #121a1c 0%, #0c1316 65%, #070d0f 100%)',
  gold: 'radial-gradient(ellipse at 50% 28%, #261c0e 0%, #181107 65%, #0d0904 100%)',
};

/** 暖光束颜色 */
const beamColor: Record<Tone, string> = {
  ink: 'rgba(212,166,86,0.16)',
  amber: 'rgba(232,180,100,0.22)',
  rouge: 'rgba(220,120,110,0.2)',
  warm: 'rgba(232,180,110,0.22)',
  dai: 'rgba(120,200,200,0.16)',
  gold: 'rgba(240,200,120,0.24)',
};

/**
 * 电影级深色章节包装。保留各章自定义内部布局，
 * 统一提供：深色电影底 + 暖光束 + 暗角 + 胶片颗粒 + 内容视差淡入。
 */
export default function CineSection({
  children,
  tone = 'amber',
  watermark,
  beam = true,
  className = '',
}: {
  children: ReactNode;
  tone?: Tone;
  /** 背景水印（如喜字、家字），置于底层 */
  watermark?: ReactNode;
  beam?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['4%', '-4%']);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.16, 0.84, 1],
    [0.2, 1, 1, 0.2]
  );

  return (
    <section
      ref={ref}
      className={`chapter vignette relative py-24 ${className}`}
      style={{ background: toneBg[tone] }}
    >
      {/* 背景水印 */}
      {watermark}

      {/* 暖光束 */}
      {beam && (
        <div
          className="light-beam"
          style={{
            top: '-8%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            height: '55%',
            background: `radial-gradient(ellipse at center, ${beamColor[tone]} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* 胶片颗粒 */}
      <FilmGrain opacity={0.06} />

      {/* 内容层 — 轻微视差淡入 */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-[4] w-full max-w-md mx-auto px-8 flex flex-col items-center gap-10"
      >
        {children}
      </motion.div>
    </section>
  );
}
