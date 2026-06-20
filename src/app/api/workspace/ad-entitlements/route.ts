import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/workspace/ad-entitlements
 * 获取当前用户的广告权益
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  try {
    // 查询 AD_SLOT_DAYS 类型的奖励发放记录
    const entitlements = await prisma.rewardGrant.findMany({
      where: {
        userId: session.user.id,
        rewardType: 'AD_SLOT_DAYS',
        status: 'GRANTED',
      },
      include: {
        rewardRule: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { grantedAt: 'desc' },
    });

    // 计算总可用天数
    const totalDays = entitlements.reduce((sum, e) => sum + e.rewardValue, 0);

    // 计算已使用天数
    const usedDays = entitlements
      .filter((e) => e.metadata && (e.metadata as any).used)
      .reduce((sum, e) => sum + e.rewardValue, 0);

    // 计算已过期天数
    const now = new Date();
    const expiredDays = entitlements
      .filter((e) => e.expiresAt && e.expiresAt < now && !(e.metadata && (e.metadata as any).used))
      .reduce((sum, e) => sum + e.rewardValue, 0);

    const availableDays = totalDays - usedDays - expiredDays;

    return NextResponse.json({
      success: true,
      entitlements: entitlements.map((e) => ({
        id: e.id,
        rewardValue: e.rewardValue,
        source: e.rewardRule?.name || '邀请奖励',
        status: e.status,
        grantedAt: e.grantedAt,
        expiresAt: e.expiresAt,
        used: e.metadata && (e.metadata as any).used,
        usedAt: e.metadata && (e.metadata as any).usedAt,
      })),
      summary: {
        totalDays,
        usedDays,
        expiredDays,
        availableDays,
      },
    });
  } catch (error) {
    console.error('GET /api/workspace/ad-entitlements error:', error);
    return NextResponse.json({ error: '获取广告权益失败' }, { status: 500 });
  }
}
