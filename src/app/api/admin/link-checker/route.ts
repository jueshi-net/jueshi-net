import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/link-checker - 获取需要检查的链接
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: '未授权' }, { status: 403 });
  }

  const links = await prisma.linkItem.findMany({
    where: { status: 'active' },
    take: 100,
    select: { id: true, title: true, url: true },
  });

  return NextResponse.json({ links });
}

// POST /api/link-checker/check - 检查单个链接
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: '未授权' }, { status: 403 });
  }

  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: '缺少 ID' }, { status: 400 });
  }

  const link = await prisma.linkItem.findUnique({
    where: { id },
    select: { url: true },
  });

  if (!link) {
    return NextResponse.json({ error: '链接不存在' }, { status: 404 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(link.url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timeout);

    return NextResponse.json({
      id,
      url: link.url,
      status: response.status,
      ok: response.ok,
    });
  } catch (error: any) {
    return NextResponse.json({
      id,
      url: link.url,
      status: 0,
      ok: false,
      error: error.name === 'AbortError' ? '超时 (8s)' : error.message,
    });
  }
}
