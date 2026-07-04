'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import FilmGrain from './FilmGrain';

type Tone = 'amber' | 'warm' | 'night' | 'rose';

/**
 * 电影级全屏场景容器。
 * - 背景大图/视频随滚动视差位移 + Ken Burns 缓慢运镜
 * - 电影色调滤镜 + 四周暗角 + 底部渐变遮罩
 * - 胶片颗粒叠加
 * - 可选暖光束
 *
 * 子内容默认置于底部三分之一处（电影字幕区），可通过 align 调整。
 */
export default function CinematicScene({
  children,
  bg,
  tone = 'amber',
  align = 'bottom',
  kenBurns = 1,
  beam = true,
  overlay,
  className = '',
  minH = '100svh',
}: {
  children: ReactNode;
  /** 背景层：传入 <video> / <img> / 占位组件 */
  bg: ReactNode;
  tone?: Tone;
  align?: 'bottom' | 'center' | 'top';
  kenBurns?: 1 | 2 | 0;
  beam?: boolean;
  /** 额外的覆盖层（如水印大字），位于背景之上、内容之下 */
  overlay?: ReactNode;
  className?: string;
  minH?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // 视差：背景比前景慢，制造纵深
  const bgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['6%', '-6%']);
  const contentOpacity = useTransform(
    scrollYProgress,
    [0, 0.18, 0.82, 1],
    [0, 1, 1, 0]
  );

  const alignClass =
    align === 'center'
      ? 'justify-center'
      : align === 'top'
      ? 'justify-start pt-[18vh]'
      : 'justify-end pb-[14vh]';

  const kbClass = kenBurns === 2 ? 'ken-burns-2' : kenBurns === 1 ? 'ken-burns' : '';

  return (
    <section
      ref={ref}
      className={`cinematic vignette cine-gradient-b ${className}`}
      style={{ minHeight: minH }}
    >
      {/* 视差背景层 */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 z-0 scale-110"
      >
        <div className={`absolute inset-0 tone-${tone} ${kbClass}`}>{bg}</div>
      </motion.div>

      {/* 暖光束 */}
      {beam && (
        <div
          className="light-beam"
          style={{
            top: '-10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '70%',
            height: '60%',
          }}
        />
      )}

      {/* 覆盖层（水印等） */}
      {overlay}

      {/* 胶片颗粒 */}
      <FilmGrain opacity={0.07} />

      {/* 内容层 */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className={`relative z-[4] w-full max-w-md mx-auto min-h-[100svh] px-8 flex flex-col items-center ${alignClass}`}
      >
        {children}
      </motion.div>
    </section>
  );
}
