import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { hasSupabaseServerEnv, supabaseAdmin } from '@/lib/supabase/server';

const WISH_DIR = path.join(process.cwd(), 'public', 'wishes');
const META_FILE = path.join(WISH_DIR, 'meta.json');
const SUPABASE_WISH_TABLE = process.env.SUPABASE_WISH_TABLE ?? 'birthday_wishes';
const SUPABASE_WISH_BUCKET = process.env.SUPABASE_WISH_BUCKET ?? 'birthday-wishes';

type WishStorageMode = 'local' | 'supabase';

type LocalWishMeta = {
  passwordHash: string;
  audioName: string;
  createdAt: string;
  mimeType?: string;
  storageMode?: WishStorageMode;
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
  hasWish: boolean;
  createdAt?: string;
  storageMode: WishStorageMode;
};

export type WishReveal = {
  audioUrl: string;
  createdAt: string;
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

async function readLocalMeta(): Promise<LocalWishMeta | null> {
  try {
    const raw = await fs.readFile(META_FILE, 'utf-8');
    return JSON.parse(raw) as LocalWishMeta;
  } catch {
    return null;
  }
}

async function writeLocalMeta(meta: LocalWishMeta) {
  await fs.mkdir(WISH_DIR, { recursive: true });
  await fs.writeFile(META_FILE, JSON.stringify(meta, null, 2), 'utf-8');
}

async function getSupabaseWishRow(): Promise<SupabaseWishRow | null> {
  if (!supabaseAdmin) {
    throw new WishStoreError('MISCONFIGURED', 'Supabase 客户端未初始化');
  }

  const { data, error } = await supabaseAdmin
    .from(SUPABASE_WISH_TABLE)
    .select('id, password_hash, storage_path, original_filename, mime_type, file_size, created_at')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    throw new WishStoreError('UPLOAD_FAILED', `读取愿望记录失败: ${error.message}`);
  }

  return (data?.[0] as SupabaseWishRow | undefined) ?? null;
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

  if (storageMode === 'supabase') {
    const wish = await getSupabaseWishRow();
    return {
      hasWish: Boolean(wish),
      createdAt: wish?.created_at,
      storageMode,
    };
  }

  const meta = await readLocalMeta();
  return {
    hasWish: Boolean(meta),
    createdAt: meta?.createdAt,
    storageMode,
  };
}

export async function createWish(input: WishCreateInput): Promise<WishReveal> {
  const storageMode = getWishStorageMode();

  if (storageMode === 'supabase') {
    if (!supabaseAdmin) {
      throw new WishStoreError('MISCONFIGURED', 'Supabase 客户端未初始化');
    }

    const existing = await getSupabaseWishRow();
    if (existing) {
      throw new WishStoreError('ALREADY_EXISTS', '已有录音，如需覆盖请先删除');
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

    const passwordHash = hashPassword(input.password);
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

    return {
      audioUrl: await createSupabaseSignedUrl(storagePath),
      createdAt: data.created_at as string,
      storageMode,
    };
  }

  const existing = await readLocalMeta();
  if (existing) {
    throw new WishStoreError('ALREADY_EXISTS', '已有录音，如需覆盖请先删除');
  }

  const ext = inferExtension(input.originalFilename, input.mimeType);
  const audioName = `wish_${Date.now()}.${ext}`;

  await fs.mkdir(WISH_DIR, { recursive: true });
  await fs.writeFile(path.join(WISH_DIR, audioName), input.audioBuffer);

  const createdAt = new Date().toISOString();
  await writeLocalMeta({
    passwordHash: hashPassword(input.password),
    audioName,
    createdAt,
    mimeType: input.mimeType,
    storageMode,
  });

  return {
    audioUrl: `/wishes/${audioName}`,
    createdAt,
    storageMode,
  };
}

export async function revealWish(password: string): Promise<WishReveal> {
  const storageMode = getWishStorageMode();

  if (storageMode === 'supabase') {
    const wish = await getSupabaseWishRow();
    if (!wish) {
      throw new WishStoreError('NOT_FOUND', '尚无录音');
    }

    if (!verifyPassword(password, wish.password_hash)) {
      throw new WishStoreError('INVALID_PASSWORD', '密码不正确');
    }

    return {
      audioUrl: await createSupabaseSignedUrl(wish.storage_path),
      createdAt: wish.created_at,
      storageMode,
    };
  }

  const meta = await readLocalMeta();
  if (!meta) {
    throw new WishStoreError('NOT_FOUND', '尚无录音');
  }

  if (!verifyPassword(password, meta.passwordHash)) {
    throw new WishStoreError('INVALID_PASSWORD', '密码不正确');
  }

  return {
    audioUrl: `/wishes/${meta.audioName}`,
    createdAt: meta.createdAt,
    storageMode,
  };
}

export async function deleteWish(password: string): Promise<void> {
  const storageMode = getWishStorageMode();

  if (storageMode === 'supabase') {
    if (!supabaseAdmin) {
      throw new WishStoreError('MISCONFIGURED', 'Supabase 客户端未初始化');
    }

    const wish = await getSupabaseWishRow();
    if (!wish) {
      throw new WishStoreError('NOT_FOUND', '尚无录音');
    }

    if (!verifyPassword(password, wish.password_hash)) {
      throw new WishStoreError('INVALID_PASSWORD', '密码不正确');
    }

    const deleteStorageResult = await supabaseAdmin.storage
      .from(SUPABASE_WISH_BUCKET)
      .remove([wish.storage_path]);

    if (deleteStorageResult.error) {
      throw new WishStoreError('UPLOAD_FAILED', `删除录音文件失败: ${deleteStorageResult.error.message}`);
    }

    const { error } = await supabaseAdmin.from(SUPABASE_WISH_TABLE).delete().eq('id', wish.id);
    if (error) {
      throw new WishStoreError('UPLOAD_FAILED', `删除愿望记录失败: ${error.message}`);
    }

    return;
  }

  const meta = await readLocalMeta();
  if (!meta) {
    throw new WishStoreError('NOT_FOUND', '尚无录音');
  }

  if (!verifyPassword(password, meta.passwordHash)) {
    throw new WishStoreError('INVALID_PASSWORD', '密码不正确');
  }

  await fs.unlink(path.join(WISH_DIR, meta.audioName)).catch(() => {});
  await fs.unlink(META_FILE).catch(() => {});
}
