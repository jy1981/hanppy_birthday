import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { hasSupabaseServerEnv, supabaseAdmin } from '@/lib/supabase/server';

const WISH_DIR = path.join(process.cwd(), 'public', 'wishes');
const META_FILE = path.join(WISH_DIR, 'meta.json');
const SUPABASE_WISH_TABLE = process.env.SUPABASE_WISH_TABLE ?? 'birthday_wishes';
const SUPABASE_WISH_BUCKET = process.env.SUPABASE_WISH_BUCKET ?? 'birthday-wishes';

type WishStorageMode = 'local' | 'supabase';

type LocalWishEntry = {
  passwordHash: string;
  audioName: string;
  createdAt: string;
  mimeType?: string;
};

type SupabaseWishRow = {
  id: string;
  password_hash: string;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  created_at: string;
};

export type WishSummary = {
  hasAnyWish: boolean;
  hasWishThisYear: boolean;
  year: number;
  count: number;
  storageMode: WishStorageMode;
};

export type WishReveal = {
  audioUrl: string;
  createdAt: string;
  year: number;
  storageMode: WishStorageMode;
};

export type WishListItem = {
  id: string;
  year: number;
  createdAt: string;
  audioUrl: string;
};

export type WishList = {
  wishes: WishListItem[];
  storageMode: WishStorageMode;
};

export type WishCreateInput = {
  audioBuffer: Buffer;
  password: string;
  originalFilename: string;
  mimeType: string;
};

export class WishStoreError extends Error {
  constructor(
    public code:
      | 'ALREADY_EXISTS'
      | 'NOT_FOUND'
      | 'INVALID_PASSWORD'
      | 'MISCONFIGURED'
      | 'UPLOAD_FAILED',
    message: string,
  ) {
    super(message);
    this.name = 'WishStoreError';
  }
}

function getWishStorageMode(): WishStorageMode {
  const preferredMode = process.env.WISH_STORAGE_MODE?.toLowerCase();

  if (preferredMode === 'local') {
    return 'local';
  }

  if (preferredMode === 'supabase') {
    if (!hasSupabaseServerEnv || !supabaseAdmin) {
      throw new WishStoreError('MISCONFIGURED', 'WISH_STORAGE_MODE=supabase 但缺少 Supabase 环境变量');
    }
    return 'supabase';
  }

  return hasSupabaseServerEnv && supabaseAdmin ? 'supabase' : 'local';
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (storedHash.startsWith('scrypt:')) {
    const [, salt, hash] = storedHash.split(':');

    if (!salt || !hash) {
      return false;
    }

    const derived = crypto.scryptSync(password, salt, 64);
    const stored = Buffer.from(hash, 'hex');

    if (derived.length !== stored.length) {
      return false;
    }

    return crypto.timingSafeEqual(derived, stored);
  }

  const legacyHash = crypto.createHash('sha256').update(password).digest('hex');
  return legacyHash === storedHash;
}

function inferExtension(originalFilename: string, mimeType: string): string {
  const normalizedName = originalFilename.toLowerCase();
  const normalizedType = mimeType.toLowerCase();

  if (normalizedName.endsWith('.m4a') || normalizedType.includes('mp4')) return 'm4a';
  if (normalizedName.endsWith('.mp4')) return 'mp4';
  if (normalizedName.endsWith('.wav') || normalizedType.includes('wav')) return 'wav';
  if (normalizedName.endsWith('.ogg') || normalizedType.includes('ogg')) return 'ogg';
  return 'webm';
}

function wishYear(createdAt: string): number {
  return new Date(createdAt).getFullYear();
}

async function readLocalEntries(): Promise<LocalWishEntry[]> {
  try {
    const raw = await fs.readFile(META_FILE, 'utf-8');
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed as LocalWishEntry[];
    }

    // 兼容旧版单条 meta.json 结构
    if (parsed && typeof parsed === 'object' && typeof parsed.audioName === 'string') {
      return [parsed as LocalWishEntry];
    }

    return [];
  } catch {
    return [];
  }
}

