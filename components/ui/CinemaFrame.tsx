'use client';

import { motion } from 'framer-motion';
import FilmGrain from './FilmGrain';
import DustMotes from './DustMotes';

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * CinemaFrame — 全站统一的电影画框。
 *
 * 覆盖在所有场景之上（但在交互控件之下），把整部作品裹进一个
 * 恒定的「放映腔」里：上下 letterbox 黑边 + 金色内沿细线、四周暗角、
 * 顶部一束暖色 halation 辉光、以及贯穿全片的动态胶片颗粒。
 *
 * 全程 pointer-events-none，不拦截任何点击/滑动。
 */
export default function CinemaFrame() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[90]" aria-hidden>
      {/* 顶部 letterbox 黑边 */}
      <motion.div
        initial={{ height: '18vh', opacity: 1 }}
        animate={{ height: 'clamp(20px, 4.5vh, 52px)', opacity: 1 }}
        transition={{ duration: 1.4, ease, delay: 0.2 }}
        className="absolute inset-x-0 top-0 bg-black"
        style={{ boxShadow: '0 6px 18px rgba(0,0,0,0.55)' }}
      >
        <span
          className="absolute inset-x-0 bottom-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(201,163,104,0.35) 30%, rgba(241,224,176,0.5) 50%, rgba(201,163,104,0.35) 70%, transparent)',
          }}
        />
      </motion.div>

      {/* 底部 letterbox 黑边 */}
      <motion.div
        initial={{ height: '18vh', opacity: 1 }}
        animate={{ height: 'clamp(20px, 4.5vh, 52px)', opacity: 1 }}
        transition={{ duration: 1.4, ease, delay: 0.2 }}
        className="absolute inset-x-0 bottom-0 bg-black"
        style={{ boxShadow: '0 -6px 18px rgba(0,0,0,0.55)' }}
      >
        <span
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(201,163,104,0.35) 30%, rgba(241,224,176,0.5) 50%, rgba(201,163,104,0.35) 70%, transparent)',
          }}
        />
      </motion.div>

      {/* 统一暗角 — 四周压暗聚焦中心 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 78% 70% at 50% 46%, transparent 42%, rgba(0,0,0,0.28) 78%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      {/* 全局电影调色层 — teal/orange 印片：冷暗角 + 暖高光，soft-light 融合 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 80% at 50% 42%, rgba(232,190,120,0.10) 0%, rgba(150,120,70,0.03) 45%, transparent 62%), linear-gradient(180deg, rgba(20,40,55,0.14) 0%, transparent 30%, transparent 68%, rgba(14,30,44,0.18) 100%)',
          mixBlendMode: 'soft-light',
        }}
      />

      {/* 镜头边缘辉光 — 极轻微的内沿冷光，模拟镜头边缘的色散/柔散 */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow:
            'inset 0 0 120px rgba(0,0,0,0.4), inset 0 0 40px rgba(60,90,120,0.06)',
        }}
      />

      {/* 顶部暖色 halation 辉光 — 像放映机的一束光 */}
      <div
        className="absolute left-1/2 top-0 h-[38%] w-[120%] -translate-x-1/2"
        style={{
          opacity: 0.65,
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(212,166,86,0.10) 0%, rgba(212,166,86,0.04) 40%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      {/* 放映机光束里的浮动光尘 */}
      <DustMotes count={8} />

      {/* 贯穿全片的胶片颗粒 */}
      <FilmGrain opacity={0.05} className="motion-safe:opacity-100 motion-reduce:opacity-[0.03]" />
    </div>
  );
}
