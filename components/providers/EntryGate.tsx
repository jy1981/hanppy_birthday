'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { copy } from '@/lib/manifest';
import FloralCorner from '@/components/ui/FloralCorner';

/**
 * 入场门：长按 1.2 秒进入，用户手势同时解锁音频自动播放
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
        setClosing(true);
        // 等关门动画结束再切
        setTimeout(onEnter, 900);
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
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[100] paper-texture flex items-center justify-center"
        >
          {/* 左右开门 */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: closing ? '-100%' : 0 }}
            transition={{ duration: 0.9, ease: [0.7, 0, 0.3, 1] }}
            className="absolute inset-y-0 left-0 w-1/2 bg-[#B03A48]/95"
            style={{ boxShadow: 'inset -20px 0 60px rgba(0,0,0,0.4)' }}
          >
            <div className="absolute right-0 inset-y-0 w-1 bg-gold/80" />
            <div className="absolute top-1/2 right-2 -translate-y-1/2 w-3 h-3 rounded-full bg-gold shadow-[0_0_12px_#C9A368]" />
          </motion.div>
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: closing ? '100%' : 0 }}
            transition={{ duration: 0.9, ease: [0.7, 0, 0.3, 1] }}
            className="absolute inset-y-0 right-0 w-1/2 bg-[#B03A48]/95"
            style={{ boxShadow: 'inset 20px 0 60px rgba(0,0,0,0.4)' }}
          >
            <div className="absolute left-0 inset-y-0 w-1 bg-gold/80" />
            <div className="absolute top-1/2 left-2 -translate-y-1/2 w-3 h-3 rounded-full bg-gold shadow-[0_0_12px_#C9A368]" />
          </motion.div>

          {/* 中央：浮在两扇门上的引导 */}
          <div className="relative z-10 flex flex-col items-center gap-10 text-center px-8 pointer-events-none">
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="font-kai text-paper text-2xl tracking-[0.5em]"
            >
              壹 份 小 礼 物
            </motion.div>
            <motion.h1
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 1.2 }}
              className="font-kai text-paper text-7xl tracking-[0.3em] drop-shadow-soft"
              style={{ writingMode: 'horizontal-tb' }}
            >
              致 {copy.her}
            </motion.h1>

            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              onPointerDown={start}
              onPointerUp={cancel}
              onPointerLeave={cancel}
              onPointerCancel={cancel}
              className="pointer-events-auto relative mt-4 select-none"
              aria-label="长按进入"
            >
              <span className="block w-32 h-32 rounded-full border border-gold/70 bg-paper/10 backdrop-blur-sm flex items-center justify-center font-kai text-paper text-lg tracking-[0.3em]">
                长 按
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
                  r="48"
                  fill="none"
                  stroke="#C9A368"
                  strokeWidth="2"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - progress)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.08s linear' }}
                />
              </svg>
            </motion.button>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 1 }}
              className="font-song text-paper/80 text-sm tracking-[0.3em]"
            >
              · 推 开 这 扇 门 ·
            </motion.div>
          </div>

          {/* 四角花卉 */}
          <FloralCorner color="#C9A368" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
