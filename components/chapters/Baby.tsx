'use client';

import { photos } from '@/lib/manifest';
import FilmScene from '@/components/ui/FilmScene';

/** Chapter III · 初啼 — 电影长镜头 */
export default function Baby({ onComplete }: { onComplete?: () => void }) {
  return (
    <FilmScene
      scene="03"
      titleZh="初啼"
      titleEn="Hello, Little One"
      photos={photos.baby ?? []}
      tone="warm"
      onComplete={onComplete}
    />
  );
}
