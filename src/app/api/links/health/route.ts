import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// POST /api/links/health-check - 检测链接健康状态
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const linkId = searchParams.get('id');
  const checkAll = searchParams.get('all') === 'true';

  const results: any[] = [];

  const links = checkAll
    ? await prisma.linkItem.findMany({ take: 50, orderBy: { createdAt: 'asc' } })
    : linkId
      ? await prisma.linkItem.findMany({ where: { id: linkId } })
      : [];

  for (const link of links) {
    const result = await checkLink(link);
    results.push(result);

    await prisma.linkItem.update({
      where: { id: link.id },
      data: { status: result.status as any }
    });
  }

  return NextResponse.json({ results, total: results.length });
}

async function checkLink(link: any) {
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(link.url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow'
    });

    clearTimeout(timeout);
    const latency = Date.now() - start;

    if (response.ok) {
      return { id: link.id, title: link.title, url: link.url, status: 'ACTIVE', statusCode: response.status, latency };
    } else if (response.status >= 400) {
      return { id: link.id, title: link.title, url: link.url, status: 'BROKEN', statusCode: response.status, latency };
    }
  } catch (error: any) {
    const latency = Date.now() - start;
    if (error.name === 'AbortError') {
      return { id: link.id, title: link.title, url: link.url, status: 'TIMEOUT', statusCode: null, latency };
    }
    return { id: link.id, title: link.title, url: link.url, status: 'BROKEN', statusCode: null, latency, error: error.message };
  }

  return { id: link.id, title: link.title, url: link.url, status: 'UNKNOWN', statusCode: null, latency: Date.now() - start };
}

// GET /api/links/health - 获取链接健康统计
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const [total, active, broken, timeout, unknown] = await Promise.all([
    prisma.linkItem.count(),
    prisma.linkItem.count({ where: { status: 'ACTIVE' } }),
    prisma.linkItem.count({ where: { status: 'BROKEN' } }),
    prisma.linkItem.count({ where: { status: 'TIMEOUT' } }),
    prisma.linkItem.count({ where: { status: 'UNKNOWN' } }),
  ]);

  const brokenLinks = await prisma.linkItem.findMany({
    where: { status: { in: ['BROKEN', 'TIMEOUT'] } },
    select: { id: true, title: true, url: true, status: true },
    take: 20
  });

  return NextResponse.json({ total, active, broken, timeout, unknown, brokenLinks });
}
