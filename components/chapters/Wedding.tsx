'use client';

import { photos } from '@/lib/manifest';
import FilmScene from '@/components/ui/FilmScene';

/** Chapter II · 永结 — 电影长镜头 */
export default function Wedding({ onComplete }: { onComplete?: () => void }) {
  return (
    <FilmScene
      scene="02"
      titleZh="永结"
      titleEn="The Vow"
      photos={photos.wedding ?? []}
      tone="rose"
      onComplete={onComplete}
    />
  );
}
