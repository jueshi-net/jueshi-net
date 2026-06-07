import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/links/[id]/click - 记录点击并跳转
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const link = await prisma.linkItem.findUnique({
      where: { id },
      select: { url: true, status: true },
    });

    if (!link || link.status !== 'active') {
      return NextResponse.json({ error: '链接不存在或已失效' }, { status: 404 });
    }

    // 异步增加点击数
    prisma.linkItem.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    }).catch(() => {});

    return NextResponse.redirect(link.url, 302);
  } catch {
    return NextResponse.json({ error: '跳转失败' }, { status: 500 });
  }
}
