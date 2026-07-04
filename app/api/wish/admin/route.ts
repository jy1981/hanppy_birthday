import { NextRequest, NextResponse } from 'next/server';
import {
  WishStoreError,
  adminClearWishes,
  adminDeleteWish,
  adminListWishes,
} from '@/lib/wish-store';

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

/** POST /api/wish/admin — 验证管理密码，返回全部愿望列表 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const password = cleanPassword(body.password);
    if (!password) {
      return NextResponse.json({ error: '请输入管理密码' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, ...(await adminListWishes(password)) });
  } catch (error) {
    return errorResponse(error);
  }
}

/** DELETE /api/wish/admin — 删除单条(带 id)或清空全部(clearAll) */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const password = cleanPassword(body.password);
    if (!password) {
      return NextResponse.json({ error: '请输入管理密码' }, { status: 400 });
    }

    if (body.clearAll === true) {
      const removed = await adminClearWishes(password);
      return NextResponse.json({ ok: true, removed });
    }

    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) {
      return NextResponse.json({ error: '缺少愿望 id' }, { status: 400 });
    }

    await adminDeleteWish(password, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
