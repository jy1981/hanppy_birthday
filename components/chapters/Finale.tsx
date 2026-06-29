'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { copy, videos } from '@/lib/manifest';
import { VideoSlot } from '@/components/ui/MediaSlot';
import Fireworks from '@/components/ui/Fireworks';
import Candles from '@/components/ui/Candles';
import ChineseSeal from '@/components/ui/ChineseSeal';

/**
 * 终章「来日方长」：夜色 + 烟花 + 吹蜡烛许愿 + 落款印章
 */
export default function Finale() {
  const [wished, setWished] = useState(false);

  return (
    <section className="chapter night-texture relative overflow-hidden">
      {/* 远景烟花视频（占位也好看） */}
      <div className="absolute inset-0 z-0 opacity-40">
        <VideoSlot
          src={videos.finaleFireworks}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {/* 烟花 canvas，许愿后变得更密 */}
      <Fireworks active intensity={wished ? 2.5 : 1} />

      {/* 内容 */}
      <div className="relative z-[3] w-full max-w-md mx-auto px-8 py-16 flex flex-col items-center text-paper text-center min-h-[100svh] justify-between">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="flex flex-col items-center gap-3"
        >
          <span className="font-en italic text-liujin text-sm tracking-[0.4em]">
            {copy.finale.eyebrow}
          </span>
          <h2
            className="font-kai gold-text"
            style={{ fontSize: 'clamp(48px, 13vw, 72px)', letterSpacing: '0.3em' }}
          >
            {copy.finale.title}
          </h2>
          <p className="font-kai text-paper/85 text-base tracking-[0.3em] mt-2">
            {copy.finale.sub}
          </p>
        </motion.div>

        {/* 蛋糕 + 蜡烛 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, delay: 0.3 }}
          className="my-6"
        >
          <Candles count={3} onAllBlown={() => setWished(true)} />
        </motion.div>

        {/* 许愿后的话 */}
        <div className="min-h-[160px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!wished ? (
              <motion.p
                key="prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="font-song text-paper/70 text-sm leading-loose tracking-widest"
              >
                闭上眼睛
                <br />
                想一件最想实现的事
                <br />
                然后，吹灭它们 ✨
              </motion.p>
            ) : (
              <motion.div
                key="wished"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
                className="flex flex-col items-center gap-4"
              >
                <p className="font-kai text-paper text-lg leading-loose whitespace-pre-line">
                  {copy.finale.wish}
                </p>
                <div className="flex flex-col items-center gap-4 mt-2">
                  <ChineseSeal text={copy.finale.seal} size={60} rotate={-6} />
                  <span className="font-song text-paper/60 text-xs tracking-[0.2em]">
                    {copy.finale.signature}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 落款 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, delay: 0.6 }}
          className="font-en italic text-paper/40 text-xs tracking-[0.3em] mt-6"
        >
          made with ♡
        </motion.div>
      </div>
    </section>
  );
}
