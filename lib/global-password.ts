import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { hasSupabaseServerEnv, supabaseAdmin } from '@/lib/supabase/server';
import { WishStoreError } from '@/lib/store-error';

export type StorageMode = 'local' | 'supabase';

const WISH_META_FILE = path.join(process.cwd(), 'public', 'wishes', 'meta.json');
const IMAGE_META_FILE = path.join(process.cwd(), 'public', 'images', 'meta.json');
const WISH_TABLE = process.env.SUPABASE_WISH_TABLE ?? 'birthday_wishes';
const IMAGE_TABLE = process.env.SUPABASE_IMAGE_TABLE ?? 'birthday_images';

/**
 * 统一的存储模式判定：优先 WISH_STORAGE_MODE，否则有 Supabase 环境即用 supabase。
 * 愿望与相册共用同一套判定，保证行为一致。
 */
export function getStorageMode(): StorageMode {
  const preferred = process.env.WISH_STORAGE_MODE?.toLowerCase();

  if (preferred === 'local') return 'local';

  if (preferred === 'supabase') {
    if (!hasSupabaseServerEnv || !supabaseAdmin) {
      throw new WishStoreError('MISCONFIGURED', 'WISH_STORAGE_MODE=supabase 但缺少 Supabase 环境变量');
    }
    return 'supabase';
  }

  return hasSupabaseServerEnv && supabaseAdmin ? 'supabase' : 'local';
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (storedHash.startsWith('scrypt:')) {
    const [, salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;

    const derived = crypto.scryptSync(password, salt, 64);
    const stored = Buffer.from(hash, 'hex');
    if (derived.length !== stored.length) return false;

    return crypto.timingSafeEqual(derived, stored);
  }

  const legacyHash = crypto.createHash('sha256').update(password).digest('hex');
  return legacyHash === storedHash;
}

type HashCandidate = { hash: string; createdAt: string };

async function readLocalHash(metaFile: string): Promise<HashCandidate | null> {
  try {
    const raw = await fs.readFile(metaFile, 'utf-8');
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : [parsed];
    let earliest: HashCandidate | null = null;

    for (const entry of list) {
      if (!entry || typeof entry.passwordHash !== 'string' || typeof entry.createdAt !== 'string') {
        continue;
      }
      if (!earliest || entry.createdAt < earliest.createdAt) {
        earliest = { hash: entry.passwordHash, createdAt: entry.createdAt };
      }
    }

    return earliest;
  } catch {
    return null;
  }
}

async function readSupabaseHash(table: string): Promise<HashCandidate | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from(table)
    .select('password_hash, created_at')
    .order('created_at', { ascending: true })
    .limit(1);

  if (error || !data || data.length === 0) return null;

  const row = data[0] as { password_hash: string; created_at: string };
  return { hash: row.password_hash, createdAt: row.created_at };
}

/**
 * 全站唯一密码：取愿望与相册中最早创建那条记录的密码哈希。
 * 首次许愿或首次上传照片时设置，之后不可更改，两处共用。
 * 无任何记录时返回 null（表示尚未设置密码）。
 */
export async function getCanonicalPasswordHash(): Promise<string | null> {
  const mode = getStorageMode();
  const candidates: HashCandidate[] = [];

  if (mode === 'supabase') {
    const [wishHash, imageHash] = await Promise.all([
      readSupabaseHash(WISH_TABLE),
      readSupabaseHash(IMAGE_TABLE),
    ]);
    if (wishHash) candidates.push(wishHash);
    if (imageHash) candidates.push(imageHash);
  } else {
    const [wishHash, imageHash] = await Promise.all([
      readLocalHash(WISH_META_FILE),
      readLocalHash(IMAGE_META_FILE),
    ]);
    if (wishHash) candidates.push(wishHash);
    if (imageHash) candidates.push(imageHash);
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return candidates[0].hash;
}

/**
 * 解析本次写入应使用的密码哈希：
 * - 已有全局密码：校验一致，返回既有哈希
 * - 尚无密码：以本次输入创建新哈希（成为全局密码）
 */
export async function resolvePasswordHashForWrite(password: string): Promise<string> {
  const canonical = await getCanonicalPasswordHash();
  if (canonical) {
    if (!verifyPassword(password, canonical)) {
      throw new WishStoreError('INVALID_PASSWORD', '密码不正确');
    }
    return canonical;
  }
  return hashPassword(password);
}

/** 校验访问密码是否与全局密码一致（无任何记录时抛 NOT_FOUND） */
export async function assertGlobalPassword(password: string): Promise<void> {
  const canonical = await getCanonicalPasswordHash();
  if (!canonical) {
    throw new WishStoreError('NOT_FOUND', '还没有任何记录');
  }
  if (!verifyPassword(password, canonical)) {
    throw new WishStoreError('INVALID_PASSWORD', '密码不正确');
  }
}
