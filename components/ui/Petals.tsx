'use client';

import { useEffect, useRef } from 'react';

/**
 * 花瓣飘落（canvas 实现，性能轻）。
 * 全屏覆盖，pointer-events-none。
 */
export default function Petals({
  count = 18,
  variant = 'sakura',
}: {
  count?: number;
  variant?: 'sakura' | 'snow';
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    type P = {
      x: number;
      y: number;
      r: number;
      vy: number;
      vx: number;
      a: number;
      va: number;
      hue: number;
      o: number;
    };
    const petals: P[] = Array.from({ length: count }, () => spawn(true));
    function spawn(initial = false): P {
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : -20,
        r: 6 + Math.random() * 8,
        vy: 0.3 + Math.random() * 0.6,
        vx: -0.3 + Math.random() * 0.6,
        a: Math.random() * Math.PI * 2,
        va: -0.02 + Math.random() * 0.04,
        hue: variant === 'snow' ? 210 + Math.random() * 10 : 340 + Math.random() * 20,
        o: variant === 'snow' ? 0.3 + Math.random() * 0.3 : 0.5 + Math.random() * 0.4,
      };
    }

    // 预渲染柔光花瓣精灵，按色相分桶，避免逐帧 createRadialGradient
    const SPRITE_R = 32;
    const spriteCache = new Map<number, HTMLCanvasElement>();
    const getSprite = (hue: number) => {
      const hb = Math.round(hue / 5) * 5;
      let c = spriteCache.get(hb);
      if (!c) {
        c = document.createElement('canvas');
        c.width = c.height = SPRITE_R * 2;
        const g = c.getContext('2d');
        if (g) {
          const grd = g.createRadialGradient(
            SPRITE_R,
            SPRITE_R,
            0,
            SPRITE_R,
            SPRITE_R,
            SPRITE_R
          );
          if (variant === 'snow') {
            grd.addColorStop(0, `hsla(${hb}, 20%, 95%, 1)`);
            grd.addColorStop(1, `hsla(${hb}, 15%, 90%, 0)`);
          } else {
            grd.addColorStop(0, `hsla(${hb}, 65%, 80%, 1)`);
            grd.addColorStop(1, `hsla(${hb}, 55%, 70%, 0)`);
          }
          g.fillStyle = grd;
          g.fillRect(0, 0, SPRITE_R * 2, SPRITE_R * 2);
        }
        spriteCache.set(hb, c);
      }
      return c;
    };

    const drawPetal = (p: P) => {
      const sprite = getSprite(p.hue);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      ctx.globalAlpha = p.o;
      // 椭圆花瓣：横向压扁至 0.55
      ctx.drawImage(sprite, -p.r * 0.55, -p.r, p.r * 1.1, p.r * 2);
      ctx.restore();
    };

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.x += p.vx + Math.sin(p.a) * 0.3;
        p.y += p.vy;
        p.a += p.va;
        if (p.y > h + 20 || p.x < -20 || p.x > w + 20) {
          petals[i] = spawn(false);
        }
        drawPetal(p);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [count, variant]);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 z-[5] pointer-events-none"
      aria-hidden
    />
  );
}
