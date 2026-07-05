import { NextRequest, NextResponse } from 'next/server';
import {
  WishStoreError,
  adminClearImages,
  adminDeleteImage,
  adminListImages,
} from '@/lib/image-store';

function cleanPassword(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.slice(0, 128);
}

function errorResponse(error: unknown) {
  if (error instanceof WishStoreError) {
    const statusMap: Record<WishStoreError['code'], number> = {
      ALREADY_EXISTS: 409,
      NOT_FOUND: 404,
      INVALID_PASSWORD: 403,
      MISCONFIGURED: 500,
      UPLOAD_FAILED: 500,
    };

    return NextResponse.json({ error: error.message }, { status: statusMap[error.code] ?? 500 });
  }

  return NextResponse.json({ error: '服务暂时不可用' }, { status: 500 });
}

/** POST /api/image/admin — 验证管理密码，返回全部照片列表 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const password = cleanPassword(body.password);
    if (!password) {
      return NextResponse.json({ error: '请输入管理密码' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, ...(await adminListImages(password)) });
  } catch (error) {
    return errorResponse(error);
  }
}

/** DELETE /api/image/admin — 删除单张(带 id)或清空全部(clearAll) */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const password = cleanPassword(body.password);
    if (!password) {
      return NextResponse.json({ error: '请输入管理密码' }, { status: 400 });
    }

    if (body.clearAll === true) {
      const removed = await adminClearImages(password);
      return NextResponse.json({ ok: true, removed });
    }

    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) {
      return NextResponse.json({ error: '缺少照片 id' }, { status: 400 });
    }

    await adminDeleteImage(password, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
