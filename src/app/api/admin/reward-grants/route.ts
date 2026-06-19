import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/reward-grants
 * 获取奖励发放记录
 */
export async function GET(req: NextRequest) {
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

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const rewardType = searchParams.get('rewardType');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  try {
    const where: any = {};
    if (status) where.status = status;
    if (rewardType) where.rewardType = rewardType;

    const [grants, total] = await Promise.all([
      prisma.rewardGrant.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          inviteRedemption: {
            select: {
              id: true,
              inviterUserId: true,
              inviteeUserId: true,
            },
          },
          rewardRule: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.rewardGrant.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      grants,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('GET /api/admin/reward-grants error:', error);
    return NextResponse.json({ error: '获取奖励发放记录失败' }, { status: 500 });
  }
}
