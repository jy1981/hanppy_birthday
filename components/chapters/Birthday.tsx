'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { copy, photos } from '@/lib/manifest';
import FilmScene from '@/components/ui/FilmScene';
import ChineseSeal from '@/components/ui/ChineseSeal';

const LETTER_DELAY = 200;

/**
 * Chapter V · 彤 — 长镜头 + 一封信（自动播放版）。
 * 先播放 FilmScene 照片序列，然后自动切换到信件场景。
 */
export default function Birthday({ onComplete }: { onComplete?: () => void }) {
  const [showLetter, setShowLetter] = useState(false);

  // FilmScene 照片播完后自动显示信件
  // 估算时间：title 3s + photos 5.6s × 3 = 19.8s
  useEffect(() => {
    const t = setTimeout(() => setShowLetter(true), 20000);
    return () => clearTimeout(t);
  }, []);

  // 信件显示 8 秒后通知场景控制器
  useEffect(() => {
    if (showLetter && onComplete) {
      const t = setTimeout(onComplete, 10000);
      return () => clearTimeout(t);
    }
  }, [showLetter, onComplete]);

  if (!showLetter) {
    return (
      <FilmScene
        scene="05"
        titleZh="彤"
        titleEn="Her Name Is Tong"
        photos={photos.birthday ?? []}
        tone="rose"
      />
    );
  }

  return (
    <div
      className="relative w-full h-full overflow-y-auto"
      style={{
        background:
          'radial-gradient(ellipse at 50% 20%, #1c150c 0%, #110c06 60%, #080604 100%)',
      }}
    >
      <div
        className="light-beam"
        style={{
          top: '-6%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '85%',
          height: '45%',
          background:
            'radial-gradient(ellipse at center, rgba(240,200,120,0.16) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-[4] w-full max-w-md mx-auto px-8 py-20 flex flex-col items-center gap-12 min-h-full justify-center">
        {/* 章节头 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="flex flex-col items-center gap-4"
        >
          <span className="scene-marker font-en">INSERT · A LETTER</span>
          <h3 className="font-kai cine-title text-3xl tracking-[0.3em]">
            {copy.birthday.date}
          </h3>
          <span className="font-kai text-base tracking-[0.3em] gold-text-cine">
            {copy.birthday.age} 岁
          </span>
          <span className="hairline-gold w-24" />
        </motion.div>

        {/* 主旨段 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.2 }}
          className="font-song text-[#F3EBDD]/85 text-base leading-loose text-center max-w-sm whitespace-pre-line"
        >
          {copy.birthday.body}
        </motion.p>

        {/* 信纸 */}
        <div className="w-full mt-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.4 }}
            className="relative px-7 py-10 bg-black/35 backdrop-blur-md rounded-sm film-sheen"
            style={{
              border: '1px solid rgba(201,163,104,0.22)',
              boxShadow: '0 24px 70px -18px rgba(0,0,0,0.7)',
            }}
          >
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 cine-eyebrow text-xs tracking-[0.3em] font-kai"
              style={{ background: '#130e08' }}
            >
              {copy.birthday.letterLead}
            </div>

            <div className="font-kai text-[#F3EBDD]/88 text-[15px] leading-[2.1] tracking-wide space-y-1">
              {copy.birthday.letter.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.6 + i * LETTER_DELAY / 1000 }}
                  className={`whitespace-pre-line ${i === 0 ? 'font-bold' : ''} ${
                    line === '' ? 'h-3' : ''
                  }`}
                >
                  {line}
                </motion.p>
              ))}
            </div>

            <div className="absolute -bottom-5 right-3">
              <ChineseSeal text="爱你" size={52} rotate={-8} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
