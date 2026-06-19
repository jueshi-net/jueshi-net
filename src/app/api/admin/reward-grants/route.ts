import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { grantInviteRewards } from '@/lib/invite-rewards';

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

/**
 * POST /api/admin/reward-grants/[id]/retry
 * 重试失败的奖励发放
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const grant = await prisma.rewardGrant.findUnique({
      where: { id: params.id },
      include: {
        inviteRedemption: true,
      },
    });

    if (!grant) {
      return NextResponse.json({ error: '记录不存在' }, { status: 404 });
    }

    if (grant.status !== 'FAILED') {
      return NextResponse.json({ error: '只能重试失败的发放' }, { status: 400 });
    }

    if (!grant.inviteRedemptionId) {
      return NextResponse.json({ error: '缺少邀请关系' }, { status: 400 });
    }

    // 重新发放奖励
    const result = await grantInviteRewards(
      grant.inviteRedemptionId,
      grant.userId,
      'INVITE_REGISTER_SUCCESS'
    );

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('POST /api/admin/reward-grants/[id]/retry error:', error);
    return NextResponse.json({ error: '重试失败' }, { status: 500 });
  }
}
