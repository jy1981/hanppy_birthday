'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { copy } from '@/lib/manifest';
import FilmGrain from '@/components/ui/FilmGrain';

/**
 * 电影开场 — 首映式入场券。
 * 黑幕 + 制片方字幕 + 长按「开始放映」，
 * 长按手势同时解锁音频自动播放。
 */
export default function EntryGate({ onEnter }: { onEnter: () => void }) {
  const [progress, setProgress] = useState(0);
  const [closing, setClosing] = useState(false);
  const holdRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const HOLD_MS = 1200;

  const start = () => {
    startRef.current = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - startRef.current) / HOLD_MS);
      setProgress(p);
      if (p < 1) {
        holdRef.current = requestAnimationFrame(tick);
      } else {
        // 请求全屏
        const el = document.documentElement;
        el.requestFullscreen?.().catch(() => {});
        setClosing(true);
        setTimeout(onEnter, 1100);
      }
    };
    holdRef.current = requestAnimationFrame(tick);
  };

  const cancel = () => {
    if (holdRef.current) cancelAnimationFrame(holdRef.current);
    holdRef.current = null;
    if (!closing) setProgress(0);
  };

  useEffect(() => () => cancel(), []);

  return (
    <AnimatePresence>
      {!closing && (
        <motion.div
          key="gate"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] bg-[#060504] flex items-center justify-center overflow-hidden"
        >
          {/* 一束极暗的顶光 */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '-20%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              height: '70%',
              background:
                'radial-gradient(ellipse at center, rgba(212,166,86,0.10) 0%, transparent 65%)',
              filter: 'blur(50px)',
            }}
          />
          <FilmGrain opacity={0.08} />

          {/* 中央内容 */}
          <div className="relative z-10 flex flex-col items-center gap-0 text-center px-8">
            {/* 制片方字幕 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1.4 }}
              className="scene-marker font-en mb-10"
            >
              A FILM BY YOUR HUSBAND
            </motion.div>

            {/* 片名 — 烫金逐字浮现 */}
            <div className="flex items-center justify-center" style={{ gap: '0.05em' }}>
              {copy.cover.title.split('').map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{
                    duration: 1.4,
                    delay: 0.9 + i * 0.25,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="font-kai gold-text-cine text-7xl sm:text-8xl leading-none"
                  style={{
                    textIndent: '0.35em',
                    textShadow: '0 2px 40px rgba(0,0,0,0.5), 0 0 60px rgba(212,166,86,0.2)',
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </div>

            {/* 副题 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 1.2 }}
              className="mt-8 flex flex-col items-center gap-4"
            >
              <span className="hairline-gold w-20" />
              <span className="font-song text-xs tracking-[0.5em] text-[#F3EBDD]/50">
                {copy.cover.eyebrow} · 两周年纪念作品
              </span>
              <span className="font-en italic text-[11px] tracking-[0.4em] text-[#D4A656]/60">
                PREMIERE · 2026.07.06
              </span>
            </motion.div>

            {/* 长按开始放映 */}
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.6, duration: 1 }}
              onPointerDown={start}
              onPointerUp={cancel}
              onPointerLeave={cancel}
              onPointerCancel={cancel}
              className="relative mt-16 select-none"
              aria-label="长按开始放映"
              style={{ touchAction: 'manipulation' }}
            >
              {/* 外层金色脉冲光环 — 长按时呼吸扩散 */}
              {progress > 0 && (
                <>
                  <motion.span
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      boxShadow: `0 0 ${30 + progress * 50}px rgba(212,166,86,${0.15 + progress * 0.3})`,
                    }}
                  />
                  <motion.span
                    initial={{ scale: 1, opacity: 0.3 }}
                    animate={{ scale: [1, 1.55, 1], opacity: [0.25, 0, 0.25] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      boxShadow: `0 0 ${40 + progress * 60}px rgba(241,224,176,${0.1 + progress * 0.2})`,
                    }}
                  />
                </>
              )}

              {/* 旋转金色光束 — 长按时出现 */}
              {progress > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: progress * 0.7, rotate: 360 }}
                  transition={{ rotate: { duration: 8, repeat: Infinity, ease: 'linear' }, opacity: { duration: 0.3 } }}
                  className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
                >
                  <div
                    className="absolute inset-[-50%]"
                    style={{
                      background: `conic-gradient(from 0deg, transparent 0deg, rgba(212,166,86,${0.15 + progress * 0.25}) 30deg, transparent 60deg, transparent 180deg, rgba(241,224,176,${0.1 + progress * 0.2}) 210deg, transparent 240deg)`,
                    }}
                  />
                </motion.div>
              )}

              {/* 金色粒子 — 长按时向上飘散 */}
              {progress > 0 && (
                <div className="absolute inset-0 pointer-events-none overflow-visible">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                      animate={{
                        opacity: [0, progress * 0.9, 0],
                        y: [-10 - i * 12, -50 - i * 18],
                        x: [(i - 3) * 6, (i - 3) * 14],
                        scale: [0, 1, 0.3],
                      }}
                      transition={{
                        duration: 2 + i * 0.3,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: 'easeOut',
                      }}
                      className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full"
                      style={{
                        background: i % 2 === 0 ? '#D4A656' : '#F1E0B0',
                        boxShadow: '0 0 6px rgba(212,166,86,0.8)',
                      }}
                    />
                  ))}
                </div>
              )}

              <span
                className="flex w-28 h-28 rounded-full items-center justify-center font-kai text-sm tracking-[0.35em] text-[#F3EBDD]/85"
                style={{
                  border: `1px solid rgba(201,163,104,${0.35 + progress * 0.4})`,
                  background: `rgba(212,166,86,${0.05 + progress * 0.08})`,
                  backdropFilter: 'blur(4px)',
                  textIndent: '0.35em',
                  boxShadow:
                    progress > 0
                      ? `0 0 ${20 + progress * 50}px rgba(212,166,86,${0.15 + progress * 0.35}), inset 0 0 ${10 + progress * 20}px rgba(241,224,176,${0.05 + progress * 0.15})`
                      : 'none',
                  transition: 'box-shadow 0.15s, border-color 0.15s, background 0.15s',
                }}
              >
                放 映
              </span>
              {/* 进度环 */}
              <svg
                className="absolute inset-0 -rotate-90"
                viewBox="0 0 100 100"
                aria-hidden
              >
                <circle
                  cx="50"
                  cy="50"
                  r="49"
                  fill="none"
                  stroke="rgba(201,163,104,0.15)"
                  strokeWidth="1"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="49"
                  fill="none"
                  stroke="#D4A656"
                  strokeWidth="1.5"
                  strokeDasharray={2 * Math.PI * 49}
                  strokeDashoffset={2 * Math.PI * 49 * (1 - progress)}
                  strokeLinecap="round"
                  style={{
                    transition: 'stroke-dashoffset 0.08s linear',
                    filter: progress > 0
                      ? `drop-shadow(0 0 ${4 + progress * 8}px rgba(212,166,86,${0.5 + progress * 0.5}))`
                      : 'none',
                  }}
                />
              </svg>
            </motion.button>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0.3, 0.5] }}
              transition={{ delay: 3.2, duration: 3, repeat: Infinity }}
              className="mt-6 font-song text-[11px] tracking-[0.4em] text-[#F3EBDD]/35"
            >
              长按 · 开始放映
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
