'use client';

import { useState } from 'react';
import {
  motion,
  AnimatePresence,
} from 'framer-motion';
import { copy, videos } from '@/lib/manifest';
import { VideoSlot } from '@/components/ui/MediaSlot';
import Fireworks from '@/components/ui/Fireworks';
import Candles from '@/components/ui/Candles';
import ChineseSeal from '@/components/ui/ChineseSeal';
import WishRecorder from '@/components/ui/WishRecorder';

/**
 * 终章：吹蜡烛许愿 → 片尾演职员表（自动滚动）。
 */
export default function Finale() {
  const [wished, setWished] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showWishRecorder, setShowWishRecorder] = useState(false);

  if (showCredits) {
    return <CreditsRoll />;
  }

  return (
    <div className="relative w-full h-full overflow-hidden chapter night-texture vignette">
      {/* 远景烟花视频 */}
      <div className="absolute inset-0 z-0 opacity-40">
        <VideoSlot
          src={videos.finaleFireworks}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      <Fireworks active intensity={1} celebrate={wished} />

      <div className="relative z-[3] w-full max-w-md mx-auto px-8 py-16 flex flex-col items-center text-paper text-center h-full justify-between">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="flex flex-col items-center gap-3"
        >
          <span className="scene-marker font-en">FINAL SCENE</span>
          <h2
            className="font-kai gold-text"
            style={{
              fontSize: 'clamp(48px, 13vw, 72px)',
              letterSpacing: '0.3em',
            }}
          >
            {copy.finale.title}
          </h2>
          <p className="font-kai text-paper/85 text-base tracking-[0.3em] mt-2">
            {copy.finale.sub}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.3 }}
          className="my-6"
        >
          <Candles
            count={1}
            onAllBlown={() => setWished(true)}
            onRecordWish={() => setShowWishRecorder(true)}
          />
        </motion.div>

        <div className="min-h-[160px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!wished ? (
              <motion.p
                key="prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="font-song text-paper/70 text-sm tracking-[0.25em]"
              >
                点击吹灭蜡烛，许个愿
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

        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="font-song text-paper/40 text-[11px] tracking-[0.4em]"
        >
          {wished ? '轻触 ❤️ 进入片尾' : '继续 · 有彩蛋'}
        </motion.div>

        {/* 吹完蜡烛后显示唱片按钮触发片尾 */}
        {wished && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ scale: { duration: 0.5 } }}
            whileTap={{ scale: 1.15 }}
            onClick={() => setShowCredits(true)}
            className="fixed bottom-8 right-6 z-[200] w-14 h-14 rounded-full overflow-hidden flex items-center justify-center"
            style={{
              border: '1px solid rgba(201,163,104,0.35)',
              boxShadow: '0 0 20px rgba(0,0,0,0.4), 0 2px 12px rgba(212,166,86,0.15)',
            }}
            aria-label="进入片尾字幕"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="w-full h-full"
              style={{
                backgroundImage: 'url(/media/photos/round_bt.jpeg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full z-10"
              style={{
                background: 'rgba(212,166,86,0.9)',
                boxShadow: '0 0 6px rgba(212,166,86,0.5)',
              }}
            />
          </motion.button>
        )}
      </div>

      {/* 录音愿望弹窗 */}
      {showWishRecorder && (
        <WishRecorder onClose={() => setShowWishRecorder(false)} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function CreditsRoll() {
  const credits = copy.finale.credits;

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#040302]">
      {/* 片尾放映光束 — 顶部一束缓慢呼吸的暖光，像放映机仍在转动 */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.5, 0.35] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute left-1/2 top-0 h-[45%] w-[130%] -translate-x-1/2"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(212,166,86,0.10) 0%, rgba(212,166,86,0.03) 45%, transparent 72%)',
          filter: 'blur(34px)',
        }}
      />

      <motion.div
        initial={{ y: '80vh' }}
        animate={{ y: '-130%' }}
        transition={{ duration: 28, ease: 'linear' }}
        className="absolute inset-x-0 z-[2] w-full max-w-md mx-auto px-8 flex flex-col items-center gap-12 text-center"
      >
        {/* 片名重现 */}
        <div className="flex flex-col items-center gap-5 mb-10">
          <span className="scene-marker font-en">THE END · CREDITS</span>
          <span className="font-kai cine-title text-5xl tracking-[0.35em]" style={{ textIndent: '0.35em' }}>
            {copy.cover.title}
          </span>
          <span className="hairline-gold w-20" />
        </div>

        {/* 演职员表 */}
        {credits.map((c, i) => (
          <div key={i} className="flex flex-col items-center gap-2.5">
            <span className="credit-role font-song">{c.role}</span>
            <span className="credit-name font-kai text-xl">{c.name}</span>
          </div>
        ))}

        {/* 彩蛋 */}
        <div className="mt-16 flex flex-col items-center gap-8">
          <span className="hairline-gold w-16" />
          <p className="font-kai text-[#D4A656]/90 text-base tracking-[0.2em]">
            {copy.finale.afterCredits}
          </p>
          <span className="font-en italic text-[#F3EBDD]/30 text-[11px] tracking-[0.35em]">
            MADE WITH ♡ · FOR TONGTONG
          </span>
        </div>
      </motion.div>
    </div>
  );
}
