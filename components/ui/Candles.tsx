'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 蛋糕 + 蜡烛。点击蜡烛即可吹灭。
 * onAllBlown 在所有蜡烛熄灭后触发（带 ~800ms 延迟）。
 */
export default function Candles({
  count = 1,
  onAllBlown,
  onRecordWish,
}: {
  count?: number;
  onAllBlown?: () => void;
  onRecordWish?: () => void;
}) {
  const [lit, setLit] = useState<boolean[]>(() => Array(count).fill(true));
  const triggeredRef = useRef(false);

  // 全灭检测
  useEffect(() => {
    if (lit.every((v) => !v) && !triggeredRef.current) {
      triggeredRef.current = true;
      const t = setTimeout(() => onAllBlown?.(), 800);
      return () => clearTimeout(t);
    }
  }, [lit, onAllBlown]);

  const blow = (idx: number) =>
    setLit((arr) => arr.map((v, i) => (i === idx ? false : v)));

  const allBlown = lit.every((v) => !v);

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      {/* 蜡烛组 */}
      <div className="relative flex items-end justify-center gap-10 pt-12 pb-4">
        {lit.map((isLit, i) => (
          <Candle key={i} lit={isLit} onClick={() => blow(i)} />
        ))}
      </div>

      {/* 提示文案 / 录愿按钮 */}
      <AnimatePresence mode="wait">
        {!allBlown ? (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-song text-paper/60 text-sm tracking-[0.25em] mt-2"
          >
            点击吹灭蜡烛，许个愿
          </motion.p>
        ) : (
          <motion.button
            key="record"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRecordWish}
            className="mt-2 px-6 py-2.5 rounded-full font-kai text-sm tracking-[0.2em]"
            style={{
              background: 'linear-gradient(135deg, rgba(201,163,104,0.2) 0%, rgba(241,224,176,0.12) 100%)',
              border: '1px solid rgba(201,163,104,0.35)',
              color: '#F1E0B0',
            }}
          >
            🎙️ 录下愿望
          </motion.button>
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
      className="relative w-8 h-32 active:scale-95 transition-transform"
      style={{ touchAction: 'manipulation' }}
    >
      {/* 烛光在桌面的投影光圈 */}
      <AnimatePresence>
        {lit && (
          <motion.span
            key="table-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 0.7, 0.55, 0.65, 0.5] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-20 h-6 rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 50% 50%, rgba(255,170,80,0.35) 0%, rgba(255,140,50,0.12) 45%, transparent 75%)',
              filter: 'blur(4px)',
            }}
          />
        )}
      </AnimatePresence>

      {/* 蜡烛底座 — 托盘 */}
      <span
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full"
        style={{ background: 'rgba(255,240,220,0.12)' }}
      />

      {/* 蜡烛体 — 半透明蜡质感 */}
      <span
        className="absolute left-1/2 -translate-x-1/2 bottom-1 w-7 h-28 rounded-[3px] overflow-hidden"
        style={{
          background:
            'linear-gradient(90deg, rgba(255,235,210,0.08) 0%, rgba(255,248,235,0.22) 30%, rgba(255,252,245,0.28) 50%, rgba(255,248,235,0.22) 70%, rgba(255,235,210,0.08) 100%)',
          boxShadow: lit
            ? '0 0 24px rgba(255,190,90,0.3), 0 0 10px rgba(255,160,60,0.18), inset 0 0 12px rgba(255,220,180,0.18)'
            : 'inset 0 0 8px rgba(255,220,180,0.08)',
          border: '1px solid rgba(255,240,220,0.1)',
        }}
      >
        {/* 蜡油流淌 */}
        <span
          className="absolute top-0 left-0 right-0 h-2 rounded-b-full"
          style={{
            background:
              'radial-gradient(ellipse at 50% 100%, rgba(255,250,240,0.2) 0%, transparent 70%)',
          }}
        />
        {/* 竖向高光条 — 反光质感 */}
        <span
          className="absolute top-1 bottom-1 left-[5px] w-[2px] rounded-full"
          style={{
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
            filter: 'blur(0.5px)',
          }}
        />
        {/* 点燃时由顶部向下的暖色透光 */}
        {lit && (
          <span
            className="absolute top-0 left-0 right-0 h-10"
            style={{
              background:
                'linear-gradient(to bottom, rgba(255,180,90,0.35) 0%, transparent 100%)',
            }}
          />
        )}
      </span>

      {/* 烛芯 — 精确居中，点燃时顶部一点红炭 */}
      <span
        className="absolute left-1/2 -translate-x-1/2 w-[2px] h-3"
        style={{
          bottom: '112px',
          background: lit ? 'rgba(60,30,15,0.7)' : 'rgba(120,100,80,0.3)',
        }}
      />

      {/* 火焰区域 — 精确对齐烛芯顶部 */}
      <AnimatePresence>
        {lit && (
          <motion.div
            key="flame-zone"
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
            style={{ bottom: '115px' }}
            exit={{ opacity: 0 }}
          >
            {/* 大光晕 — 呼吸脉动 */}
            <motion.span
              key="glow-outer"
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: [0.85, 1, 0.9, 1, 0.85], scale: [1, 1.08, 1, 1.05, 1] }}
              exit={{ opacity: 0, scale: 0.2 }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(255,180,80,0.22) 0%, rgba(255,130,40,0.07) 40%, transparent 70%)',
                filter: 'blur(7px)',
              }}
            />
            {/* 中光晕 — 呼吸脉动 */}
            <motion.span
              key="glow-mid"
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: [0.9, 1, 0.92, 1, 0.9], scale: [1, 1.06, 0.98, 1.04, 1] }}
              exit={{ opacity: 0, scale: 0.2 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-9 h-11 rounded-full"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 60%, rgba(255,210,110,0.34) 0%, rgba(255,150,50,0.12) 50%, transparent 80%)',
                filter: 'blur(3px)',
              }}
            />
            {/* 火焰本体 — 水滴形，整体摇曳 */}
            <motion.div
              key="flame"
              initial={{ opacity: 0, scaleY: 0.3 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0.15, x: 14, rotate: 35, y: -6 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="relative"
              style={{ width: '14px', height: '26px', marginLeft: '-7px' }}
            >
              <motion.div
                animate={{
                  scaleY: [1, 1.14, 0.94, 1.08, 1],
                  scaleX: [1, 0.94, 1.05, 0.96, 1],
                  rotate: [-2, 2, -1.5, 2.5, -2],
                  x: [-0.5, 0.5, -0.3, 0.6, -0.5],
                }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '50% 88%' }}
                className="relative w-full h-full"
              >
                {/* 外焰 — 橙红 */}
                <span
                  className="absolute inset-0"
                  style={{
                    borderRadius: '50% 50% 50% 50% / 58% 58% 42% 42%',
                    background:
                      'radial-gradient(ellipse at 50% 78%, rgba(255,140,50,0.9) 0%, rgba(255,90,20,0.45) 55%, transparent 100%)',
                    filter: 'blur(1.5px)',
                  }}
                />
                {/* 内焰 — 金黄 */}
                <span
                  className="absolute inset-x-[2px] top-[3px] bottom-[3px]"
                  style={{
                    borderRadius: '50% 50% 50% 50% / 58% 58% 42% 42%',
                    background:
                      'radial-gradient(ellipse at 50% 68%, rgba(255,238,165,0.97) 0%, rgba(255,200,100,0.62) 50%, transparent 100%)',
                  }}
                />
                {/* 焰心 — 白热 */}
                <span
                  className="absolute inset-x-[4px] top-[5px] bottom-[7px]"
                  style={{
                    borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                    background: 'rgba(255,255,255,0.9)',
                    filter: 'blur(0.5px)',
                  }}
                />
                {/* 蓝色焰底 — 真实蜡烛特征 */}
                <span
                  className="absolute left-1/2 -translate-x-1/2 bottom-[1px] w-[6px] h-[7px]"
                  style={{
                    borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                    background:
                      'radial-gradient(ellipse at 50% 80%, rgba(120,170,255,0.7) 0%, rgba(90,140,255,0.3) 60%, transparent 100%)',
                    filter: 'blur(0.6px)',
                  }}
                />
              </motion.div>
            </motion.div>

            {/* 上升火星粒子 */}
            {[0, 1, 2].map((i) => (
              <motion.span
                key={`spark-${i}`}
                className="absolute left-1/2 bottom-2 w-[2px] h-[2px] rounded-full"
                style={{ background: 'rgba(255,200,120,0.9)' }}
                initial={{ opacity: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [-2, -22 - i * 6],
                  x: [0, (i - 1) * 5],
                  scale: [1, 0.4],
                }}
                transition={{
                  duration: 1.6 + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: 'easeOut',
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 熄灭后的青烟 — 蜿蜒上升 */}
      <AnimatePresence>
        {!lit && (
          <motion.span
            key="smoke"
            initial={{ opacity: 0.6, y: 0, scaleY: 1, x: 6 }}
            animate={{ opacity: 0, y: -38, scaleY: 2.4, x: [6, -3, 4, -2] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.4, ease: 'easeOut' }}
            className="absolute left-1/2 -translate-x-1/2 w-1 h-9 rounded-full pointer-events-none"
            style={{
              bottom: '115px',
              background:
                'linear-gradient(to top, rgba(200,200,200,0.35) 0%, transparent 100%)',
              filter: 'blur(2px)',
            }}
          />
        )}
      </AnimatePresence>
    </button>
  );
}
