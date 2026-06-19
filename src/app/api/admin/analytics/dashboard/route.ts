import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { isAdminRole } from '@/lib/auth/permissions';

/**
 * GET /api/admin/analytics/dashboard
 * 后台分析总览数据
 */
export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: '未授权' }, { status: 403 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const [
    // 今日统计
    todayPV,
    todayUV,
    todaySessions,
    todayToolUsage,
    todaySignups,
    todayFeedback,
    todayErrors,
    
    // 昨日统计（对比）
    yesterdayPV,
    yesterdayUV,
    
    // 页面排行（近 7 天）
    topPages,
    
    // 来源排行（近 7 天）
    topReferrers,
    
    // 工具排行（近 7 天）
    topTools,
    
    // 设备分布（近 7 天）
    deviceDistribution,
  ] = await Promise.all([
    // 今日 PV
    prisma.eventLog.count({
      where: {
        eventType: 'page_view',
        createdAt: { gte: today },
      },
    }),
    
    // 今日 UV（独立 anonymousId）
    prisma.eventLog.groupBy({
      by: ['anonymousId'],
      where: {
        eventType: 'page_view',
        createdAt: { gte: today },
        anonymousId: { not: null },
      },
      _count: { anonymousId: true },
    }).then(groups => groups.length),
    
    // 今日 Sessions
    prisma.eventLog.count({
      where: {
        eventType: 'session_start',
        createdAt: { gte: today },
      },
    }),
    
    // 今日工具使用次数
    prisma.eventLog.count({
      where: {
        eventType: { in: ['tool_click', 'tool_calculate', 'tool_query'] },
        createdAt: { gte: today },
      },
    }),
    
    // 今日注册数
    prisma.user.count({
      where: {
        createdAt: { gte: today },
      },
    }),
    
    // 今日反馈数
    prisma.feedback.count({
      where: {
        createdAt: { gte: today },
      },
    }),
    
    // 今日错误事件
    prisma.eventLog.count({
      where: {
        eventType: 'tool_error',
        createdAt: { gte: today },
      },
    }),
    
    // 昨日 PV
    prisma.eventLog.count({
      where: {
        eventType: 'page_view',
        createdAt: { gte: yesterday, lt: today },
      },
    }),
    
    // 昨日 UV
    prisma.eventLog.groupBy({
      by: ['anonymousId'],
      where: {
        eventType: 'page_view',
        createdAt: { gte: yesterday, lt: today },
        anonymousId: { not: null },
      },
      _count: { anonymousId: true },
    }).then(groups => groups.length),
    
    // 页面排行（近 7 天）
    prisma.eventLog.groupBy({
      by: ['path'],
      where: {
        eventType: 'page_view',
        createdAt: { gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) },
        path: { not: null },
      },
      _count: { path: true },
      orderBy: {
        _count: { path: 'desc' },
      },
      take: 10,
    }),
    
    // 来源排行（近 7 天）
    prisma.eventLog.groupBy({
      by: ['referrerDomain'],
      where: {
        eventType: 'page_view',
        createdAt: { gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) },
        referrerDomain: { not: null },
      },
      _count: { referrerDomain: true },
      orderBy: {
        _count: { referrerDomain: 'desc' },
      },
      take: 10,
    }),
    
    // 工具排行（近 7 天）
    prisma.eventLog.groupBy({
      by: ['toolName'],
      where: {
        eventType: { in: ['tool_click', 'tool_calculate', 'tool_query'] },
        createdAt: { gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) },
        toolName: { not: null },
      },
      _count: { toolName: true },
      orderBy: {
        _count: { toolName: 'desc' },
      },
      take: 10,
    }),
    
    // 设备分布（近 7 天）
    prisma.eventLog.groupBy({
      by: ['deviceType'],
      where: {
        eventType: 'page_view',
        createdAt: { gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) },
        deviceType: { not: null },
      },
      _count: { deviceType: true },
    }),
  ]);

  return NextResponse.json({
    overview: {
      today: {
        pv: todayPV,
        uv: todayUV,
        sessions: todaySessions,
        toolUsage: todayToolUsage,
        signups: todaySignups,
        feedback: todayFeedback,
        errors: todayErrors,
      },
      yesterday: {
        pv: yesterdayPV,
        uv: yesterdayUV,
      },
      trends: {
        pvChange: todayPV - yesterdayPV,
        uvChange: todayUV - yesterdayUV,
      },
    },
    topPages: topPages.map(p => ({
      path: p.path,
      count: p._count.path,
    })),
    topReferrers: topReferrers.map(r => ({
      domain: r.referrerDomain,
      count: r._count.referrerDomain,
    })),
    topTools: topTools.map(t => ({
      tool: t.toolName,
      count: t._count.toolName,
    })),
    deviceDistribution: deviceDistribution.map(d => ({
      device: d.deviceType,
      count: d._count.deviceType,
    })),
  });
}
