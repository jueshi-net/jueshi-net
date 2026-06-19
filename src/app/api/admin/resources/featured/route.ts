import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/resources/featured
 * 获取推荐资源列表
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  try {
    const featured = await prisma.resource.findMany({
      where: { isFeatured: true },
      orderBy: [{ featuredOrder: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({ success: true, featured });
  } catch (error) {
    console.error('GET /api/admin/resources/featured error:', error);
    return NextResponse.json({ error: '获取推荐资源失败' }, { status: 500 });
  }
}

/**
 * POST /api/admin/resources/featured
 * 设置/取消推荐资源
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, isFeatured, featuredGroup, featuredOrder, featuredStartAt, featuredEndAt } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少资源 ID' }, { status: 400 });
    }

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        isFeatured: isFeatured ?? false,
        featuredGroup: featuredGroup || null,
        featuredOrder: featuredOrder ?? null,
        featuredStartAt: featuredStartAt ? new Date(featuredStartAt) : null,
        featuredEndAt: featuredEndAt ? new Date(featuredEndAt) : null,
      },
    });

    return NextResponse.json({ success: true, resource });
  } catch (error) {
    console.error('POST /api/admin/resources/featured error:', error);
    return NextResponse.json({ error: '设置推荐资源失败' }, { status: 500 });
  }
}
