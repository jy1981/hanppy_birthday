'use client';

import { copy, photos } from '@/lib/manifest';
import { PhotoSlot } from '@/components/ui/MediaSlot';
import Reveal from '@/components/ui/Reveal';
import ChineseSeal from '@/components/ui/ChineseSeal';

export default function Wedding() {
  const list = photos.wedding ?? [];

  return (
    <section
      className="chapter relative py-24"
      style={{
        background:
          'linear-gradient(180deg, #FBF6EC 0%, #F1DCD8 50%, #FBF6EC 100%)',
      }}
    >
      {/* 喜字水印 */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      >
        <span
          className="font-kai text-rouge/[0.06] leading-none"
          style={{ fontSize: 'min(70vw, 520px)', fontWeight: 900 }}
        >
          囍
        </span>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-8 flex flex-col items-center gap-10">
        <Reveal>
          <div className="flex flex-col items-center gap-3">
            <span className="font-en italic text-rouge text-sm tracking-[0.4em]">
              {copy.wedding.eyebrow} · {copy.wedding.dateSub}
            </span>
            <h2
              className="font-kai text-rouge"
              style={{ fontSize: 'clamp(56px, 14vw, 80px)', letterSpacing: '0.4em' }}
            >
              {copy.wedding.title}
            </h2>
            <div className="font-kai text-ink text-2xl tracking-[0.3em] mt-2">
              {copy.wedding.date}
            </div>
          </div>
        </Reveal>

        {/* 三联画 */}
        <div className="w-full grid grid-cols-12 gap-2 mt-2">
          <Reveal delay={0.1} className="col-span-7 row-span-2">
            <PhotoSlot src={list[0]?.src} ratio="portrait" label="婚礼 · 01" />
          </Reveal>
          <Reveal delay={0.25} className="col-span-5">
            <PhotoSlot src={list[1]?.src} ratio="square" label="婚礼 · 02" />
          </Reveal>
          <Reveal delay={0.4} className="col-span-5">
            <PhotoSlot src={list[2]?.src} ratio="square" label="婚礼 · 03" />
          </Reveal>
        </div>

        {/* 誓词 */}
        <Reveal delay={0.4}>
          <div className="relative mt-6 px-6 py-8 rounded-sm bg-paperSoft/80 backdrop-blur-sm border border-rouge/20 max-w-sm">
            <p
              className="font-kai text-rouge text-center"
              style={{ fontSize: 'clamp(22px, 6vw, 28px)', letterSpacing: '0.18em' }}
            >
              {copy.wedding.vow}
            </p>
            <p className="font-song text-ink/75 text-sm leading-loose text-center mt-4">
              {copy.wedding.body}
            </p>
            <div className="absolute -bottom-5 -right-3">
              <ChineseSeal text="囍" size={48} rotate={-10} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
