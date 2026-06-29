'use client';

import { motion } from 'framer-motion';
import { copy, videos, photos } from '@/lib/manifest';
import { VideoSlot, PhotoSlot } from '@/components/ui/MediaSlot';
import FloralCorner from '@/components/ui/FloralCorner';
import ChineseSeal from '@/components/ui/ChineseSeal';

export default function Cover() {
  const heroPhoto = photos.cover?.[0];

  return (
    <section className="chapter paper-texture-warm relative">
      {/* 背景视频（占位时显示渐变） */}
      <div className="absolute inset-0 z-0">
        <VideoSlot
          src={videos.hero}
          className="absolute inset-0 w-full h-full opacity-60"
        />
        {/* 渐隐遮罩，让前景文字更清晰 */}
        <div className="absolute inset-0 bg-gradient-to-b from-paperSoft/40 via-transparent to-paperSoft/90" />
      </div>

      <FloralCorner color="#B03A48" opacity={0.15} />

      <div className="relative z-10 w-full max-w-md mx-auto h-[100svh] flex flex-col items-center justify-between py-14 px-8 text-center">
        {/* 顶部小字 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.2 }}
          className="font-song text-mist text-sm tracking-[0.5em]"
        >
          {copy.cover.eyebrow}
        </motion.div>

        {/* 中央照片框 + 大字 */}
        <div className="flex flex-col items-center gap-8">
          {/* 主照片（占位） */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-[68vw] max-w-[280px]"
          >
            <PhotoSlot
              src={heroPhoto?.src}
              ratio="portrait"
              label="封面合照"
              className="shadow-2xl"
            />
            {/* 印章压角 */}
            <div className="absolute -bottom-4 -right-4">
              <ChineseSeal text="彤" size={44} rotate={-8} />
            </div>
          </motion.div>

          {/* 大字标题 */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.6, delay: 0.9 }}
            className="font-kai text-ink leading-none"
            style={{ fontSize: 'clamp(64px, 18vw, 96px)', letterSpacing: '0.25em' }}
          >
            {copy.cover.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.3 }}
            className="font-en italic text-mist text-base tracking-widest"
          >
            {copy.cover.subtitle}
          </motion.div>
        </div>

        {/* 底部：滑动提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.8 }}
          className="flex flex-col items-center gap-2 text-mist"
        >
          <span className="font-kai text-sm tracking-[0.5em]">向 上 轻 拂</span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-xl"
          >
            ⌵
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}
