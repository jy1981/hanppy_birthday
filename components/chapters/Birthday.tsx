'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { copy, photos, videos } from '@/lib/manifest';
import { PhotoSlot, VideoSlot } from '@/components/ui/MediaSlot';
import ChineseSeal from '@/components/ui/ChineseSeal';
import InkBrushDivider from '@/components/ui/InkBrushDivider';
import Reveal from '@/components/ui/Reveal';

/**
 * 生日章：以一个超大的「彤」字为主视觉，环绕花卉与她的特写，
 * 然后是一封长信（章内可滚动）。
 */
export default function Birthday() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const tongScale = useTransform(scrollYProgress, [0, 0.4, 0.7], [0.7, 1, 1.05]);
  const tongOpacity = useTransform(scrollYProgress, [0, 0.2, 0.6], [0, 1, 1]);

  const list = photos.birthday ?? [];

  return (
    <section
      ref={ref}
      className="chapter relative py-24"
      style={{
        background:
          'radial-gradient(circle at 50% 30%, #FFEFDC 0%, #FBD6CF 50%, #F5EDE0 100%)',
      }}
    >
      <div className="relative z-10 w-full max-w-md mx-auto px-8 flex flex-col items-center gap-12">
        {/* 大字 + 视频环绕 */}
        <div className="relative w-full flex items-center justify-center h-[60vh] min-h-[420px]">
          {/* 视频/AI 肖像（占位时为渐变） */}
          <div className="absolute inset-x-6 inset-y-0 rounded-sm overflow-hidden opacity-80">
            <VideoSlot
              src={videos.birthdayPortrait}
              className="absolute inset-0 w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-paper/90" />
          </div>

          {/* 大彤字 */}
          <motion.div
            style={{ scale: tongScale, opacity: tongOpacity }}
            className="relative z-10 select-none"
          >
            <span
              className="font-kai gold-text leading-none drop-shadow-soft"
              style={{ fontSize: 'clamp(180px, 55vw, 320px)' }}
            >
              {copy.birthday.title}
            </span>
            {/* 小印章 */}
            <div className="absolute -bottom-2 -right-2">
              <ChineseSeal text="生辰" size={56} rotate={-12} />
            </div>
          </motion.div>
        </div>

        {/* 副标题 */}
        <Reveal>
          <div className="flex flex-col items-center gap-3">
            <span className="font-en italic text-rouge text-sm tracking-[0.4em]">
              {copy.birthday.eyebrow}
            </span>
            <h3
              className="font-kai text-ink text-3xl tracking-[0.3em]"
              style={{ letterSpacing: '0.3em' }}
            >
              {copy.birthday.date}
            </h3>
            <span className="font-kai text-gold text-base tracking-[0.3em]">
              {copy.birthday.age} 岁
            </span>
            <InkBrushDivider color="#B03A48" width={200} />
          </div>
        </Reveal>

        {/* 她的三张照片 */}
        <div className="w-full grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <Reveal key={i} delay={0.05 + i * 0.1}>
              <PhotoSlot
                src={list[i]?.src}
                ratio="portrait"
                label={`她 · 0${i + 1}`}
              />
            </Reveal>
          ))}
        </div>

        {/* 主旨段 */}
        <Reveal delay={0.2}>
          <p className="font-song text-ink/80 text-base leading-loose text-center max-w-sm whitespace-pre-line">
            {copy.birthday.body}
          </p>
        </Reveal>

        {/* 一封信 */}
        <Reveal delay={0.3}>
          <div className="w-full mt-6 px-7 py-9 relative bg-paperSoft/85 border border-rouge/15 rounded-sm shadow-[0_12px_40px_-12px_rgba(176,58,72,0.18)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-paperSoft text-mist text-xs tracking-[0.3em] font-kai">
              {copy.birthday.letterLead}
            </div>
            <div className="font-kai text-ink/90 text-[15px] leading-[2] tracking-wide space-y-1 whitespace-pre-line">
              {copy.birthday.letter.map((line, i) => (
                <p key={i} className={i === 0 ? 'font-bold' : ''}>
                  {line}
                </p>
              ))}
            </div>
            <div className="absolute -bottom-5 right-3">
              <ChineseSeal text="爱你" size={52} rotate={-8} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
