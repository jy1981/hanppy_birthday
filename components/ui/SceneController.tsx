'use client';

import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CinemaFrame from './CinemaFrame';

const AUTO_NEXT_MS = 5000;
const ease = [0.22, 1, 0.36, 1] as const;

type Scene = {
  key: string;
  label: string;
  title: string;
  render: (onComplete: () => void) => ReactNode;
};

/**
 * SceneController — PPT 式场景切换控制器。
 *
 * - 每个场景占满一屏，通过唱片按钮切到下一个
 * - 左下角 ← 按钮返回上一个
 * - 支持左滑返回、右滑前进
 * - 5 秒自动切换到下一个场景（手动操作后重置计时）
 * - 场景间用电影交叉溶解过渡
 */
export default function SceneController({
  scenes,
}: {
  scenes: Scene[];
}) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const total = scenes.length;
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchRef = useRef({ x: 0, y: 0 });

  const goNext = useCallback(() => {
    setCurrent((c) => {
      if (c < total - 1) {
        setDirection(1);
        return c + 1;
      }
      return c;
    });
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrent((c) => {
      if (c > 0) {
        setDirection(-1);
        return c - 1;
      }
      return c;
    });
  }, []);

  // 场景内容播完后，等 5 秒自动切到下一个
  const handleSceneComplete = useCallback(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    autoTimerRef.current = setTimeout(goNext, AUTO_NEXT_MS);
  }, [goNext]);

  // 切换场景时清除上一个定时器
  useEffect(() => {
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [current]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dy = e.changedTouches[0].clientY - touchRef.current.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  const isFirst = current === 0;
  const isLast = current === total - 1;
  const currentScene = scenes[current];
  const progress = ((current + 1) / total) * 100;

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-[#060504]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* 开幕暗转 — 放映机点亮的一瞬，从纯黑淡入，衔接入场券与正片 */}
      <motion.div
        aria-hidden
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.1, ease, delay: 0.15 }}
        className="pointer-events-none fixed inset-0 z-[130] bg-black motion-reduce:hidden"
      />

      {/* 场景容器 */}
      <div className="relative w-full h-full gate-weave">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentScene.key}
            custom={direction}
            initial={{ opacity: 0, scale: 1.01 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.995 }}
            transition={{ duration: 0.9, ease }}
            className="absolute inset-0 w-full h-full"
          >
            {currentScene.render(handleSceneComplete)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 全站电影画框 — letterbox + 暗角 + 辉光 + 动态颗粒 */}
      <CinemaFrame />

      <AnimatePresence mode="wait">
        <motion.div
          key={`projection-${currentScene.key}`}
          initial={{ opacity: 0, x: direction > 0 ? '-60vw' : '100vw' }}
          animate={{ opacity: [0, 0.32, 0], x: direction > 0 ? '110vw' : '-70vw' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.9, ease }}
          className="pointer-events-none fixed inset-y-0 left-0 z-[120] w-[60vw] max-w-[360px]"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(241,224,176,0.08) 42%, rgba(255,255,255,0.18) 50%, rgba(212,166,86,0.08) 58%, transparent 100%)',
            filter: 'blur(18px)',
            mixBlendMode: 'screen',
          }}
        />
      </AnimatePresence>

      <div className="pointer-events-none fixed left-5 top-5 z-[200] flex flex-col gap-2 text-[#F3EBDD]/60">
        <motion.div
          key={currentScene.key}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="flex items-center gap-3"
        >
          <span className="font-en text-[10px] tracking-[0.35em] text-[#D4A656]/70">
            {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <span className="h-px w-8 bg-gradient-to-r from-[#D4A656]/55 to-transparent" />
          <span className="font-en text-[10px] tracking-[0.35em] uppercase">
            {currentScene.label}
          </span>
        </motion.div>
        <motion.div
          key={`${currentScene.key}-title`}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease }}
          className="font-kai text-xs tracking-[0.35em] text-[#F3EBDD]/45"
        >
          {currentScene.title}
        </motion.div>
      </div>

      {/* 返回按钮 — 左下角，第一个场景不显示 */}
      {!isFirst && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          whileTap={{ opacity: 1, scale: 0.9 }}
          onClick={goPrev}
          className="fixed bottom-8 left-6 z-[200] w-10 h-10 rounded-full flex items-center justify-center text-[#F3EBDD]/70 backdrop-blur-sm"
          style={{
            border: '1px solid rgba(201,163,104,0.25)',
            background: 'rgba(0,0,0,0.3)',
          }}
          aria-label="上一个场景"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </motion.button>
      )}

      {/* 唱片前进按钮 — 右下角，最后一个场景不显示 */}
      {!isLast && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileTap={{ scale: 1.15 }}
          onClick={goNext}
          className="fixed bottom-8 right-6 z-[200] w-14 h-14 rounded-full overflow-hidden flex items-center justify-center"
          style={{
            border: '1px solid rgba(201,163,104,0.35)',
            boxShadow: '0 0 20px rgba(0,0,0,0.4), 0 2px 12px rgba(212,166,86,0.15)',
          }}
          aria-label="下一个场景"
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
          {/* 中心小圆点 — 唱片轴心 */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full z-10"
            style={{
              background: 'rgba(212,166,86,0.9)',
              boxShadow: '0 0 6px rgba(212,166,86,0.5)',
            }}
          />
        </motion.button>
      )}

      {/* 场景进度指示器 — 底部电影胶片进度 */}
      <div className="pointer-events-none fixed bottom-10 left-1/2 z-[200] w-[34vw] max-w-[168px] min-w-[116px] -translate-x-1/2">
        <div className="relative h-px overflow-hidden rounded-full bg-[#C9A368]/20">
          <motion.span
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.65, ease }}
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#8C6E3A] via-[#F1E0B0] to-[#D4A656]"
            style={{ boxShadow: '0 0 12px rgba(212,166,86,0.45)' }}
          />
        </div>
        <div className="mt-2 flex justify-between">
          {scenes.map((s, i) => (
            <span
              key={s.key}
              className="h-1 w-px rounded-full transition-colors duration-500"
              style={{
                background: i <= current ? 'rgba(241,224,176,0.6)' : 'rgba(201,163,104,0.18)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
