'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Phase = 'check' | 'record' | 'locked' | 'unlock' | 'play' | 'error';

export default function WishRecorder({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>('check');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

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
        const type = mr.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        await uploadRecording(blob);
      };

      mr.start();
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    streamRef.current?.getTracks().forEach((t) => t.stop());
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
      }
    } catch {
      setError('上传失败，请重试');
      setPhase('record');
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
          className="w-full max-w-sm rounded-2xl p-8 flex flex-col items-center gap-5"
          style={{
            background: 'linear-gradient(160deg, rgba(20,16,14,0.95) 0%, rgba(12,10,8,0.98) 100%)',
            border: '1px solid rgba(201,163,104,0.25)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(201,163,104,0.08)',
          }}
        >
          {/* 标题 */}
          <div className="flex flex-col items-center gap-2">
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
            <div className="w-full flex flex-col items-center gap-4">
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
              ) : (
                <div className="flex flex-col items-center gap-3">
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

          {/* ===== 已有录音（锁定） ===== */}
          {phase === 'locked' && (
            <div className="w-full flex flex-col items-center gap-4">
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
            <div className="w-full flex flex-col items-center gap-4">
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
              className="font-song text-[#B03A48] text-xs text-center"
            >
              {error}
            </motion.p>
          )}

          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="font-song text-[#F3EBDD]/40 text-xs tracking-[0.2em] mt-2"
          >
            关闭
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
