'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { copy } from '@/lib/manifest';
import InkBrushDivider from '@/components/ui/InkBrushDivider';

/**
 * 序章：卷轴展开效果。滚动时左右滚轴向两侧拉开，露出诗句。
 */
export default function Prelude() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // 卷轴完全打开：从中央往两侧各推 100%（= 各自宽度，刚好滑出屏幕）
  const leftX = useTransform(scrollYProgress, [0.12, 0.55], ['0%', '-100%']);
  const rightX = useTransform(scrollYProgress, [0.12, 0.55], ['0%', '100%']);
  const innerOpacity = useTransform(scrollYProgress, [0.28, 0.55], [0, 1]);
  const innerScale = useTransform(scrollYProgress, [0.28, 0.65], [0.94, 1]);

  return (
    <section ref={ref} className="chapter paper-texture relative py-24">
      <div className="relative w-full max-w-md mx-auto h-[100svh] flex items-center justify-center px-6">
        {/* 卷轴内容 */}
        <motion.div
          style={{ opacity: innerOpacity, scale: innerScale }}
          className="relative z-10 flex flex-col items-center gap-8 text-center px-6"
        >
          <div className="font-en italic text-gold text-sm tracking-[0.4em]">— Prelude —</div>
          <h2
            className="font-kai text-ink text-balance"
            style={{ fontSize: 'clamp(36px, 9vw, 56px)', letterSpacing: '0.3em' }}
          >
            {copy.prelude.poem.split(' · ').map((s, i, arr) => (
              <span key={i}>
                {s}
                {i < arr.length - 1 && (
                  <span className="mx-3 text-gold align-middle">·</span>
                )}
              </span>
            ))}
          </h2>
          <InkBrushDivider color="#B03A48" />
          <p className="font-song text-ink/80 text-base leading-loose max-w-xs">
            {copy.prelude.sub}
          </p>
        </motion.div>

        {/* 左卷轴 */}
        <motion.div
          style={{ x: leftX }}
          className="absolute inset-y-0 left-0 w-1/2 z-20 pointer-events-none"
        >
          <div className="absolute inset-y-0 right-0 w-full paper-texture-warm shadow-[8px_0_24px_rgba(0,0,0,0.08)]" />
          {/* 卷轴杆 */}
          <div className="absolute inset-y-6 right-0 w-1.5 bg-gradient-to-b from-[#8C6E3A]/70 via-[#6B5226]/60 to-[#8C6E3A]/70 rounded-r-sm" />
          <div className="absolute right-[-1px] top-2 w-2 h-2 rounded-full bg-[#8C6E3A]/70" />
          <div className="absolute right-[-1px] bottom-2 w-2 h-2 rounded-full bg-[#8C6E3A]/70" />
        </motion.div>

        {/* 右卷轴 */}
        <motion.div
          style={{ x: rightX }}
          className="absolute inset-y-0 right-0 w-1/2 z-20 pointer-events-none"
        >
          <div className="absolute inset-y-0 left-0 w-full paper-texture-warm shadow-[-8px_0_24px_rgba(0,0,0,0.08)]" />
          <div className="absolute inset-y-6 left-0 w-1.5 bg-gradient-to-b from-[#8C6E3A]/70 via-[#6B5226]/60 to-[#8C6E3A]/70 rounded-l-sm" />
          <div className="absolute left-[-1px] top-2 w-2 h-2 rounded-full bg-[#8C6E3A]/70" />
          <div className="absolute left-[-1px] bottom-2 w-2 h-2 rounded-full bg-[#8C6E3A]/70" />
        </motion.div>
      </div>
    </section>
  );
}
