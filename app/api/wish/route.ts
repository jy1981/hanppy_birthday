import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const WISH_DIR = path.join(process.cwd(), 'public', 'wishes');
const META_FILE = path.join(WISH_DIR, 'meta.json');

type Meta = {
  passwordHash: string;
  audioName: string;
  createdAt: string;
};

async function readMeta(): Promise<Meta | null> {
  try {
    const raw = await fs.readFile(META_FILE, 'utf-8');
    return JSON.parse(raw) as Meta;
  } catch {
    return null;
  }
}

async function writeMeta(meta: Meta) {
  await fs.mkdir(WISH_DIR, { recursive: true });
  await fs.writeFile(META_FILE, JSON.stringify(meta, null, 2), 'utf-8');
}

function hashPassword(pw: string): string {
  return crypto.createHash('sha256').update(pw).digest('hex');
}

/** POST /api/wish — 上传录音 + 设置密码 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get('audio') as File | null;
    const password = formData.get('password') as string | null;

    if (!audio || !password) {
      return NextResponse.json({ error: '缺少音频或密码' }, { status: 400 });
    }

    const existing = await readMeta();
    if (existing) {
      return NextResponse.json({ error: '已有录音，如需覆盖请先删除' }, { status: 409 });
    }

    const audioName = `wish_${Date.now()}.webm`;
    await fs.mkdir(WISH_DIR, { recursive: true });
    const buf = Buffer.from(await audio.arrayBuffer());
    await fs.writeFile(path.join(WISH_DIR, audioName), buf);

    await writeMeta({
      passwordHash: hashPassword(password),
      audioName,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, audioUrl: `/wishes/${audioName}` });
  } catch (e) {
    return NextResponse.json({ error: '上传失败: ' + String(e) }, { status: 500 });
  }
}

/** GET /api/wish — 检查是否已有录音（不返回音频） */
export async function GET() {
  const meta = await readMeta();
  if (meta) {
    return NextResponse.json({ hasWish: true, createdAt: meta.createdAt });
  }
  return NextResponse.json({ hasWish: false });
}

/** PUT /api/wish — 验证密码，返回音频 URL */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const password = body.password as string | undefined;
    if (!password) {
      return NextResponse.json({ error: '请输入密码' }, { status: 400 });
    }

    const meta = await readMeta();
    if (!meta) {
      return NextResponse.json({ error: '尚无录音' }, { status: 404 });
    }

    if (hashPassword(password) !== meta.passwordHash) {
      return NextResponse.json({ error: '密码不正确' }, { status: 403 });
    }

    return NextResponse.json({ ok: true, audioUrl: `/wishes/${meta.audioName}` });
  } catch {
    return NextResponse.json({ error: '验证失败' }, { status: 500 });
  }
}

/** DELETE /api/wish — 删除录音（需要密码） */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const password = body.password as string | undefined;
    if (!password) {
      return NextResponse.json({ error: '请输入密码' }, { status: 400 });
    }

    const meta = await readMeta();
    if (!meta) {
      return NextResponse.json({ error: '尚无录音' }, { status: 404 });
    }

    if (hashPassword(password) !== meta.passwordHash) {
      return NextResponse.json({ error: '密码不正确' }, { status: 403 });
    }

    await fs.unlink(path.join(WISH_DIR, meta.audioName)).catch(() => {});
    await fs.unlink(META_FILE).catch(() => {});
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
