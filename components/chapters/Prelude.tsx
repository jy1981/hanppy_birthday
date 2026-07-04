'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { copy } from '@/lib/manifest';
import FilmGrain from '@/components/ui/FilmGrain';

const CARD_DURATION = 3500;

/**
 * Prelude — 片头字幕卡（自动播放版）。
 * 黑幕上逐张淡入淡出的字幕，定时自动切换。
 */
export default function Prelude({ onComplete }: { onComplete?: () => void }) {
  const cards = copy.prelude.cards;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < cards.length - 1) {
      const t = setTimeout(() => setIndex(index + 1), CARD_DURATION);
      return () => clearTimeout(t);
    }
    // 最后一张播完后通知场景控制器
    if (onComplete) {
      const t = setTimeout(onComplete, CARD_DURATION);
      return () => clearTimeout(t);
    }
  }, [index, cards.length, onComplete]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#060504] flex items-center justify-center">
      {/* 极暗的中央光晕 */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '50%',
          background:
            'radial-gradient(ellipse at center, rgba(212,166,86,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <FilmGrain opacity={0.07} />

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center px-10"
        >
          <p className="font-kai title-card text-2xl sm:text-3xl text-center text-balance">
            {cards[index]}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* 字幕进度小点 */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5">
        {cards.map((_, i) => (
          <span
            key={i}
            className="rounded-full transition-all duration-500"
            style={{
              width: i === index ? 12 : 4,
              height: 4,
              background:
                i === index
                  ? 'rgba(212,166,86,0.5)'
                  : 'rgba(201,163,104,0.12)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
