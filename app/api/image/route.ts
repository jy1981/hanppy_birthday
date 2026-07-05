import { NextRequest, NextResponse } from 'next/server';
import {
  WishStoreError,
  createImage,
  getImageSummary,
  listImages,
} from '@/lib/image-store';

const MAX_IMAGE_BYTES = 12 * 1024 * 1024; // 12MB
const ALLOWED_MIME = /^image\/(jpeg|jpg|png|webp|gif|heic|heif)$/i;

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

/** POST /api/image — 上传照片（每年一张，首次设置密码，之后需既定密码） */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File | null;
    const password = cleanPassword(formData.get('password'));

    if (!image || !password) {
      return NextResponse.json({ error: '缺少图片或密码' }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: '密码至少 4 位' }, { status: 400 });
    }

    const mimeType = image.type || 'image/jpeg';
    if (!ALLOWED_MIME.test(mimeType)) {
      return NextResponse.json({ error: '仅支持 JPG / PNG / WEBP / GIF 图片' }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    if (buffer.byteLength > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: '图片过大，请压缩到 12MB 以内' }, { status: 400 });
    }

    const created = await createImage({
      imageBuffer: buffer,
      password,
      originalFilename: image.name || 'photo.jpg',
      mimeType,
    });

    return NextResponse.json({ ok: true, ...created });
  } catch (error) {
    return errorResponse(error);
  }
}

/** GET /api/image — 检查是否已有照片（不返回图片） */
export async function GET() {
  try {
    const summary = await getImageSummary();
    return NextResponse.json(summary);
  } catch (error) {
    return errorResponse(error);
  }
}

/** PUT /api/image — 验证密码，返回历年照片列表 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const password = cleanPassword(body.password);
    if (!password) {
      return NextResponse.json({ error: '请输入密码' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, ...(await listImages(password)) });
  } catch (error) {
    return errorResponse(error);
  }
}
