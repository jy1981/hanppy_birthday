'use client';

import { copy, photos } from '@/lib/manifest';
import { PhotoSlot } from '@/components/ui/MediaSlot';
import Reveal from '@/components/ui/Reveal';
import InkBrushDivider from '@/components/ui/InkBrushDivider';

export default function Meet() {
  const list = (photos.meet ?? []).slice(0, 2);
  const p1 = list[0];
  const p2 = list[1];

  return (
    <section className="chapter paper-texture relative py-24">
      <div className="relative w-full max-w-md mx-auto px-8 flex flex-col items-center gap-10">
        <Reveal>
          <div className="flex flex-col items-center gap-3">
            <span className="font-en italic text-gold text-sm tracking-[0.4em]">
              {copy.meet.eyebrow}
            </span>
            <h2
              className="font-kai text-ink"
              style={{ fontSize: 'clamp(56px, 14vw, 80px)', letterSpacing: '0.4em' }}
            >
              {copy.meet.title}
            </h2>
            <InkBrushDivider color="#1F1B1A" width={180} />
          </div>
        </Reveal>

        {/* 错位照片 */}
        <div className="relative w-full h-[58vh] max-h-[440px]">
          <Reveal delay={0.1} className="absolute left-2 top-0 w-[55%]">
            <div className="rotate-[-3deg]">
              <PhotoSlot src={p1?.src} ratio="portrait" label="初遇 · 01" />
            </div>
          </Reveal>
          <Reveal delay={0.35} className="absolute right-2 bottom-0 w-[55%]">
            <div className="rotate-[4deg]">
              <PhotoSlot src={p2?.src} ratio="portrait" label="初遇 · 02" />
            </div>
          </Reveal>
        </div>

        {/* 诗句 + 旁白 */}
        <Reveal delay={0.4}>
          <div className="flex items-start gap-6 justify-center mt-4">
            <div
              className="font-kai text-ink/85 leading-[1.9]"
              style={{
                writingMode: 'vertical-rl',
                fontSize: 'clamp(20px, 5.2vw, 26px)',
                letterSpacing: '0.2em',
              }}
            >
              {copy.meet.poem.split('\n').map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </div>
            <p className="font-song text-ink/70 text-base leading-loose max-w-[180px] text-left mt-2">
              {copy.meet.body}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
