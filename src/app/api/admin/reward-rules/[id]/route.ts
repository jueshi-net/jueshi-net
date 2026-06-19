import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/reward-rules/[id]
 * 获取单个奖励规则
 */
export async function GET(
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
    const rule = await prisma.rewardRule.findUnique({
      where: { id: params.id },
    });

    if (!rule) {
      return NextResponse.json({ error: '规则不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      rule,
    });
  } catch (error) {
    console.error('GET /api/admin/reward-rules/[id] error:', error);
    return NextResponse.json({ error: '获取奖励规则失败' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/reward-rules/[id]
 * 更新奖励规则
 */
export async function PUT(
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
    const body = await req.json();
    const {
      name,
      trigger,
      rewardType,
      rewardValue,
      rewardMetadata,
      enabled,
      startsAt,
      endsAt,
      maxRewardsPerInviter,
      maxRewardsTotal,
    } = body;

    const rule = await prisma.rewardRule.update({
      where: { id: params.id },
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
    console.error('PUT /api/admin/reward-rules/[id] error:', error);
    return NextResponse.json({ error: '更新奖励规则失败' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/reward-rules/[id]
 * 切换奖励规则启用状态
 */
export async function PATCH(
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
    const body = await req.json();
    const { enabled } = body;

    const rule = await prisma.rewardRule.update({
      where: { id: params.id },
      data: { enabled },
    });

    return NextResponse.json({
      success: true,
      rule,
    });
  } catch (error) {
    console.error('PATCH /api/admin/reward-rules/[id] error:', error);
    return NextResponse.json({ error: '更新奖励规则失败' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/reward-rules/[id]
 * 删除奖励规则
 */
export async function DELETE(
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
    await prisma.rewardRule.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('DELETE /api/admin/reward-rules/[id] error:', error);
    return NextResponse.json({ error: '删除奖励规则失败' }, { status: 500 });
  }
}
