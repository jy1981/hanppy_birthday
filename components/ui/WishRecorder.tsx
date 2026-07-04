'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Phase = 'check' | 'record' | 'locked' | 'unlock' | 'play' | 'upload' | 'error';

export default function WishRecorder({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>('check');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [levels, setLevels] = useState<number[]>(() => createIdleLevels());

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const analyserDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const rafRef = useRef<number | null>(null);
  const discardRecordingRef = useRef(false);

  // 初始检查是否已有录音
  useEffect(() => {
    fetch('/api/wish')
      .then((r) => r.json())
      .then((d) => {
        if (d.hasWish) {
          setPhase('locked');
        } else {
          setPhase('record');
        }
      })
      .catch(() => setPhase('record'));
  }, []);

  const stopAudioAnalysis = useCallback((resetLevels = true) => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    analyserRef.current?.disconnect();
    analyserRef.current = null;
    analyserDataRef.current = null;

    if (audioContextRef.current) {
      void audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    if (resetLevels) {
      setLevels(createIdleLevels());
    }
  }, []);

  const startAudioAnalysis = useCallback(
    async (stream: MediaStream) => {
      const Win = window as Window & { webkitAudioContext?: typeof AudioContext };
      const AudioContextCtor = window.AudioContext ?? Win.webkitAudioContext;

      if (!AudioContextCtor) {
        return;
      }

      stopAudioAnalysis(false);

      const context = new AudioContextCtor();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.82;
      source.connect(analyser);

      audioContextRef.current = context;
      analyserRef.current = analyser;
      analyserDataRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));

      const tick = () => {
        const activeAnalyser = analyserRef.current;
        const activeData = analyserDataRef.current;

        if (!activeAnalyser || !activeData) {
          return;
        }

        activeAnalyser.getByteFrequencyData(activeData);
        const bucketSize = Math.max(1, Math.floor(activeData.length / 18));
        const nextLevels = Array.from({ length: 18 }, (_, index) => {
          const start = index * bucketSize;
          const end = Math.min(activeData.length, start + bucketSize);
          let total = 0;

          for (let i = start; i < end; i += 1) {
            total += activeData[i];
          }

          const average = total / Math.max(1, end - start);
          return Math.max(0.12, Math.min(1, average / 160));
        });

        setLevels(nextLevels);
        rafRef.current = requestAnimationFrame(tick);
      };

      void context.resume().catch(() => {});
      tick();
    },
    [stopAudioAnalysis],
  );

  const cleanup = useCallback((discardRecording = true) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stopAudioAnalysis(true);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      discardRecordingRef.current = discardRecording;
      recorder.stop();
    }
    setIsRecording(false);
  }, [stopAudioAnalysis]);

  useEffect(() => () => cleanup(true), [cleanup]);

  const startRecording = async () => {
    setError('');

    // 安全上下文检查
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('当前环境不支持录音。请用 HTTPS 或 localhost 访问，iOS 请用 Safari');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      discardRecordingRef.current = false;

      // iOS Safari 不支持 webm，优先 mp4
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';
      const mr = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        if (discardRecordingRef.current) {
          discardRecordingRef.current = false;
          chunksRef.current = [];
          return;
        }

        const type = mr.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        setPhase('upload');
        await uploadRecording(blob);
      };

      mr.start();
      await startAudioAnalysis(stream);
      setIsRecording(true);
      setRecordTime(0);
      timerRef.current = setInterval(() => {
        setRecordTime((t) => {
          if (t >= 60) {
            stopRecording();
            return t;
          }
          return t + 1;
        });
      }, 1000);
    } catch (e) {
      const err = e as DOMException;
      stopAudioAnalysis(true);
      if (err?.name === 'NotAllowedError') {
        setError('麦克风权限被拒绝。iOS 请到 设置 → Safari → 麦克风 开启权限后重试');
      } else if (err?.name === 'NotFoundError') {
        setError('未检测到麦克风');
      } else if (err?.name === 'NotReadableError') {
        setError('麦克风被其他应用占用，请关闭后重试');
      } else {
        setError(`无法访问麦克风: ${err?.name || '未知错误'}。请用 HTTPS 或 localhost 访问`);
      }
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stopAudioAnalysis(false);
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'recording') {
      discardRecordingRef.current = false;
      recorder.stop();
    }
    setIsRecording(false);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const uploadRecording = async (blob: Blob) => {
    if (!password) {
      setError('请先设置密码');
      return;
    }
    const ext = blob.type.includes('mp4') ? 'm4a' : 'webm';
    const fd = new FormData();
    fd.append('audio', blob, `wish.${ext}`);
    fd.append('password', password);
    try {
      const res = await fetch('/api/wish', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.ok) {
        setAudioUrl(data.audioUrl);
        setPhase('play');
      } else {
        setError(data.error || '上传失败');
        setPhase('record');
        setLevels(createIdleLevels());
      }
    } catch {
      setError('上传失败，请重试');
      setPhase('record');
      setLevels(createIdleLevels());
    }
  };

  const handleUnlock = async () => {
    setError('');
    try {
      const res = await fetch('/api/wish', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        setAudioUrl(data.audioUrl);
        setPhase('play');
      } else {
        setError(data.error || '密码不正确');
      }
    } catch {
      setError('验证失败');
    }
  };

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const sealActive = isRecording || phase === 'upload';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center px-6"
        style={{ background: 'rgba(6,5,4,0.85)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm overflow-hidden rounded-2xl p-8 flex flex-col items-center gap-5"
          style={{
            background: 'linear-gradient(160deg, rgba(20,16,14,0.95) 0%, rgba(12,10,8,0.98) 100%)',
            border: '1px solid rgba(201,163,104,0.25)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(201,163,104,0.08)',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                'radial-gradient(circle at 50% -15%, rgba(241,224,176,0.16) 0%, transparent 36%), radial-gradient(circle at 10% 85%, rgba(176,58,72,0.16) 0%, transparent 34%)',
            }}
          />
          <motion.div
            aria-hidden
            animate={{ rotate: sealActive ? 360 : 0, opacity: sealActive ? 0.8 : 0.35 }}
            transition={{ rotate: { duration: 18, repeat: Infinity, ease: 'linear' }, opacity: { duration: 0.4 } }}
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full"
            style={{
              background:
                'conic-gradient(from 120deg, transparent, rgba(212,166,86,0.22), transparent 34%, rgba(176,58,72,0.18), transparent 62%, rgba(241,224,176,0.16), transparent)',
              filter: 'blur(0.5px)',
            }}
          />

          {/* 标题 */}
          <div className="relative z-[1] flex flex-col items-center gap-2">
            <SoundSeal levels={levels} active={sealActive} />
            <span className="font-en text-[10px] tracking-[0.4em] text-[#D4A656]/60">
              BIRTHDAY WISH
            </span>
            <h3 className="font-kai text-2xl text-[#F1E0B0] tracking-[0.15em]">
              生日愿望
            </h3>
            <span className="hairline-gold w-16" />
          </div>

          {/* ===== 首次录音 ===== */}
          {phase === 'record' && (
            <div className="relative z-[1] w-full flex flex-col items-center gap-4">
              {/* 密码设置 */}
              {!isRecording && (
                <div className="w-full flex flex-col gap-3">
                  <p className="font-song text-[#F3EBDD]/70 text-sm text-center leading-relaxed">
                    录下你的生日愿望
                    <br />
                    <span className="text-[#F3EBDD]/40 text-xs">
                      设置密码后，想听需要输入密码
                    </span>
                  </p>
                  <input
                    type="password"
                    placeholder="设置密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-[#D4A656]/20 text-[#F3EBDD] text-sm font-song text-center outline-none focus:border-[#D4A656]/50 transition-colors"
                    style={{ letterSpacing: '0.1em' }}
                  />
                  {password && (
                    <input
                      type="password"
                      placeholder="确认密码"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-[#D4A656]/20 text-[#F3EBDD] text-sm font-song text-center outline-none focus:border-[#D4A656]/50 transition-colors"
                      style={{ letterSpacing: '0.1em' }}
                    />
                  )}
                </div>
              )}

              {/* 录音按钮 */}
              {!isRecording ? (
                <>
                  <VoiceMeter levels={levels} active={false} />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (!password) {
                        setError('请先设置密码');
                        return;
                      }
                      if (confirmPw && confirmPw !== password) {
                        setError('两次密码不一致');
                        return;
                      }
                      setError('');
                      startRecording();
                    }}
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      background: 'radial-gradient(circle, rgba(176,58,72,0.8) 0%, rgba(140,40,50,0.6) 100%)',
                      border: '2px solid rgba(241,224,176,0.3)',
                      boxShadow: '0 0 20px rgba(176,58,72,0.3)',
                    }}
                    aria-label="开始录音"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#F1E0B0]" />
                  </motion.button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <VoiceMeter levels={levels} active />
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      background: 'radial-gradient(circle, rgba(176,58,72,0.9) 0%, rgba(140,40,50,0.7) 100%)',
                      border: '2px solid rgba(241,224,176,0.4)',
                    }}
                  >
                    <span className="w-4 h-4 rounded bg-[#F1E0B0]" />
                  </motion.div>
                  <span className="font-en text-[#F1E0B0] text-lg tabular-nums">
                    {fmtTime(recordTime)}
                  </span>
                  <button
                    onClick={stopRecording}
                    className="px-5 py-2 rounded-full border border-[#D4A656]/40 text-[#F3EBDD] text-sm font-kai tracking-widest active:scale-95"
                  >
                    完成
                  </button>
                </div>
              )}
            </div>
          )}

          {phase === 'upload' && (
            <div className="relative z-[1] w-full flex flex-col items-center gap-4 py-4">
              <VoiceMeter levels={levels} active />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 rounded-full border-2 border-[#D4A656]/20 border-t-[#F1E0B0]"
              />
              <p className="font-song text-[#F3EBDD]/70 text-sm text-center leading-relaxed">
                正在封存这段声音
                <br />
                <span className="text-[#F3EBDD]/40 text-xs">上传完成后会自动进入试听</span>
              </p>
            </div>
          )}

          {/* ===== 已有录音（锁定） ===== */}
          {phase === 'locked' && (
            <div className="relative z-[1] w-full flex flex-col items-center gap-4">
              <p className="font-song text-[#F3EBDD]/70 text-sm text-center leading-relaxed">
                这里封存着一个生日愿望
                <br />
                <span className="text-[#F3EBDD]/40 text-xs">
                  输入密码即可聆听
                </span>
              </p>
              <input
                type="password"
                placeholder="输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-[#D4A656]/20 text-[#F3EBDD] text-sm font-song text-center outline-none focus:border-[#D4A656]/50 transition-colors"
                style={{ letterSpacing: '0.1em' }}
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleUnlock}
                className="w-full py-2.5 rounded-lg font-kai text-sm tracking-[0.2em]"
                style={{
                  background: 'linear-gradient(135deg, rgba(201,163,104,0.25) 0%, rgba(241,224,176,0.15) 100%)',
                  border: '1px solid rgba(201,163,104,0.35)',
                  color: '#F1E0B0',
                }}
              >
                解锁聆听
              </motion.button>
            </div>
          )}

          {/* ===== 播放 ===== */}
          {phase === 'play' && audioUrl && (
            <div className="relative z-[1] w-full flex flex-col items-center gap-4">
              <p className="font-song text-[#F3EBDD]/70 text-sm text-center">
                🎧 你的生日愿望
              </p>
              <audio
                ref={audioRef}
                src={audioUrl}
                controls
                className="w-full"
                style={{ filter: 'sepia(0.1)' }}
              />
              <p className="font-song text-[#F3EBDD]/40 text-xs text-center">
                关闭后想再听，需要输入密码
              </p>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative z-[1] font-song text-[#B03A48] text-xs text-center"
            >
              {error}
            </motion.p>
          )}

          {/* 关闭按钮 */}
          <button
            onClick={() => {
              cleanup(true);
              onClose();
            }}
            className="relative z-[1] font-song text-[#F3EBDD]/40 text-xs tracking-[0.2em] mt-2"
          >
            关闭
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function VoiceMeter({ levels, active }: { levels: number[]; active: boolean }) {
  return (
    <div className="relative flex items-end justify-center gap-1.5 h-16 w-full max-w-[240px]">
      <div
        className="absolute inset-x-8 bottom-0 top-6 rounded-full blur-2xl"
        style={{
          background: active
            ? 'radial-gradient(circle, rgba(176,58,72,0.28) 0%, rgba(176,58,72,0) 72%)'
            : 'radial-gradient(circle, rgba(212,166,86,0.12) 0%, rgba(212,166,86,0) 72%)',
        }}
      />
      {levels.map((level, index) => (
        <motion.span
          key={index}
          animate={{
            height: `${Math.round(10 + level * 38)}px`,
            opacity: active ? 0.95 : 0.45,
            scaleY: active ? [0.94, 1.06, 1] : 1,
          }}
          transition={{
            duration: active ? 0.28 : 0.4,
            ease: 'easeOut',
            delay: index * 0.01,
          }}
          className="w-1.5 rounded-full"
          style={{
            background:
              index % 3 === 0
                ? 'linear-gradient(180deg, rgba(241,224,176,0.95) 0%, rgba(212,166,86,0.88) 100%)'
                : 'linear-gradient(180deg, rgba(212,166,86,0.86) 0%, rgba(176,58,72,0.75) 100%)',
            boxShadow: active ? '0 0 10px rgba(212,166,86,0.2)' : 'none',
          }}
        />
      ))}
    </div>
  );
}

function createIdleLevels() {
  return Array.from({ length: 18 }, (_, index) => 0.16 + ((index + 2) % 5) * 0.035);
}

function SoundSeal({ levels, active }: { levels: number[]; active: boolean }) {
  const strength = levels.reduce((sum, level) => sum + level, 0) / Math.max(1, levels.length);
  const pulse = Math.min(1, Math.max(0.18, strength));

  return (
    <div className="relative mb-1 h-20 w-20">
      <motion.div
        animate={{
          scale: active ? [1, 1 + pulse * 0.18, 1] : 1,
          opacity: active ? [0.65, 1, 0.72] : 0.55,
        }}
        transition={{ duration: 1.4, repeat: active ? Infinity : 0, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(241,224,176,0.16) 0%, rgba(212,166,86,0.08) 48%, transparent 72%)',
          boxShadow: active
            ? `0 0 ${18 + pulse * 28}px rgba(212,166,86,0.22)`
            : '0 0 18px rgba(212,166,86,0.08)',
        }}
      />
      <motion.div
        animate={{ rotate: active ? 360 : 12 }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-2 rounded-full"
        style={{
          border: '1px solid rgba(212,166,86,0.32)',
          background:
            'conic-gradient(from 180deg, rgba(241,224,176,0.28), transparent 18%, rgba(176,58,72,0.22), transparent 42%, rgba(212,166,86,0.28), transparent 72%, rgba(241,224,176,0.18))',
        }}
      />
      <div
        className="absolute inset-[18px] rounded-full"
        style={{
          border: '1px solid rgba(241,224,176,0.22)',
          background: 'rgba(6,5,4,0.55)',
          boxShadow: 'inset 0 0 18px rgba(212,166,86,0.08)',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-kai text-lg tracking-[0.18em] text-[#F1E0B0]">愿</span>
      </div>
    </div>
  );
}
