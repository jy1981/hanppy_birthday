'use client';

import { useEffect, useRef } from 'react';
import { playFireworkBurst } from '@/lib/sfx';

type Kind = 'peony' | 'willow' | 'ring' | 'crackle' | 'heart';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  hue: number; // 色相，用于 hot→cool 渐变
  sat: number;
  size: number;
  gravity: number;
  drag: number;
  flicker: number; // 闪烁相位
  trail: boolean; // 是否为拖尾/垂柳（更长寿、更暗）
  crackle?: boolean; // 到寿命末端二次噼啪
};

type Rocket = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  hue: number;
  kind: Kind;
  puff: number; // 拖尾计时
};

const MAX_PARTICLES = 1400;
const TWO_PI = Math.PI * 2;

/**
 * 电影感烟花 canvas。
 * - 加法混合 + 散景柔光，模拟镜头里散焦的光斑
 * - 透明擦除做拖尾（不糊死背景，实拍烟花视频可透出）
 * - 多品种：菊花 / 垂柳 / 圆环 / 噼啪碎星 / 爱心礼花
 * - 每次绽放伴随一次极轻的满屏辉光（bloom）
 * - 常驻暖色余烬缓缓上飘，作安静的浪漫底色
 * active=true 自动发射；celebrate 触发一次爱心齐放；点击也会绽放一发。
 */