async function writeLocalEntries(entries: LocalWishEntry[]) {
  await fs.mkdir(WISH_DIR, { recursive: true });
  await fs.writeFile(META_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

async function getSupabaseWishRows(): Promise<SupabaseWishRow[]> {
  if (!supabaseAdmin) {
    throw new WishStoreError('MISCONFIGURED', 'Supabase 客户端未初始化');
  }

  const { data, error } = await supabaseAdmin
    .from(SUPABASE_WISH_TABLE)
    .select('id, password_hash, storage_path, original_filename, mime_type, file_size, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw new WishStoreError('UPLOAD_FAILED', `读取愿望记录失败: ${error.message}`);
  }

  return (data as SupabaseWishRow[] | null) ?? [];
}

// 密码只在第一次许愿时设置，之后所有年份复用同一份哈希。取最早那条作为“权威密码”。
function canonicalHashFromRows(rows: SupabaseWishRow[]): string | null {
  if (rows.length === 0) return null;
  return rows[rows.length - 1].password_hash;
}

function canonicalHashFromEntries(entries: LocalWishEntry[]): string | null {
  if (entries.length === 0) return null;
  return entries[0].passwordHash;
}

async function createSupabaseSignedUrl(storagePath: string): Promise<string> {
  if (!supabaseAdmin) {
    throw new WishStoreError('MISCONFIGURED', 'Supabase 客户端未初始化');
  }

  const { data, error } = await supabaseAdmin.storage
    .from(SUPABASE_WISH_BUCKET)
    .createSignedUrl(storagePath, 60 * 30);

  if (error || !data?.signedUrl) {
    throw new WishStoreError('UPLOAD_FAILED', `生成音频访问链接失败: ${error?.message ?? 'unknown error'}`);
  }

  return data.signedUrl;
}

export async function getWishSummary(): Promise<WishSummary> {
  const storageMode = getWishStorageMode();
  const year = new Date().getFullYear();

  if (storageMode === 'supabase') {
    const rows = await getSupabaseWishRows();
    return {
      hasAnyWish: rows.length > 0,
      hasWishThisYear: rows.some((row) => wishYear(row.created_at) === year),
      year,
      count: rows.length,
      storageMode,
    };
  }

  const entries = await readLocalEntries();
  return {
    hasAnyWish: entries.length > 0,
    hasWishThisYear: entries.some((entry) => wishYear(entry.createdAt) === year),
    year,
    count: entries.length,
    storageMode,
  };
}

export async function createWish(input: WishCreateInput): Promise<WishReveal> {
  const storageMode = getWishStorageMode();
  const year = new Date().getFullYear();

  if (storageMode === 'supabase') {
    if (!supabaseAdmin) {
      throw new WishStoreError('MISCONFIGURED', 'Supabase 客户端未初始化');
    }

    const rows = await getSupabaseWishRows();
    const canonicalHash = canonicalHashFromRows(rows);

    let passwordHash: string;
    if (canonicalHash) {
      // 已有愿望：必须用既定密码，且今年不能重复许愿
      if (!verifyPassword(input.password, canonicalHash)) {
        throw new WishStoreError('INVALID_PASSWORD', '密码不正确');
      }
      if (rows.some((row) => wishYear(row.created_at) === year)) {
        throw new WishStoreError('ALREADY_EXISTS', `${year} 年已经许过愿望啦`);
      }
      passwordHash = canonicalHash;
    } else {
      // 第一次许愿：设置密码
      passwordHash = hashPassword(input.password);
    }

    const id = crypto.randomUUID();
    const ext = inferExtension(input.originalFilename, input.mimeType);
    const storagePath = `wishes/${new Date().toISOString().slice(0, 10)}/${id}.${ext}`;

    const uploadResult = await supabaseAdmin.storage
      .from(SUPABASE_WISH_BUCKET)
      .upload(storagePath, input.audioBuffer, {
        contentType: input.mimeType,
        upsert: false,
      });

    if (uploadResult.error) {
      throw new WishStoreError('UPLOAD_FAILED', `上传录音文件失败: ${uploadResult.error.message}`);
    }

    const { data, error } = await supabaseAdmin
      .from(SUPABASE_WISH_TABLE)
      .insert({
        id,
        password_hash: passwordHash,
        storage_path: storagePath,
        original_filename: input.originalFilename,
        mime_type: input.mimeType,
        file_size: input.audioBuffer.byteLength,
      })
      .select('created_at')
      .single();

    if (error) {
      await supabaseAdmin.storage.from(SUPABASE_WISH_BUCKET).remove([storagePath]);
      throw new WishStoreError('UPLOAD_FAILED', `写入愿望记录失败: ${error.message}`);
    }

    const createdAt = data.created_at as string;
    return {
      audioUrl: await createSupabaseSignedUrl(storagePath),
      createdAt,
      year: wishYear(createdAt),
      storageMode,
    };
  }

  const entries = await readLocalEntries();
  const canonicalHash = canonicalHashFromEntries(entries);

  let passwordHash: string;
  if (canonicalHash) {
    if (!verifyPassword(input.password, canonicalHash)) {
      throw new WishStoreError('INVALID_PASSWORD', '密码不正确');
    }
    if (entries.some((entry) => wishYear(entry.createdAt) === year)) {
      throw new WishStoreError('ALREADY_EXISTS', `${year} 年已经许过愿望啦`);
    }
    passwordHash = canonicalHash;
  } else {
    passwordHash = hashPassword(input.password);
  }

  const ext = inferExtension(input.originalFilename, input.mimeType);
  const audioName = `wish_${Date.now()}.${ext}`;

  await fs.mkdir(WISH_DIR, { recursive: true });
  await fs.writeFile(path.join(WISH_DIR, audioName), input.audioBuffer);

  const createdAt = new Date().toISOString();
  entries.push({
    passwordHash,
    audioName,
    createdAt,
    mimeType: input.mimeType,
  });
  await writeLocalEntries(entries);

  return {
    audioUrl: `/wishes/${audioName}`,
    createdAt,
    year: wishYear(createdAt),
    storageMode,
  };
}

export async function listWishes(password: string): Promise<WishList> {
  const storageMode = getWishStorageMode();

  if (storageMode === 'supabase') {
    const rows = await getSupabaseWishRows();
    if (rows.length === 0) {
      throw new WishStoreError('NOT_FOUND', '还没有任何愿望');
    }

    const canonicalHash = canonicalHashFromRows(rows);
    if (!canonicalHash || !verifyPassword(password, canonicalHash)) {
      throw new WishStoreError('INVALID_PASSWORD', '密码不正确');
    }

    const wishes = await Promise.all(
      rows.map(async (row) => ({
        id: row.id,
        year: wishYear(row.created_at),
        createdAt: row.created_at,
        audioUrl: await createSupabaseSignedUrl(row.storage_path),
      })),
    );

    wishes.sort((a, b) => b.year - a.year);
    return { wishes, storageMode };
  }

  const entries = await readLocalEntries();
  if (entries.length === 0) {
    throw new WishStoreError('NOT_FOUND', '还没有任何愿望');
  }

  const canonicalHash = canonicalHashFromEntries(entries);
  if (!canonicalHash || !verifyPassword(password, canonicalHash)) {
    throw new WishStoreError('INVALID_PASSWORD', '密码不正确');
  }

  const wishes = entries
    .map((entry) => ({
      id: entry.audioName,
      year: wishYear(entry.createdAt),
      createdAt: entry.createdAt,
      audioUrl: `/wishes/${entry.audioName}`,
    }))
    .sort((a, b) => b.year - a.year);

  return { wishes, storageMode };
}

export async function deleteWish(password: string): Promise<void> {
  const storageMode = getWishStorageMode();

  if (storageMode === 'supabase') {
    if (!supabaseAdmin) {
      throw new WishStoreError('MISCONFIGURED', 'Supabase 客户端未初始化');
    }

    const rows = await getSupabaseWishRows();
    if (rows.length === 0) {
      throw new WishStoreError('NOT_FOUND', '还没有任何愿望');
    }

    const canonicalHash = canonicalHashFromRows(rows);
    if (!canonicalHash || !verifyPassword(password, canonicalHash)) {
      throw new WishStoreError('INVALID_PASSWORD', '密码不正确');
    }

    const target = rows[0];
    const deleteStorageResult = await supabaseAdmin.storage
      .from(SUPABASE_WISH_BUCKET)
      .remove([target.storage_path]);

    if (deleteStorageResult.error) {
      throw new WishStoreError('UPLOAD_FAILED', `删除录音文件失败: ${deleteStorageResult.error.message}`);
    }

    const { error } = await supabaseAdmin.from(SUPABASE_WISH_TABLE).delete().eq('id', target.id);
    if (error) {
      throw new WishStoreError('UPLOAD_FAILED', `删除愿望记录失败: ${error.message}`);
    }

    return;
  }

  const entries = await readLocalEntries();
  if (entries.length === 0) {
    throw new WishStoreError('NOT_FOUND', '还没有任何愿望');
  }

  const canonicalHash = canonicalHashFromEntries(entries);
  if (!canonicalHash || !verifyPassword(password, canonicalHash)) {
    throw new WishStoreError('INVALID_PASSWORD', '密码不正确');
  }

  const target = entries[entries.length - 1];
  await fs.unlink(path.join(WISH_DIR, target.audioName)).catch(() => {});

  const remaining = entries.slice(0, -1);
  if (remaining.length === 0) {
    await fs.unlink(META_FILE).catch(() => {});
  } else {
    await writeLocalEntries(remaining);
  }
}

// ===== 后台管理（凭 WISH_ADMIN_PASSWORD 鉴权，不需要愿望密码） =====

function assertAdminPassword(password: string): void {
  const adminPassword = process.env.WISH_ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new WishStoreError('MISCONFIGURED', '未配置 WISH_ADMIN_PASSWORD');
  }

  const input = Buffer.from(password);
  const expected = Buffer.from(adminPassword);

  if (input.length !== expected.length || !crypto.timingSafeEqual(input, expected)) {
    throw new WishStoreError('INVALID_PASSWORD', '管理密码不正确');
  }
}

export async function adminListWishes(adminPassword: string): Promise<WishList> {
  assertAdminPassword(adminPassword);
  const storageMode = getWishStorageMode();

  if (storageMode === 'supabase') {
    const rows = await getSupabaseWishRows();
    const wishes = await Promise.all(
      rows.map(async (row) => ({
        id: row.id,
        year: wishYear(row.created_at),
        createdAt: row.created_at,
        audioUrl: await createSupabaseSignedUrl(row.storage_path),
      })),
    );

    wishes.sort((a, b) => b.year - a.year);
    return { wishes, storageMode };
  }

  const entries = await readLocalEntries();
  const wishes = entries
    .map((entry) => ({
      id: entry.audioName,
      year: wishYear(entry.createdAt),
      createdAt: entry.createdAt,
      audioUrl: `/wishes/${entry.audioName}`,
    }))
    .sort((a, b) => b.year - a.year);

  return { wishes, storageMode };
}

export async function adminDeleteWish(adminPassword: string, id: string): Promise<void> {
  assertAdminPassword(adminPassword);
  const storageMode = getWishStorageMode();

  if (storageMode === 'supabase') {
    if (!supabaseAdmin) {
      throw new WishStoreError('MISCONFIGURED', 'Supabase 客户端未初始化');
    }

    const rows = await getSupabaseWishRows();
    const target = rows.find((row) => row.id === id);
    if (!target) {
      throw new WishStoreError('NOT_FOUND', '愿望不存在');
    }

    const deleteStorageResult = await supabaseAdmin.storage
      .from(SUPABASE_WISH_BUCKET)
      .remove([target.storage_path]);

    if (deleteStorageResult.error) {
      throw new WishStoreError('UPLOAD_FAILED', `删除录音文件失败: ${deleteStorageResult.error.message}`);
    }

    const { error } = await supabaseAdmin.from(SUPABASE_WISH_TABLE).delete().eq('id', target.id);
    if (error) {
      throw new WishStoreError('UPLOAD_FAILED', `删除愿望记录失败: ${error.message}`);
    }

    return;
  }

  const entries = await readLocalEntries();
  const target = entries.find((entry) => entry.audioName === id);
  if (!target) {
    throw new WishStoreError('NOT_FOUND', '愿望不存在');
  }

  await fs.unlink(path.join(WISH_DIR, target.audioName)).catch(() => {});

  const remaining = entries.filter((entry) => entry.audioName !== id);
  if (remaining.length === 0) {
    await fs.unlink(META_FILE).catch(() => {});
  } else {
    await writeLocalEntries(remaining);
  }
}

export async function adminClearWishes(adminPassword: string): Promise<number> {
  assertAdminPassword(adminPassword);
  const storageMode = getWishStorageMode();

  if (storageMode === 'supabase') {
    if (!supabaseAdmin) {
      throw new WishStoreError('MISCONFIGURED', 'Supabase 客户端未初始化');
    }

    const rows = await getSupabaseWishRows();
    if (rows.length === 0) {
      return 0;
    }

    const paths = rows.map((row) => row.storage_path);
    const deleteStorageResult = await supabaseAdmin.storage
      .from(SUPABASE_WISH_BUCKET)
      .remove(paths);

    if (deleteStorageResult.error) {
      throw new WishStoreError('UPLOAD_FAILED', `清空录音文件失败: ${deleteStorageResult.error.message}`);
    }

    const { error } = await supabaseAdmin
      .from(SUPABASE_WISH_TABLE)
      .delete()
      .in('id', rows.map((row) => row.id));

    if (error) {
      throw new WishStoreError('UPLOAD_FAILED', `清空愿望记录失败: ${error.message}`);
    }

    return rows.length;
  }

  const entries = await readLocalEntries();
  await Promise.all(
    entries.map((entry) => fs.unlink(path.join(WISH_DIR, entry.audioName)).catch(() => {})),
  );
  await fs.unlink(META_FILE).catch(() => {});
  return entries.length;
}
