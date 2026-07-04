'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type WishItem = {
  id: string;
  year: number;
  createdAt: string;
  audioUrl: string;
};

type Phase = 'unlock' | 'list';

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>('unlock');
  const [password, setPassword] = useState('');
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const unlock = async () => {
    setError('');
    if (!password) {
      setError('请输入管理密码');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/wish/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        setWishes(Array.isArray(data.wishes) ? data.wishes : []);
        setPhase('list');
      } else {
        setError(data.error || '管理密码不正确');
      }
    } catch {
      setError('验证失败，请重试');
    } finally {
      setBusy(false);
    }
  };

  const refresh = async () => {
    try {
      const res = await fetch('/api/wish/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        setWishes(Array.isArray(data.wishes) ? data.wishes : []);
      }
    } catch {
      /* 静默：刷新失败不影响已展示列表 */
    }
  };

  const deleteOne = async (id: string) => {
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/wish/admin', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, id }),
      });
      const data = await res.json();
      if (data.ok) {
        setWishes((prev) => prev.filter((w) => w.id !== id));
      } else {
        setError(data.error || '删除失败');
      }
    } catch {
      setError('删除失败，请重试');
    } finally {
      setBusy(false);
    }
  };

  const clearAll = async () => {
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/wish/admin', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, clearAll: true }),
      });
      const data = await res.json();
      if (data.ok) {
        setWishes([]);
        setConfirmClear(false);
      } else {
        setError(data.error || '清空失败');
      }
    } catch {
      setError('清空失败，请重试');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[400] flex items-center justify-center px-6"
        style={{ background: 'rgba(4,4,6,0.9)', backdropFilter: 'blur(10px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 16 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md overflow-hidden rounded-2xl p-7 flex flex-col items-center gap-5"
          style={{
            background: 'linear-gradient(160deg, rgba(18,18,22,0.96) 0%, rgba(10,10,12,0.98) 100%)',
            border: '1px solid rgba(120,150,190,0.28)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}
        >
          {/* 标题 */}
          <div className="w-full flex flex-col items-center gap-1">
            <span className="font-en text-[10px] tracking-[0.4em] text-[#7C93B6]/70">
              ADMIN CONSOLE
            </span>
            <h3 className="font-kai text-xl text-[#DCE6F2] tracking-[0.15em]">愿望后台</h3>
          </div>

          {phase === 'unlock' && (
            <div className="w-full flex flex-col items-center gap-4">
              <p className="font-song text-[#C4D0E0]/60 text-sm text-center leading-relaxed">
                输入管理密码进入后台
                <br />
                <span className="text-[#C4D0E0]/35 text-xs">可查看、试听、删除、清空所有愿望</span>
              </p>
              <input
                type="password"
                placeholder="管理密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && unlock()}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-[#7C93B6]/25 text-[#DCE6F2] text-sm font-song text-center outline-none focus:border-[#7C93B6]/55 transition-colors"
                style={{ letterSpacing: '0.1em' }}
              />
              <button
                onClick={unlock}
                disabled={busy}
                className="w-full py-2.5 rounded-lg font-kai text-sm tracking-[0.2em] disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, rgba(90,120,170,0.3) 0%, rgba(140,170,210,0.18) 100%)',
                  border: '1px solid rgba(120,150,190,0.4)',
                  color: '#DCE6F2',
                }}
              >
                {busy ? '验证中…' : '进入后台'}
              </button>
            </div>
          )}

          {phase === 'list' && (
            <div className="w-full flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-song text-[#C4D0E0]/60 text-xs">
                  共 {wishes.length} 条愿望
                </span>
                <button
                  onClick={refresh}
                  disabled={busy}
                  className="font-song text-[#7C93B6]/80 text-xs underline underline-offset-4 disabled:opacity-50"
                >
                  刷新
                </button>
              </div>

              <div className="w-full flex flex-col gap-3 max-h-[46vh] overflow-y-auto pr-1">
                {wishes.length === 0 && (
                  <p className="font-song text-[#C4D0E0]/35 text-xs text-center py-6">
                    暂无愿望
                  </p>
                )}
                {wishes.map((wish) => (
                  <div
                    key={wish.id}
                    className="w-full flex flex-col gap-2 rounded-xl p-3"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(120,150,190,0.18)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-kai text-[#DCE6F2] text-base tracking-[0.12em]">
                        {wish.year} 年
                      </span>
                      <span className="font-en text-[#C4D0E0]/40 text-[10px] tracking-[0.12em]">
                        {new Date(wish.createdAt).toLocaleString('zh-CN')}
                      </span>
                    </div>
                    <audio src={wish.audioUrl} controls className="w-full" style={{ filter: 'sepia(0.05)' }} />
                    <button
                      onClick={() => deleteOne(wish.id)}
                      disabled={busy}
                      className="self-end px-3 py-1 rounded-md text-xs font-song tracking-[0.1em] disabled:opacity-50"
                      style={{
                        border: '1px solid rgba(200,80,90,0.5)',
                        color: '#E8A0A8',
                      }}
                    >
                      删除这条
                    </button>
                  </div>
                ))}
              </div>

              {wishes.length > 0 && (
                <div className="w-full flex flex-col gap-2 pt-1">
                  {!confirmClear ? (
                    <button
                      onClick={() => setConfirmClear(true)}
                      disabled={busy}
                      className="w-full py-2.5 rounded-lg font-kai text-sm tracking-[0.2em] disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, rgba(180,60,70,0.28) 0%, rgba(140,40,50,0.18) 100%)',
                        border: '1px solid rgba(200,80,90,0.45)',
                        color: '#E8A0A8',
                      }}
                    >
                      清空全部
                    </button>
                  ) : (
                    <div className="w-full flex flex-col gap-2">
                      <p className="font-song text-[#E8A0A8] text-xs text-center">
                        确认清空全部 {wishes.length} 条愿望？此操作不可恢复
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={clearAll}
                          disabled={busy}
                          className="flex-1 py-2.5 rounded-lg font-kai text-sm tracking-[0.15em] disabled:opacity-50"
                          style={{
                            background: 'linear-gradient(135deg, rgba(200,60,70,0.4) 0%, rgba(150,40,50,0.3) 100%)',
                            border: '1px solid rgba(220,90,100,0.6)',
                            color: '#FFE0E4',
                          }}
                        >
                          {busy ? '清空中…' : '确认清空'}
                        </button>
                        <button
                          onClick={() => setConfirmClear(false)}
                          disabled={busy}
                          className="flex-1 py-2.5 rounded-lg font-song text-sm tracking-[0.15em] border border-[#7C93B6]/30 text-[#C4D0E0]/70 disabled:opacity-50"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-song text-[#E8737F] text-xs text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            onClick={onClose}
            className="font-song text-[#C4D0E0]/40 text-xs tracking-[0.2em] mt-1"
          >
            关闭
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
