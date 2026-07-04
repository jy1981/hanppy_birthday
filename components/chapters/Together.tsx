'use client';

import { photos } from '@/lib/manifest';
import FilmScene from '@/components/ui/FilmScene';

/** Chapter IV · 日常 — 电影长镜头 */
export default function Together({ onComplete }: { onComplete?: () => void }) {
  return (
    <FilmScene
      scene="04"
      titleZh="日常"
      titleEn="Every Ordinary Day"
      photos={photos.travel ?? []}
      tone="amber"
      onComplete={onComplete}
    />
  );
}
