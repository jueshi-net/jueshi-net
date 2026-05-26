// GET /api/events/stats - 统计查询端点
// 安全加固：仅开发环境可用，生产环境需要管理员权限

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  // 生产环境禁止公开访问
  if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Stats disabled in production' }, { status: 403 });
  }

  // 如果有 ADMIN_SECRET，需要验证
  if (process.env.ADMIN_SECRET) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get('days');
    const days = Math.min(180, Math.max(1, parseInt(daysParam || '30')));

    // 按事件类型统计
    const byType = await prisma.eventLog.groupBy({
      by: ['eventType', 'toolName', 'action'],
      _count: true,
      orderBy: { _count: { id: 'desc' } },
      take: 100,
    });

    const total = await prisma.eventLog.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        },
      },
    });

    const byTool = await prisma.eventLog.groupBy({
      by: ['toolName'],
      _count: true,
      orderBy: { _count: { id: 'desc' } },
    });

    return NextResponse.json({
      total,
      byType: (byType as any[]).map((r: any) => ({
        eventType: r.eventType,
        toolName: r.toolName,
        action: r.action,
        count: r.count,
      })),
      byTool: (byTool as any[]).map((r: any) => ({
        toolName: r.toolName,
        count: r.count,
      })),
    });
  } catch (error) {
    console.error('[Events Stats API] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
