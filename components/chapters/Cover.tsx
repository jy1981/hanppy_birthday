'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { copy } from '@/lib/manifest';
import { VideoSlot } from '@/components/ui/MediaSlot';
import FilmGrain from '@/components/ui/FilmGrain';

const ease = [0.22, 1, 0.36, 1] as const;

export default function Cover({ onComplete }: { onComplete?: () => void }) {
  useEffect(() => {
    // 动画约 3.5 秒完成，之后通知场景控制器
    if (onComplete) {
      const t = setTimeout(onComplete, 4000);
      return () => clearTimeout(t);
    }
  }, [onComplete]);
  return (
    <div className="cinematic vignette relative w-full h-full overflow-hidden">
      {/* 视频背景 — 直接全屏铺满 */}
      <div className="absolute inset-0 z-0">
        <VideoSlot
          src="/media/videos/cover.mp4"
          className="absolute inset-0 w-full h-full"
          fallback={
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 40%, #2a221c 0%, #1a1512 50%, #0d0a08 100%)',
              }}
            />
          }
        />
      </div>

      {/* 底部渐变遮罩 */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 25%, transparent 50%, rgba(0,0,0,0.55) 80%, rgba(0,0,0,0.85) 100%)',
        }}
      />

      <FilmGrain opacity={0.06} />

      {/* 内容层 */}
      <div className="relative z-[4] w-full max-w-md mx-auto h-full px-8 flex flex-col items-center justify-center pb-[8vh]">
        {/* 顶部 eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16, letterSpacing: '0.8em' }}
          animate={{ opacity: 1, y: 0, letterSpacing: '0.5em' }}
          transition={{ duration: 1.6, delay: 0.4, ease }}
          className="font-song cine-eyebrow text-xs sm:text-sm tracking-[0.5em] mb-6"
        >
          {copy.cover.eyebrow}
        </motion.div>

        {/* 主标题 — 白色电影字幕 */}
        <motion.h1
          initial={{ opacity: 0, y: 24, letterSpacing: '0.5em' }}
          animate={{ opacity: 1, y: 0, letterSpacing: '0.25em' }}
          transition={{ duration: 1.8, delay: 0.8, ease }}
          className="font-kai cine-title leading-none"
          style={{ fontSize: 'clamp(72px, 22vw, 120px)' }}
        >
          {copy.cover.title}
        </motion.h1>

        {/* 副标题 + 细金线 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 1.4, ease }}
          className="flex flex-col items-center gap-5 mt-6"
        >
          <span className="block h-px w-16 bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
          <span className="font-en italic cine-sub text-base tracking-[0.3em]">
            {copy.cover.subtitle}
          </span>
        </motion.div>

        {/* 提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 2 }}
          className="flex flex-col items-center gap-2 mt-16 cine-sub"
        >
          <span className="scene-marker font-en">OPENING</span>
          <span className="font-kai text-xs tracking-[0.5em] mt-1">轻触 ❤️ 开始</span>
          <motion.span
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-lg"
          >
            ⌵
          </motion.span>
        </motion.div>
      </div>
    </div>
  );
}
