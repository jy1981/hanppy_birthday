'use client';

import { copy, photos } from '@/lib/manifest';
import { PhotoSlot } from '@/components/ui/MediaSlot';
import Reveal from '@/components/ui/Reveal';
import InkBrushDivider from '@/components/ui/InkBrushDivider';
import ChineseSeal from '@/components/ui/ChineseSeal';

/**
 * 宝宝降生章。主视觉：一张大照片（宝宝的小手 / 第一张合影）
 *             + 大字「初啼」+ 父亲视角短句。
 */
export default function Baby() {
  const list = photos.baby ?? [];

  return (
    <section
      className="chapter relative py-24"
      style={{
        background:
          'linear-gradient(180deg, #FBF6EC 0%, #FFE9D6 45%, #F5E1D0 100%)',
      }}
    >
      {/* 极淡的「囍」「家」氛围水印 */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-start justify-center pointer-events-none select-none pt-24"
      >
        <span
          className="font-kai text-rouge/[0.05] leading-none"
          style={{ fontSize: 'min(70vw, 460px)', fontWeight: 900 }}
        >
          家
        </span>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-8 flex flex-col items-center gap-10">
        {/* 章标 */}
        <Reveal>
          <div className="flex flex-col items-center gap-3">
            <span className="font-en italic text-rouge text-sm tracking-[0.4em]">
              {copy.baby.eyebrow}
            </span>
            <h2
              className="font-kai text-ink"
              style={{ fontSize: 'clamp(56px, 14vw, 80px)', letterSpacing: '0.4em' }}
            >
              {copy.baby.title}
            </h2>
            <div className="font-kai text-rouge text-2xl tracking-[0.3em]">
              {copy.baby.date}
            </div>
            <div className="font-en text-mist text-xs tracking-[0.4em] mt-1">
              {copy.baby.dateSub}
            </div>
            <InkBrushDivider color="#B03A48" width={200} />
          </div>
        </Reveal>

        {/* 主照片：宝宝的小手 / 第一张合影 */}
        <Reveal delay={0.1}>
          <div className="relative w-[78vw] max-w-[320px]">
            <PhotoSlot
              src={list[0]?.src}
              ratio="portrait"
              label="第一张合照"
              className="shadow-2xl"
            />
            <div className="absolute -bottom-3 -right-3">
              <ChineseSeal text="为人父母" size={56} rotate={-8} color="#B03A48" />
            </div>
          </div>
        </Reveal>

        {/* 主旨段 */}
        <Reveal delay={0.2}>
          <p className="font-song text-ink/85 text-base leading-loose text-center max-w-sm whitespace-pre-line">
            {copy.baby.body}
          </p>
        </Reveal>

        {/* 两张小图：宝宝小手 / 妈妈抱宝宝 */}
        <div className="w-full grid grid-cols-2 gap-2">
          <Reveal delay={0.25}>
            <PhotoSlot src={list[1]?.src} ratio="square" label="小手" />
          </Reveal>
          <Reveal delay={0.35}>
            <PhotoSlot src={list[2]?.src} ratio="square" label="妈妈与你" />
          </Reveal>
        </div>

        {/* 父亲视角 */}
        <Reveal delay={0.35}>
          <p className="font-kai text-ink/80 text-[15px] leading-[2] text-center whitespace-pre-line max-w-sm">
            {copy.baby.sub}
          </p>
        </Reveal>

        {/* 父亲落款 */}
        <Reveal delay={0.45}>
          <div className="flex items-center gap-3 mt-2">
            <span className="h-px w-12 bg-mist/40" />
            <span className="font-en italic text-mist text-xs tracking-[0.3em]">
              {copy.baby.fatherNote}
            </span>
            <span className="h-px w-12 bg-mist/40" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
