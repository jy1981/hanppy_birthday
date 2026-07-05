import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  type StorageMode,
  assertGlobalPassword,
  getStorageMode,
  resolvePasswordHashForWrite,
} from '@/lib/global-password';
import { WishStoreError } from '@/lib/store-error';

export { WishStoreError } from '@/lib/store-error';

const IMAGE_DIR = path.join(process.cwd(), 'public', 'images');
const META_FILE = path.join(IMAGE_DIR, 'meta.json');
const SUPABASE_IMAGE_TABLE = process.env.SUPABASE_IMAGE_TABLE ?? 'birthday_images';
const SUPABASE_IMAGE_BUCKET = process.env.SUPABASE_IMAGE_BUCKET ?? 'birthday-images';

type LocalImageEntry = {
  passwordHash: string;
  imageName: string;
  createdAt: string;
  mimeType?: string;
};

type SupabaseImageRow = {
  id: string;
  password_hash: string;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  created_at: string;
};

export type ImageSummary = {
  hasAnyImage: boolean;
  hasImageThisYear: boolean;
  year: number;
  count: number;
  storageMode: StorageMode;
};

export type ImageReveal = {
  imageUrl: string;
  createdAt: string;
  year: number;
  storageMode: StorageMode;
};

export type ImageListItem = {
  id: string;
  year: number;
  createdAt: string;
  imageUrl: string;
};

export type ImageList = {
  images: ImageListItem[];
  storageMode: StorageMode;
};

export type ImageCreateInput = {
  imageBuffer: Buffer;
  password: string;
  originalFilename: string;
  mimeType: string;
};

function inferExtension(originalFilename: string, mimeType: string): string {
  const normalizedName = originalFilename.toLowerCase();
  const normalizedType = mimeType.toLowerCase();

  if (normalizedName.endsWith('.png') || normalizedType.includes('png')) return 'png';
  if (normalizedName.endsWith('.webp') || normalizedType.includes('webp')) return 'webp';
  if (normalizedName.endsWith('.gif') || normalizedType.includes('gif')) return 'gif';
  if (normalizedName.endsWith('.heic') || normalizedType.includes('heic')) return 'heic';
  if (
    normalizedName.endsWith('.jpg') ||
    normalizedName.endsWith('.jpeg') ||
    normalizedType.includes('jpeg') ||
    normalizedType.includes('jpg')
  ) {
    return 'jpg';
  }
  return 'jpg';
}

function imageYear(createdAt: string): number {
  return new Date(createdAt).getFullYear();
}

async function readLocalEntries(): Promise<LocalImageEntry[]> {
  try {
    const raw = await fs.readFile(META_FILE, 'utf-8');
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed as LocalImageEntry[];
    }

    if (parsed && typeof parsed === 'object' && typeof parsed.imageName === 'string') {
      return [parsed as LocalImageEntry];
    }

    return [];
  } catch {
    return [];
  }
}