export default function Fireworks({
  active = true,
  intensity = 1,
  celebrate = false,
  sound = true,
}: {
  active?: boolean;
  intensity?: number;
  celebrate?: boolean;
  sound?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ active, intensity, sound });
  const celebrateRef = useRef(false);

  useEffect(() => {
    stateRef.current.active = active;
    stateRef.current.intensity = intensity;
    stateRef.current.sound = sound;
  }, [active, intensity, sound]);

  // celebrate 从 false→true 时触发一次庆典齐放
  useEffect(() => {
    if (celebrate) celebrateRef.current = true;
  }, [celebrate]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    // 电影调色的暖—玫瑰—青金色相带
    const HUES = [38, 32, 12, 340, 350, 45, 205];
    // “彤”本义即红 —— 爱心礼花专属：玫红 / 洋红 / 暖红 / 金
    const TONG_HUES = [345, 335, 350, 8, 44];
    const particles: Particle[] = [];
    const rockets: Rocket[] = [];
    const embers: Particle[] = [];
    let bloom = 0; // 满屏辉光强度，绽放时抬升，随后衰减

    const pick = <T,>(arr: T[]) => arr[(Math.random() * arr.length) | 0];

    const addParticle = (p: Particle) => {
      if (particles.length < MAX_PARTICLES) particles.push(p);
    };

    // 心形参数方程，返回单位方向向量
    const heartDir = (t: number) => {
      const x = 16 * Math.sin(t) ** 3;
      const y =
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t);
      const len = Math.hypot(x, y) || 1;
      return { x: x / len, y: -y / len };
    };

    const burst = (x: number, y: number, kind: Kind, baseHue: number) => {
      bloom = Math.min(1, bloom + (kind === 'heart' ? 0.9 : 0.55));
      // 爆裂声：爱心/垂柳更饱满，其余略轻（静音时内部自动跳过）
      if (stateRef.current.sound) {
        playFireworkBurst(kind === 'heart' ? 1 : kind === 'willow' ? 0.85 : 0.7);
      }
      const n =
        kind === 'heart'
          ? 120
          : kind === 'willow'
          ? 70
          : kind === 'ring'
          ? 64
          : 80 + ((Math.random() * 40) | 0);

      // 爱心礼花锁定“彤红”专属配色；其余用来袭色相
      const heartHue = TONG_HUES[(Math.random() * TONG_HUES.length) | 0];

      for (let i = 0; i < n; i++) {
        let angle: number;
        let speed: number;
        let vx: number;
        let vy: number;
        let gravity = 0.03;
        let drag = 0.985;
        let maxLife = 70 + Math.random() * 55;
        let trail = false;
        let crackle = false;
        const size = 1.1 + Math.random() * 1.7;

        if (kind === 'heart') {
          const t = (TWO_PI * i) / n;
          const d = heartDir(t);
          speed = 3.4 + Math.random() * 1.1;
          vx = d.x * speed;
          vy = d.y * speed;
          gravity = 0.02;
          maxLife = 95 + Math.random() * 45;
        } else if (kind === 'ring') {
          angle = (TWO_PI * i) / n;
          speed = 3.6 + Math.random() * 0.5; // 环：速度均匀
          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed;
        } else if (kind === 'willow') {
          angle = (TWO_PI * i) / n + Math.random() * 0.12;
          speed = 1.4 + Math.random() * 2.4;
          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed - 0.6; // 略微上偏，随后垂落如柳
          gravity = 0.055;
          drag = 0.99;
          maxLife = 120 + Math.random() * 70;
          trail = true;
        } else {
          // peony / crackle：饱满球状
          angle = (TWO_PI * i) / n + Math.random() * 0.1;
          speed = 1.6 + Math.random() * 3.6;
          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed;
          crackle = kind === 'crackle' && Math.random() < 0.5;
        }

        addParticle({
          x,
          y,
          vx,
          vy,
          life: 0,
          maxLife,
          hue: (kind === 'heart' ? heartHue : baseHue) + (Math.random() * 16 - 8),
          sat: kind === 'heart' ? 82 + Math.random() * 15 : 70 + Math.random() * 25,
          size,
          gravity,
          drag,
          flicker: Math.random() * TWO_PI,
          trail,
          crackle,
        });
      }
    };

    // 二次噼啪：某颗粒子末端炸出一小簇金星
    const crackleAt = (x: number, y: number) => {
      const n = 8 + ((Math.random() * 6) | 0);
      for (let i = 0; i < n; i++) {
        const a = Math.random() * TWO_PI;
        const s = 0.6 + Math.random() * 1.6;
        addParticle({
          x,
          y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          life: 0,
          maxLife: 18 + Math.random() * 14,
          hue: 45 + Math.random() * 10,
          sat: 30 + Math.random() * 20,
          size: 1 + Math.random(),
          gravity: 0.04,
          drag: 0.96,
          flicker: Math.random() * TWO_PI,
          trail: false,
        });
      }
    };

    const launch = (kind: Kind = 'peony', forcedX?: number) => {
      const tx = forcedX ?? w * (0.18 + Math.random() * 0.64);
      const ty = h * (0.14 + Math.random() * 0.26);
      const sx = tx + (Math.random() - 0.5) * 30;
      const sy = h + 8;
      const hue = pick(HUES);
      rockets.push({
        x: sx,
        y: sy,
        tx,
        ty,
        vx: (tx - sx) * 0.012,
        vy: -(6.5 + Math.random() * 1.6),
        hue,
        kind,
        puff: 0,
      });
    };

    // 常驻余烬：底部随机升起的暖色微光
    const spawnEmber = () => {
      if (embers.length > 90) return;
      embers.push({
        x: Math.random() * w,
        y: h + 6,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(0.25 + Math.random() * 0.5),
        life: 0,
        maxLife: 220 + Math.random() * 200,
        hue: 34 + Math.random() * 16,
        sat: 55 + Math.random() * 20,
        size: 0.8 + Math.random() * 1.4,
        gravity: -0.0015, // 轻微上浮加速
        drag: 1,
        flicker: Math.random() * TWO_PI,
        trail: false,
      });
    };

    const drawGlow = (
      p: Particle,
      alpha: number,
      light: number,
      radius: number
    ) => {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
      g.addColorStop(0, `hsla(${p.hue}, ${p.sat}%, ${light}%, ${alpha})`);
      g.addColorStop(0.4, `hsla(${p.hue}, ${p.sat}%, ${light - 12}%, ${alpha * 0.5})`);
      g.addColorStop(1, `hsla(${p.hue}, ${p.sat}%, ${light - 20}%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, TWO_PI);
      ctx.fill();
    };

    let raf = 0;
    let lastLaunch = 0;
    let lastEmber = 0;
    const tick = (t: number) => {
      // 透明擦除：只淡出上一帧的光，背景（夜色/实拍视频）得以透出
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.14)';
      ctx.fillRect(0, 0, w, h);

      // 满屏辉光（bloom）——绽放瞬间整场被暖光轻抬
      if (bloom > 0.01) {
        ctx.globalCompositeOperation = 'lighter';
        const bg = ctx.createRadialGradient(
          w / 2,
          h * 0.42,
          0,
          w / 2,
          h * 0.42,
          Math.max(w, h) * 0.7
        );
        bg.addColorStop(0, `rgba(255,210,150,${0.05 * bloom})`);
        bg.addColorStop(1, 'rgba(255,210,150,0)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);
        bloom *= 0.92;
      }

      // 发光叠加模式绘制所有光点
      ctx.globalCompositeOperation = 'lighter';

      // 触发庆典（爱心齐放）
      if (celebrateRef.current) {
        celebrateRef.current = false;
        launch('heart', w * 0.5);
        setTimeout(() => launch('peony'), 260);
        setTimeout(() => launch('willow'), 520);
        setTimeout(() => launch('ring'), 780);
      }

      // 常规自动发射
      if (stateRef.current.active && !reduce) {
        const gap = 1500 / stateRef.current.intensity;
        if (t - lastLaunch > gap) {
          launch(pick<Kind>(['peony', 'willow', 'ring', 'crackle']));
          if (Math.random() < 0.3)
            setTimeout(() => launch(pick<Kind>(['peony', 'ring'])), 220);
          lastLaunch = t;
        }
      }

      // 余烬持续生成（reduced-motion 下也保留，但更稀疏）
      if (t - lastEmber > (reduce ? 900 : 260)) {
        spawnEmber();
        lastEmber = t;
      }

      // 火箭上升
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx;
        r.y += r.vy;
        r.vy += 0.12; // 上升减速
        r.puff++;
        // 拖尾火星
        if (r.puff % 2 === 0) {
          addParticle({
            x: r.x + (Math.random() - 0.5) * 1.5,
            y: r.y,
            vx: (Math.random() - 0.5) * 0.3,
            vy: 0.4 + Math.random() * 0.4,
            life: 0,
            maxLife: 16,
            hue: 40,
            sat: 25,
            size: 1.3,
            gravity: 0.02,
            drag: 0.96,
            flicker: 0,
            trail: false,
          });
        }
        // 到顶（速度转正或到达目标高度）即爆开
        if (r.vy >= -0.6 || r.y <= r.ty) {
          burst(r.x, r.y, r.kind, r.hue);
          rockets.splice(i, 1);
        }
      }

      // 粒子演化
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;

        const prog = p.life / p.maxLife;
        const a = 1 - prog;
        if (a <= 0) {
          if (p.crackle) crackleAt(p.x, p.y);
          particles.splice(i, 1);
          continue;
        }

        // hot→cool：初生偏白热，随寿命降亮转暖
        const light = 92 - prog * 42;
        const flick = 0.82 + 0.18 * Math.sin(t * 0.02 + p.flicker);
        const alpha = Math.max(0, a) * flick;

        // 柔光晕（散景）
        drawGlow(p, alpha * 0.6, light, p.size * (p.trail ? 4 : 6));
        // 亮核
        ctx.fillStyle = `hsla(${p.hue}, ${Math.min(100, p.sat + 10)}%, ${Math.min(
          100,
          light + 6
        )}%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, TWO_PI);
        ctx.fill();
      }

      // 余烬演化
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.life++;
        e.x += e.vx + Math.sin(t * 0.001 + e.flicker) * 0.15;
        e.y += e.vy;
        e.vy += e.gravity;
        const prog = e.life / e.maxLife;
        const a = Math.sin(prog * Math.PI); // 淡入淡出
        if (a <= 0.01 || e.y < -10) {
          embers.splice(i, 1);
          continue;
        }
        const flick = 0.6 + 0.4 * Math.sin(t * 0.006 + e.flicker);
        drawGlow(e, a * 0.5 * flick, 78, e.size * 5);
      }

      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const tap = (ev: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      burst(
        ev.clientX - rect.left,
        ev.clientY - rect.top,
        pick<Kind>(['peony', 'willow', 'ring', 'crackle']),
        pick(HUES)
      );
    };
    canvas.addEventListener('pointerdown', tap);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', tap);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 z-[2] cursor-pointer"
      aria-label="点击触发烟花"
    />
  );
}
