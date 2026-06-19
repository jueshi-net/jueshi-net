import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { grantInviteRewards } from '@/lib/invite-rewards';

/**
 * POST /api/admin/reward-grants/[id]/retry
 * 重试失败的奖励发放
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params;
    
    const grant = await prisma.rewardGrant.findUnique({
      where: { id },
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