async function writeLocalEntries(entries: LocalImageEntry[]) {
  await fs.mkdir(IMAGE_DIR, { recursive: true });
  await fs.writeFile(META_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

async function getSupabaseImageRows(): Promise<SupabaseImageRow[]> {
  if (!supabaseAdmin) {
    throw new WishStoreError('MISCONFIGURED', 'Supabase 客户端未初始化');
  }

  const { data, error } = await supabaseAdmin
    .from(SUPABASE_IMAGE_TABLE)
    .select('id, password_hash, storage_path, original_filename, mime_type, file_size, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw new WishStoreError('UPLOAD_FAILED', `读取照片记录失败: ${error.message}`);
  }

  return (data as SupabaseImageRow[] | null) ?? [];
}

async function createSupabaseSignedUrl(storagePath: string): Promise<string> {
  if (!supabaseAdmin) {
    throw new WishStoreError('MISCONFIGURED', 'Supabase 客户端未初始化');
  }

  const { data, error } = await supabaseAdmin.storage
    .from(SUPABASE_IMAGE_BUCKET)
    .createSignedUrl(storagePath, 60 * 30);

  if (error || !data?.signedUrl) {
    throw new WishStoreError('UPLOAD_FAILED', `生成照片访问链接失败: ${error?.message ?? 'unknown error'}`);
  }

  return data.signedUrl;
}

export async function getImageSummary(): Promise<ImageSummary> {
  const storageMode = getStorageMode();
  const year = new Date().getFullYear();

  if (storageMode === 'supabase') {
    const rows = await getSupabaseImageRows();
    return {
      hasAnyImage: rows.length > 0,
      hasImageThisYear: rows.some((row) => imageYear(row.created_at) === year),
      year,
      count: rows.length,
      storageMode,
    };
  }

  const entries = await readLocalEntries();
  return {
    hasAnyImage: entries.length > 0,
    hasImageThisYear: entries.some((entry) => imageYear(entry.createdAt) === year),
    year,
    count: entries.length,
    storageMode,
  };
}

export async function createImage(input: ImageCreateInput): Promise<ImageReveal> {
  const storageMode = getStorageMode();
  const year = new Date().getFullYear();

  if (storageMode === 'supabase') {
    if (!supabaseAdmin) {
      throw new WishStoreError('MISCONFIGURED', 'Supabase 客户端未初始化');
    }

    const rows = await getSupabaseImageRows();
    // 今年只能传一张照片（录音名额独立，不在此限制）
    if (rows.some((row) => imageYear(row.created_at) === year)) {
      throw new WishStoreError('ALREADY_EXISTS', `${year} 年已经传过照片啦`);
    }
    // 全站唯一密码：首次设置，之后校验一致（愿望与相册共用）
    const passwordHash = await resolvePasswordHashForWrite(input.password);

    const id = crypto.randomUUID();
    const ext = inferExtension(input.originalFilename, input.mimeType);
    const storagePath = `images/${new Date().toISOString().slice(0, 10)}/${id}.${ext}`;

    const uploadResult = await supabaseAdmin.storage
      .from(SUPABASE_IMAGE_BUCKET)
      .upload(storagePath, input.imageBuffer, {
        contentType: input.mimeType,
        upsert: false,
      });

    if (uploadResult.error) {
      throw new WishStoreError('UPLOAD_FAILED', `上传照片失败: ${uploadResult.error.message}`);
    }

    const { data, error } = await supabaseAdmin
      .from(SUPABASE_IMAGE_TABLE)
      .insert({
        id,
        password_hash: passwordHash,
        storage_path: storagePath,
        original_filename: input.originalFilename,
        mime_type: input.mimeType,
        file_size: input.imageBuffer.byteLength,
      })
      .select('created_at')
      .single();

    if (error) {
      await supabaseAdmin.storage.from(SUPABASE_IMAGE_BUCKET).remove([storagePath]);
      throw new WishStoreError('UPLOAD_FAILED', `写入照片记录失败: ${error.message}`);
    }

    const createdAt = data.created_at as string;
    return {
      imageUrl: await createSupabaseSignedUrl(storagePath),
      createdAt,
      year: imageYear(createdAt),
      storageMode,
    };
  }

  const entries = await readLocalEntries();
  // 今年只能传一张照片
  if (entries.some((entry) => imageYear(entry.createdAt) === year)) {
    throw new WishStoreError('ALREADY_EXISTS', `${year} 年已经传过照片啦`);
  }
  // 全站唯一密码：首次设置，之后校验一致（愿望与相册共用）
  const passwordHash = await resolvePasswordHashForWrite(input.password);

  const ext = inferExtension(input.originalFilename, input.mimeType);
  const imageName = `image_${Date.now()}.${ext}`;

  await fs.mkdir(IMAGE_DIR, { recursive: true });
  await fs.writeFile(path.join(IMAGE_DIR, imageName), input.imageBuffer);

  const createdAt = new Date().toISOString();
  entries.push({
    passwordHash,
    imageName,
    createdAt,
    mimeType: input.mimeType,
  });
  await writeLocalEntries(entries);

  return {
    imageUrl: `/images/${imageName}`,
    createdAt,
    year: imageYear(createdAt),
    storageMode,
  };
}

export async function listImages(password: string): Promise<ImageList> {
  const storageMode = getStorageMode();
  await assertGlobalPassword(password);

  if (storageMode === 'supabase') {
    const rows = await getSupabaseImageRows();

    const images = await Promise.all(
      rows.map(async (row) => ({
        id: row.id,
        year: imageYear(row.created_at),
        createdAt: row.created_at,
        imageUrl: await createSupabaseSignedUrl(row.storage_path),
      })),
    );

    images.sort((a, b) => b.year - a.year);
    return { images, storageMode };
  }

  const entries = await readLocalEntries();

  const images = entries
    .map((entry) => ({
      id: entry.imageName,
      year: imageYear(entry.createdAt),
      createdAt: entry.createdAt,
      imageUrl: `/images/${entry.imageName}`,
    }))
    .sort((a, b) => b.year - a.year);

  return { images, storageMode };
}

// ===== 后台管理（凭 WISH_ADMIN_PASSWORD 鉴权，不需要相册密码） =====

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

export async function adminListImages(adminPassword: string): Promise<ImageList> {
  assertAdminPassword(adminPassword);
  const storageMode = getStorageMode();

  if (storageMode === 'supabase') {
    const rows = await getSupabaseImageRows();
    const images = await Promise.all(
      rows.map(async (row) => ({
        id: row.id,
        year: imageYear(row.created_at),
        createdAt: row.created_at,
        imageUrl: await createSupabaseSignedUrl(row.storage_path),
      })),
    );

    images.sort((a, b) => b.year - a.year);
    return { images, storageMode };
  }

  const entries = await readLocalEntries();
  const images = entries
    .map((entry) => ({
      id: entry.imageName,
      year: imageYear(entry.createdAt),
      createdAt: entry.createdAt,
      imageUrl: `/images/${entry.imageName}`,
    }))
    .sort((a, b) => b.year - a.year);

  return { images, storageMode };
}

export async function adminDeleteImage(adminPassword: string, id: string): Promise<void> {
  assertAdminPassword(adminPassword);
  const storageMode = getStorageMode();

  if (storageMode === 'supabase') {
    if (!supabaseAdmin) {
      throw new WishStoreError('MISCONFIGURED', 'Supabase 客户端未初始化');
    }

    const rows = await getSupabaseImageRows();
    const target = rows.find((row) => row.id === id);
    if (!target) {
      throw new WishStoreError('NOT_FOUND', '照片不存在');
    }

    const deleteStorageResult = await supabaseAdmin.storage
      .from(SUPABASE_IMAGE_BUCKET)
      .remove([target.storage_path]);

    if (deleteStorageResult.error) {
      throw new WishStoreError('UPLOAD_FAILED', `删除照片失败: ${deleteStorageResult.error.message}`);
    }

    const { error } = await supabaseAdmin.from(SUPABASE_IMAGE_TABLE).delete().eq('id', target.id);
    if (error) {
      throw new WishStoreError('UPLOAD_FAILED', `删除照片记录失败: ${error.message}`);
    }

    return;
  }

  const entries = await readLocalEntries();
  const target = entries.find((entry) => entry.imageName === id);
  if (!target) {
    throw new WishStoreError('NOT_FOUND', '照片不存在');
  }

  await fs.unlink(path.join(IMAGE_DIR, target.imageName)).catch(() => {});

  const remaining = entries.filter((entry) => entry.imageName !== id);
  if (remaining.length === 0) {
    await fs.unlink(META_FILE).catch(() => {});
  } else {
    await writeLocalEntries(remaining);
  }
}

export async function adminClearImages(adminPassword: string): Promise<number> {
  assertAdminPassword(adminPassword);
  const storageMode = getStorageMode();

  if (storageMode === 'supabase') {
    if (!supabaseAdmin) {
      throw new WishStoreError('MISCONFIGURED', 'Supabase 客户端未初始化');
    }

    const rows = await getSupabaseImageRows();
    if (rows.length === 0) {
      return 0;
    }

    const paths = rows.map((row) => row.storage_path);
    const deleteStorageResult = await supabaseAdmin.storage
      .from(SUPABASE_IMAGE_BUCKET)
      .remove(paths);

    if (deleteStorageResult.error) {
      throw new WishStoreError('UPLOAD_FAILED', `清空照片失败: ${deleteStorageResult.error.message}`);
    }

    const { error } = await supabaseAdmin
      .from(SUPABASE_IMAGE_TABLE)
      .delete()
      .in('id', rows.map((row) => row.id));

    if (error) {
      throw new WishStoreError('UPLOAD_FAILED', `清空照片记录失败: ${error.message}`);
    }

    return rows.length;
  }

  const entries = await readLocalEntries();
  await Promise.all(
    entries.map((entry) => fs.unlink(path.join(IMAGE_DIR, entry.imageName)).catch(() => {})),
  );
  await fs.unlink(META_FILE).catch(() => {});
  return entries.length;
}
