import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }
  
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  try {
    // Get user stats by role
    const userStats = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    });

    const stats: Record<string, number> = {
      admin: 0,
      user: 0,
      member: 0,
    };

    userStats.forEach((stat) => {
      stats[stat.role] = stat._count.role;
    });

    // Get reward stats
    const rewardItems = await prisma.rewardItem.findMany({
      select: {
        code: true,
        enabled: true,
      },
    });

    const activeRewards = rewardItems.filter((r) => r.enabled).map((r) => r.code);
    const inactiveRewards = rewardItems.filter((r) => !r.enabled).map((r) => r.code);

    return NextResponse.json({
      userStats: stats,
      rewardStats: {
        active: activeRewards,
        inactive: inactiveRewards,
      },
    });
  } catch (error) {
    console.error('Failed to get beta stats:', error);
    return NextResponse.json({ error: '获取统计数据失败' }, { status: 500 });
  }
}
