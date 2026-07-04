'use client';

import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AUTO_NEXT_MS = 5000;

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
  scenes: { key: string; render: (onComplete: () => void) => ReactNode }[];
}) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const total = scenes.length;
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // 触摸滑动
  const touchRef = { x: 0, y: 0 };
  const onTouchStart = (e: React.TouchEvent) => {
    touchRef.x = e.touches[0].clientX;
    touchRef.y = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchRef.x;
    const dy = e.changedTouches[0].clientY - touchRef.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  const isFirst = current === 0;
  const isLast = current === total - 1;

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-[#060504]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* 场景容器 */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={scenes[current].key}
            custom={direction}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            {scenes[current].render(handleSceneComplete)}
          </motion.div>
        </AnimatePresence>
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

      {/* 场景进度指示器 — 底部居中小圆点 */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex gap-1.5">
        {scenes.map((s, i) => (
          <span
            key={s.key}
            className="rounded-full transition-all duration-500"
            style={{
              width: i === current ? 16 : 4,
              height: 4,
              background: i === current ? 'rgba(212,166,86,0.7)' : 'rgba(201,163,104,0.2)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
