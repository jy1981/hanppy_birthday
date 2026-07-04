import { NextRequest, NextResponse } from 'next/server';
import {
  WishStoreError,
  createWish,
  deleteWish,
  getWishSummary,
  listWishes,
} from '@/lib/wish-store';

function cleanPassword(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, 64);
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

/** POST /api/wish — 上传录音（每年一条，首次许愿设置密码，之后需既定密码） */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get('audio') as File | null;
    const password = cleanPassword(formData.get('password'));

    if (!audio || !password) {
      return NextResponse.json({ error: '缺少音频或密码' }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: '密码至少 4 位' }, { status: 400 });
    }

    const created = await createWish({
      audioBuffer: Buffer.from(await audio.arrayBuffer()),
      password,
      originalFilename: audio.name || 'wish.webm',
      mimeType: audio.type || 'audio/webm',
    });

    return NextResponse.json({ ok: true, ...created });
  } catch (error) {
    return errorResponse(error);
  }
}

/** GET /api/wish — 检查是否已有录音（不返回音频） */
export async function GET() {
  try {
    const summary = await getWishSummary();
    return NextResponse.json(summary);
  } catch (error) {
    return errorResponse(error);
  }
}

/** PUT /api/wish — 验证密码，返回历年愿望列表 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const password = cleanPassword(body.password);
    if (!password) {
      return NextResponse.json({ error: '请输入密码' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, ...(await listWishes(password)) });
  } catch (error) {
    return errorResponse(error);
  }
}

/** DELETE /api/wish — 删除录音（需要密码） */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const password = cleanPassword(body.password);
    if (!password) {
      return NextResponse.json({ error: '请输入密码' }, { status: 400 });
    }

    await deleteWish(password);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
