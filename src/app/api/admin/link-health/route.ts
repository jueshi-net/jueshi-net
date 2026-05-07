import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/admin/link-health - 检查链接健康状态
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: '未授权' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '50');

  const links = await prisma.linkItem.findMany({
    where: { status: 'active' },
    take: limit,
    select: { id: true, title: true, url: true },
  });

  // 检查每个链接的状态
  const results = await Promise.all(
    links.map(async (link) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(link.url, {
          method: 'HEAD',
          signal: controller.signal,
          redirect: 'follow',
        });
        clearTimeout(timeout);

        return {
          id: link.id,
          name: link.title,
          url: link.url,
          status: response.status,
          ok: response.ok,
        };
      } catch (error: any) {
        return {
          id: link.id,
          name: link.title,
          url: link.url,
          status: 0,
          ok: false,
          error: error.name === 'AbortError' ? '超时' : '无法访问',
        };
      }
    })
  );

  const healthy = results.filter(r => r.ok).length;
  const unhealthy = results.filter(r => !r.ok);

  return NextResponse.json({
    total: results.length,
    healthy,
    unhealthy: unhealthy.length,
    links: results,
  });
}

// POST /api/admin/link-health/check - 手动触发健康检查
export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: '未授权' }, { status: 403 });
  }

  const links = await prisma.linkItem.findMany({
    where: { status: 'active' },
    select: { id: true, url: true },
  });

  let checked = 0;
  for (const link of links) {
    try {
      const response = await fetch(link.url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) {
        await prisma.linkItem.update({
          where: { id: link.id },
          data: { status: 'inactive' },
        });
      }
      checked++;
    } catch {
      await prisma.linkItem.update({
        where: { id: link.id },
        data: { status: 'inactive' },
      });
      checked++;
    }
  }

  return NextResponse.json({ success: true, checked });
}
