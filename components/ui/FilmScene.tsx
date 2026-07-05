'use client';

import { useState, useEffect, useCallback, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Photo } from '@/lib/manifest';
import Petals from './Petals';

const TITLE_DURATION = 3000;
const PHOTO_DURATION = 5600;
const CROSSFADE = 1300;

const toneFilter: Record<string, string> = {
  amber: 'saturate(0.88) contrast(1.05) brightness(0.9) sepia(0.1)',
  warm: 'saturate(0.9) contrast(1.06) brightness(0.88) sepia(0.16)',
  night: 'saturate(0.8) contrast(1.1) brightness(0.72) hue-rotate(-8deg)',
  rose: 'saturate(0.94) contrast(1.05) brightness(0.86) sepia(0.08)',
};

/**
 * FilmScene — 电影长镜头场景（自动播放版）。
 *
 * - 先显示章节 title card
 * - 然后自动定时切换照片（交叉溶解 + 缓慢推近）
 * - 底部字幕随照片浮现
 * - 不再依赖滚动
 */
export default function FilmScene({
  scene,
  titleZh,
  titleEn,
  photos,
  tone = 'amber',
  onComplete,
}: {
  scene: string;
  titleZh: string;
  titleEn?: string;
  photos: Photo[];
  tone?: 'amber' | 'warm' | 'night' | 'rose';
  onComplete?: () => void;
}) {
  const [phase, setPhase] = useState<'title' | 'photo'>('title');
  const [photoIndex, setPhotoIndex] = useState(0);

  const next = useCallback(() => {
    setPhotoIndex((i) => {
      if (i < photos.length - 1) return i + 1;
      return i;
    });
  }, [photos.length]);

  useEffect(() => {
    if (phase === 'title') {
      const t = setTimeout(() => setPhase('photo'), TITLE_DURATION);
      return () => clearTimeout(t);
    }
    if (phase === 'photo' && photoIndex < photos.length - 1) {
      const t = setTimeout(next, PHOTO_DURATION);
      return () => clearTimeout(t);
    }
    // 最后一张照片播完后通知场景控制器
    if (phase === 'photo' && photoIndex === photos.length - 1 && onComplete) {
      const t = setTimeout(onComplete, PHOTO_DURATION);
      return () => clearTimeout(t);
    }
  }, [phase, photoIndex, next, photos.length, onComplete]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#060504]">
      {/* ============ Title Card ============ */}
      <AnimatePresence>
        {phase === 'title' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: CROSSFADE / 1000, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-[3] flex flex-col items-center justify-center gap-7 px-8"
          >
            <motion.span
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="hairline-gold w-12"
            />
            <div className="scene-marker font-en">SCENE {scene}</div>
            <motion.h2
              initial={{ letterSpacing: '0.65em', opacity: 0 }}
              animate={{ letterSpacing: '0.3em', opacity: 1 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              className="font-kai cine-title text-halation text-6xl sm:text-7xl"
            >
              {titleZh}
            </motion.h2>
            {titleEn && (
              <div className="font-en italic text-sm tracking-[0.35em] text-[#D4A656]/70">
                {titleEn}
              </div>
            )}
            <span className="hairline-gold w-24" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ 照片序列 ============ */}
      <AnimatePresence mode="popLayout">
        {phase === 'photo' && photos[photoIndex] && (
          <PhotoFrame
            key={photos[photoIndex].src}
            photo={photos[photoIndex]}
            tone={tone}
            duration={PHOTO_DURATION}
            index={photoIndex}
          />
        )}
      </AnimatePresence>

      {/* 每次换片时的一束柔光 halation — 模拟胶片过曝的接片闪光 */}
      {phase === 'photo' && (
        <motion.div
          key={`flash-${photoIndex}`}
          initial={{ opacity: 0.28 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 z-[4] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 42%, rgba(245,224,176,0.55) 0%, rgba(212,166,86,0.18) 40%, transparent 72%)',
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* 樱花飘落 — 仅 rose tone（婚纱场景） */}
      {tone === 'rose' && <Petals count={14} variant="sakura" />}

      {/* 暗角 + 底部渐变 + 颗粒 */}
      <div className="absolute inset-0 pointer-events-none z-[5] vignette" />
      <div
        className="absolute inset-x-0 bottom-0 h-[38%] pointer-events-none z-[5]"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.88) 100%)',
        }}
      />

      {/* 右上角常驻场景编号 */}
      <div className="absolute top-6 right-6 z-[6] scene-marker font-en">
        SC {scene}
      </div>

      {/* 照片进度小点 */}
      {phase === 'photo' && photos.length > 1 && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[6] flex gap-1.5">
          {photos.map((_, i) => (
            <span
              key={i}
              className="rounded-full transition-all duration-500"
              style={{
                width: i === photoIndex ? 12 : 4,
                height: 4,
                background:
                  i === photoIndex
                    ? 'rgba(212,166,86,0.6)'
                    : 'rgba(201,163,104,0.15)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

const PhotoFrame = forwardRef<HTMLDivElement, {
  photo: Photo;
  tone: string;
  duration: number;
  index: number;
}>(function PhotoFrame({ photo, tone, duration, index }, ref) {
  // 交替运镜方向：奇偶张照片往相反方向缓慢平移，避免每张都一样
  const dir = index % 2 === 0 ? 1 : -1;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: CROSSFADE / 1000, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 z-[2]"
    >
      {/* 照片 + 缓慢推近 + 交替平移 + 入场对焦（rack focus 落定） */}
      <motion.div
        initial={{ scale: 1.14, x: dir * 14, y: -8, filter: 'blur(12px)' }}
        animate={{ scale: 1.02, x: dir * -14, y: 6, filter: 'blur(0px)' }}
        transition={{
          scale: { duration: duration / 1000, ease: 'linear' },
          x: { duration: duration / 1000, ease: 'linear' },
          y: { duration: duration / 1000, ease: 'linear' },
          filter: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
        }}
        className="absolute inset-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.src}
          alt={photo.alt ?? ''}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: toneFilter[tone] }}
        />
      </motion.div>

      {/* 底部电影字幕 */}
      {photo.caption && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-0 bottom-[10vh] z-[6] flex flex-col items-center gap-3 px-10 text-center"
        >
          <motion.span
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="hairline-gold w-10"
          />
          <p className="font-kai film-caption text-lg sm:text-xl">
            {photo.caption}
          </p>
          {photo.sub && (
            <p className="font-song film-caption-sub">{photo.sub}</p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
});
