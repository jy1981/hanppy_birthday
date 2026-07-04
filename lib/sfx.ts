/**
 * 程序化合成烟花音效 —— 不依赖任何音频素材，用 Web Audio API 实时合成。
 *
 * 一发烟花 = 低频 "boom" 下滑 + 宽带噪声爆发（空气冲击）+ 随机尾部噼啪脆响。
 * 全程 try-catch 兜底：任何环境不支持或被浏览器策略拦截时静默降级，不影响画面。
 *
 * iOS/Safari 安全：AudioContext 必须在用户手势后 resume，故提供 unlockAudio()。
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
let noiseBuffer: AudioBuffer | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    }
    return ctx;
  } catch {
    return null;
  }
}

/** 预生成一段白噪声缓冲，供反复取用 */
function getNoise(context: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const len = Math.floor(context.sampleRate * 1.2);
  const buf = context.createBuffer(1, len, context.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  noiseBuffer = buf;
  return buf;
}

/** 用户手势时调用一次，解锁/恢复音频上下文（iOS 必需） */
export function unlockAudio(): void {
  try {
    const c = getCtx();
    if (c && c.state === 'suspended') void c.resume();
  } catch {
    /* 静默降级 */
  }
}

/** 与背景音乐开关联动的静音控制 */
export function setSfxMuted(m: boolean): void {
  muted = m;
  try {
    if (master && ctx) {
      master.gain.setTargetAtTime(m ? 0 : 0.5, ctx.currentTime, 0.05);
    }
  } catch {
    /* 静默降级 */
  }
}

/**
 * 播放一声烟花爆裂。
 * @param intensity 0.4(轻,点击) ~ 1(响,爱心/庆典)
 */
export function playFireworkBurst(intensity = 0.8): void {
  if (muted) return;
  const c = getCtx();
  if (!c || !master) return;
  try {
    if (c.state === 'suspended') void c.resume();
    const now = c.currentTime;
    const vol = Math.max(0.2, Math.min(1, intensity));

    // 1) 低频冲击 boom —— 正弦从 ~150Hz 快速下滑到 ~45Hz
    const boom = c.createOscillator();
    const boomGain = c.createGain();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(150 + Math.random() * 40, now);
    boom.frequency.exponentialRampToValueAtTime(45, now + 0.18);
    boomGain.gain.setValueAtTime(0.0001, now);
    boomGain.gain.exponentialRampToValueAtTime(0.9 * vol, now + 0.012);
    boomGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    boom.connect(boomGain).connect(master);
    boom.start(now);
    boom.stop(now + 0.55);

    // 2) 空气爆发 —— 带通白噪声短促冲击
    const burst = c.createBufferSource();
    burst.buffer = getNoise(c);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1200, now);
    bp.frequency.exponentialRampToValueAtTime(400, now + 0.25);
    bp.Q.value = 0.7;
    const burstGain = c.createGain();
    burstGain.gain.setValueAtTime(0.5 * vol, now);
    burstGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    burst.connect(bp).connect(burstGain).connect(master);
    burst.start(now, Math.random() * 0.2, 0.32);

    // 3) 尾部噼啪 —— 若干随机高频短脉冲，模拟碎星炸裂
    const crackleCount = 5 + Math.floor(Math.random() * 6);
    for (let i = 0; i < crackleCount; i++) {
      const t = now + 0.12 + Math.random() * 0.5;
      const src = c.createBufferSource();
      src.buffer = getNoise(c);
      const hp = c.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 3500 + Math.random() * 3000;
      const g = c.createGain();
      const amp = 0.12 * vol * (0.5 + Math.random() * 0.5);
      g.gain.setValueAtTime(amp, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
      src.connect(hp).connect(g).connect(master);
      src.start(t, Math.random(), 0.05);
    }
  } catch {
    /* 静默降级：音效失败绝不影响视觉 */
  }
}
