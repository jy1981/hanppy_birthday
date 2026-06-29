'use client';

import { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
};

/**
 * 烟花 canvas。active=true 时自动发射；false 时静止。
 * 点击/tap 也会触发一发。
 */
export default function Fireworks({
  active = true,
  intensity = 1,
}: {
  active?: boolean;
  intensity?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ active });

  useEffect(() => {
    stateRef.current.active = active;
  }, [active]);

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

    const palettes = [
      ['#FFD27A', '#FFB05A', '#FF7A6E'],
      ['#FF9EBD', '#FFC9D9', '#FFE3EA'],
      ['#FFE8A8', '#FFC371', '#FF6B6B'],
      ['#A3C9FF', '#D0E1FF', '#FFFFFF'],
      ['#FFE0B2', '#FFAB91', '#F48FB1'],
    ];
    const particles: Particle[] = [];

    const burst = (x: number, y: number) => {
      const palette = palettes[Math.floor(Math.random() * palettes.length)];
      const count = 60 + Math.floor(Math.random() * 40);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.1;
        const speed = 1.5 + Math.random() * 3.5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 60 + Math.random() * 60,
          color: palette[Math.floor(Math.random() * palette.length)],
          size: 1.2 + Math.random() * 1.6,
        });
      }
    };

    // 火箭：从下方升空到顶部爆开
    const launch = () => {
      const targetX = w * (0.2 + Math.random() * 0.6);
      const targetY = h * (0.15 + Math.random() * 0.25);
      const startX = targetX + (Math.random() - 0.5) * 40;
      const startY = h + 10;
      const dx = targetX - startX;
      const dy = targetY - startY;
      const steps = 50;
      let i = 0;
      const trailColor = '#FFE3B0';
      const interval = setInterval(() => {
        const x = startX + (dx * i) / steps;
        const y = startY + (dy * i) / steps;
        // 拖尾粒子
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.4,
          vy: 0.5 + Math.random() * 0.6,
          life: 0,
          maxLife: 18,
          color: trailColor,
          size: 1.4,
        });
        i++;
        if (i >= steps) {
          clearInterval(interval);
          burst(targetX, targetY);
        }
      }, 14);
    };

    let raf = 0;
    let lastLaunch = 0;
    const tick = (t: number) => {
      ctx.fillStyle = 'rgba(8, 14, 24, 0.18)';
      ctx.fillRect(0, 0, w, h);

      // 触发
      if (stateRef.current.active) {
        const gap = 1400 / intensity;
        if (t - lastLaunch > gap) {
          launch();
          if (Math.random() < 0.35) setTimeout(launch, 200);
          lastLaunch = t;
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.035; // gravity
        p.vx *= 0.99;
        const a = 1 - p.life / p.maxLife;
        if (a <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, a);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const tap = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      burst(e.clientX - rect.left, e.clientY - rect.top);
    };
    canvas.addEventListener('pointerdown', tap);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', tap);
    };
  }, [intensity]);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 z-[2] cursor-pointer"
      aria-label="点击触发烟花"
    />
  );
}
