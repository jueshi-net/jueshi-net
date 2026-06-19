import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/reward-rules
 * 获取所有奖励规则
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  // 检查管理员权限
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  try {
    const rules = await prisma.rewardRule.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      rules,
    });
  } catch (error) {
    console.error('GET /api/admin/reward-rules error:', error);
    return NextResponse.json({ error: '获取奖励规则失败' }, { status: 500 });
  }
}

/**
 * POST /api/admin/reward-rules
 * 创建新的奖励规则
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
    const {
      name,
      trigger,
      rewardType,
      rewardValue,
      rewardMetadata,
      enabled = true,
      startsAt,
      endsAt,
      maxRewardsPerInviter,
      maxRewardsTotal,
    } = body;

    if (!name || !trigger || !rewardType || rewardValue === undefined) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      );
    }

    const validRewardTypes = ['MEMBER_DAYS', 'AD_SLOT_DAYS', 'POINTS', 'GROWTH', 'BADGE', 'CUSTOM_ENTITLEMENT'];
    if (!validRewardTypes.includes(rewardType)) {
      return NextResponse.json(
        { error: '无效的奖励类型' },
        { status: 400 }
      );
    }

    const rule = await prisma.rewardRule.create({
      data: {
        name,
        trigger,
        rewardType,
        rewardValue,
        rewardMetadata: rewardMetadata || undefined,
        enabled,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        maxRewardsPerInviter: maxRewardsPerInviter || null,
        maxRewardsTotal: maxRewardsTotal || null,
      },
    });

    return NextResponse.json({
      success: true,
      rule,
    });
  } catch (error) {
    console.error('POST /api/admin/reward-rules error:', error);
    return NextResponse.json({ error: '创建奖励规则失败' }, { status: 500 });
  }
}
