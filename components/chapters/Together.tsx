'use client';

import { copy, photos } from '@/lib/manifest';
import { PhotoSlot } from '@/components/ui/MediaSlot';
import Reveal from '@/components/ui/Reveal';
import InkBrushDivider from '@/components/ui/InkBrushDivider';

export default function Together() {
  const list = (photos.travel ?? []).slice(0, 6);

  return (
    <section className="chapter paper-texture relative py-24 overflow-hidden">
      <div className="relative z-10 w-full max-w-md mx-auto px-8 flex flex-col items-center gap-10">
        <Reveal>
          <div className="flex flex-col items-center gap-3">
            <span className="font-en italic text-gold text-sm tracking-[0.4em]">
              {copy.together.eyebrow}
            </span>
            <h2
              className="font-kai text-ink"
              style={{ fontSize: 'clamp(56px, 14vw, 80px)', letterSpacing: '0.4em' }}
            >
              {copy.together.title}
            </h2>
            <p className="font-song text-mist text-sm tracking-widest">
              {copy.together.sub}
            </p>
            <InkBrushDivider color="#426666" width={200} />
          </div>
        </Reveal>

        {/* 拼贴墙 */}
        <div className="w-full grid grid-cols-6 gap-2 mt-2">
          <Reveal delay={0.05} className="col-span-3 row-span-2">
            <PhotoSlot src={list[0]?.src} ratio="portrait" label="同游 · 01" />
          </Reveal>
          <Reveal delay={0.15} className="col-span-3">
            <PhotoSlot src={list[1]?.src} ratio="landscape" label="同游 · 02" />
          </Reveal>
          <Reveal delay={0.25} className="col-span-3">
            <PhotoSlot src={list[2]?.src} ratio="landscape" label="同游 · 03" />
          </Reveal>
          <Reveal delay={0.35} className="col-span-2">
            <PhotoSlot src={list[3]?.src} ratio="square" label="同游 · 04" />
          </Reveal>
          <Reveal delay={0.45} className="col-span-2">
            <PhotoSlot src={list[4]?.src} ratio="square" label="同游 · 05" />
          </Reveal>
          <Reveal delay={0.55} className="col-span-2">
            <PhotoSlot src={list[5]?.src} ratio="square" label="同游 · 06" />
          </Reveal>
        </div>

        {/* 足迹标签 */}
        <Reveal delay={0.4}>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 max-w-sm">
            {copy.together.places.map((p, i) => (
              <span
                key={i}
                className="font-kai text-ink/85 text-base px-3 py-1 border-b border-gold/40"
              >
                · {p} ·
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.5}>
          <p className="font-song text-ink/70 text-sm leading-loose text-center max-w-xs mt-4 whitespace-pre-line">
            {copy.together.poem}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
