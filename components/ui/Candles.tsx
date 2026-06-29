'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 蛋糕 + 蜡烛。支持"吹蜡烛"——
 * 1) 点击蜡烛立刻熄灭
 * 2) （可选）开启麦克风，检测音量超过阈值则吹熄所有
 *
 * onAllBlown 在所有蜡烛熄灭后触发（带 ~600ms 延迟）。
 */
export default function Candles({
  count = 3,
  onAllBlown,
}: {
  count?: number;
  onAllBlown?: () => void;
}) {
  const [lit, setLit] = useState<boolean[]>(() => Array(count).fill(true));
  const [micOn, setMicOn] = useState(false);
  const [micErr, setMicErr] = useState<string | null>(null);
  const triggeredRef = useRef(false);

  // 全灭检测
  useEffect(() => {
    if (lit.every((v) => !v) && !triggeredRef.current) {
      triggeredRef.current = true;
      const t = setTimeout(() => onAllBlown?.(), 600);
      return () => clearTimeout(t);
    }
  }, [lit, onAllBlown]);

  const blow = (idx: number) =>
    setLit((arr) => arr.map((v, i) => (i === idx ? false : v)));

  const blowAll = () => setLit((arr) => arr.map(() => false));

  const relight = () => {
    triggeredRef.current = false;
    setLit(Array(count).fill(true));
  };

  // 麦克风
  useEffect(() => {
    if (!micOn) return;
    let ctx: AudioContext | null = null;
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        ctx = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        src.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          if (stopped) return;
          analyser.getByteFrequencyData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) sum += data[i];
          const avg = sum / data.length;
          if (avg > 55) {
            blowAll();
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch (e) {
        setMicErr('无法访问麦克风，可点击蜡烛吹灭');
        setMicOn(false);
      }
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      ctx?.close().catch(() => {});
    };
  }, [micOn]);

  const allBlown = lit.every((v) => !v);

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      {/* 蜡烛组 — 纯 CSS，无蛋糕 */}
      <div className="relative flex items-end justify-center gap-8 pt-8">
        {lit.map((isLit, i) => (
          <Candle key={i} lit={isLit} onClick={() => blow(i)} />
        ))}
      </div>

      {/* 控制按钮 */}
      <div className="flex gap-3 items-center mt-2">
        {!allBlown && (
          <>
            <button
              type="button"
              onClick={() => setMicOn((v) => !v)}
              className="px-4 py-2 rounded-full border border-gold/60 bg-paper/40 backdrop-blur-md text-paper text-sm font-kai tracking-widest active:scale-95"
            >
              {micOn ? '聆听中…对它吹气' : '🎤 开麦吹蜡烛'}
            </button>
            <button
              type="button"
              onClick={blowAll}
              className="px-4 py-2 rounded-full border border-gold/60 bg-paper/40 backdrop-blur-md text-paper text-sm font-kai tracking-widest active:scale-95"
            >
              一口气吹灭
            </button>
          </>
        )}
        {allBlown && (
          <button
            type="button"
            onClick={relight}
            className="px-4 py-2 rounded-full border border-gold/60 bg-paper/30 text-paper/80 text-sm font-kai tracking-widest active:scale-95"
          >
            再许一次愿
          </button>
        )}
      </div>
      <AnimatePresence>
        {micErr && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-paper/60 mt-1"
          >
            {micErr}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Candle({ lit, onClick }: { lit: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={lit ? '吹熄蜡烛' : '蜡烛已熄'}
      className="relative w-5 h-20 active:scale-95 transition-transform"
    >
      {/* 蜡烛体 */}
      <span
        className="absolute inset-x-1 bottom-0 top-2 rounded-sm"
        style={{
          background:
            'linear-gradient(90deg, rgba(255,240,220,0.15) 0%, rgba(255,250,240,0.35) 50%, rgba(255,240,220,0.15) 100%)',
          boxShadow: lit
            ? '0 0 12px rgba(255,200,100,0.3), inset 0 0 8px rgba(255,220,180,0.2)'
            : 'none',
        }}
      />
      {/* 蜡烛芯 */}
      <span className="absolute left-1/2 -translate-x-1/2 top-0 w-px h-3 bg-paper/40" />

      {/* 火焰 */}
      <AnimatePresence>
        {lit && (
          <>
            {/* 外层光晕 */}
            <motion.span
              key="glow"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.3 }}
              transition={{ duration: 0.4 }}
              className="absolute left-1/2 -translate-x-1/2 -top-6 w-12 h-12 rounded-full pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, rgba(255,180,80,0.25) 0%, rgba(255,140,40,0.08) 40%, transparent 70%)',
                filter: 'blur(4px)',
              }}
            />
            {/* 火焰本体 */}
            <motion.span
              key="flame"
              initial={{ opacity: 0, y: 4, scale: 0.6 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{ opacity: 0, y: -8, scale: 0.3 }}
              transition={{ duration: 0.4 }}
              className="absolute left-1/2 -translate-x-1/2 -top-4 pointer-events-none"
            >
              <motion.div
                animate={{
                  scaleY: [1, 1.15, 0.92, 1.08, 1],
                  scaleX: [1, 0.94, 1.06, 0.96, 1],
                  rotate: [-1.5, 1.5, -1, 1.5, -1.5],
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '50% 90%' }}
                className="relative w-3 h-5 rounded-full"
              >
                {/* 外焰 */}
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'radial-gradient(ellipse at 50% 80%, rgba(255,160,60,0.9) 0%, rgba(255,100,30,0.5) 60%, transparent 100%)',
                    filter: 'blur(1px)',
                  }}
                />
                {/* 内焰 */}
                <span
                  className="absolute inset-x-0.5 top-0.5 bottom-1.5 rounded-full"
                  style={{
                    background:
                      'radial-gradient(ellipse at 50% 70%, rgba(255,240,180,0.95) 0%, rgba(255,200,100,0.7) 50%, transparent 100%)',
                  }}
                />
                {/* 焰心 */}
                <span
                  className="absolute inset-x-1 top-1 bottom-2 rounded-full bg-white/80"
                  style={{ filter: 'blur(0.5px)' }}
                />
              </motion.div>
            </motion.span>
          </>
        )}
      </AnimatePresence>

      {/* 熄灭后的烟 */}
      <AnimatePresence>
        {!lit && (
          <motion.span
            key="smoke"
            initial={{ opacity: 0.4, y: 0 }}
            animate={{ opacity: 0, y: -24 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute left-1/2 -translate-x-1/2 top-0 w-1 h-6 rounded-full bg-paper/20 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </button>
  );
}
