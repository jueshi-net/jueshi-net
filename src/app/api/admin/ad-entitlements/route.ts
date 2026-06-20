import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/ad-entitlements
 * 管理员查看所有广告权益申请
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  // 检查管理员权限
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  try {
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.adApplication.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.adApplication.count({ where }),
    ]);

    // 统计各状态数量
    const statusCounts = await prisma.adApplication.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const counts: Record<string, number> = { ALL: total };
    statusCounts.forEach((s) => {
      counts[s.status] = s._count.status;
    });

    return NextResponse.json({
      applications: applications.map((a) => ({
        id: a.id,
        placementKey: a.placementKey,
        description: a.description,
        materialUrl: a.materialUrl,
        materialType: a.materialType,
        status: a.status,
        reviewNote: a.reviewNote,
        startDate: a.startDate,
        endDate: a.endDate,
        createdAt: a.createdAt,
        reviewedAt: a.reviewedAt,
        user: {
          id: a.user.id,
          name: a.user.name,
          email: a.user.email,
        },
      })),
      total,
      page,
      pageSize,
      counts,
    });
  } catch (error) {
    console.error('GET /api/admin/ad-entitlements error:', error);
    return NextResponse.json({ error: '获取申请列表失败' }, { status: 500 });
  }
}
