'use client';

import { photos } from '@/lib/manifest';
import FilmScene from '@/components/ui/FilmScene';

/** Chapter I · 初见 — 电影长镜头 */
export default function Meet({ onComplete }: { onComplete?: () => void }) {
  return (
    <FilmScene
      scene="01"
      titleZh="初见"
      titleEn="First Sight"
      photos={photos.meet ?? []}
      tone="amber"
      onComplete={onComplete}
    />
  );
}
