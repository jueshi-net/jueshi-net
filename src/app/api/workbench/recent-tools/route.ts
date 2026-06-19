import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/workbench/recent-tools
// 获取用户最近使用的工具（基于 EventLog）

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // 查询用户最近 7 天的工具使用事件
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const events = await prisma.eventLog.findMany({
      where: {
        userId,
        eventType: { in: ['tool_view', 'tool_calculate', 'tool_click', 'resource_click'] },
        toolName: { not: null },
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        toolName: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    // 按工具名称分组，统计使用次数和最近使用时间
    const toolMap = new Map<string, { count: number; lastUsed: Date }>();
    
    for (const event of events) {
      if (!event.toolName) continue;
      
      const existing = toolMap.get(event.toolName);
      if (existing) {
        existing.count++;
        if (event.createdAt > existing.lastUsed) {
          existing.lastUsed = event.createdAt;
        }
      } else {
        toolMap.set(event.toolName, {
          count: 1,
          lastUsed: event.createdAt,
        });
      }
    }

    // 转换为数组并排序（按最近使用时间）
    const tools = Array.from(toolMap.entries())
      .map(([toolName, data]) => ({
        toolName,
        toolTitle: getToolTitle(toolName),
        lastUsed: data.lastUsed.toISOString(),
        useCount: data.count,
        route: getToolRoute(toolName),
        icon: getToolIcon(toolName),
      }))
      .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
      .slice(0, 6);

    return NextResponse.json({ tools });
  } catch (error) {
    console.error('获取最近使用工具失败:', error);
    return NextResponse.json({ tools: [] });
  }
}

function getToolTitle(toolName: string): string {
  const titles: Record<string, string> = {
    'tracking': '物流追踪',
    'shipping-calculator': '运费计算器',
    'postal-code': '邮编查询',
    'hs-code': 'HS 编码',
    'exchange-rate': '汇率换算',
    'documents': '单据工具',
    'resources': '资源中心',
    'memo': '备忘录',
  };
  return titles[toolName] || toolName;
}

function getToolRoute(toolName: string): string {
  const routes: Record<string, string> = {
    'tracking': '/tracking',
    'shipping-calculator': '/tools/shipping-calculator',
    'postal-code': '/tools/postal-code',
    'hs-code': '/tools/hs-code',
    'exchange-rate': '/tools/exchange-rate',
    'documents': '/tools/documents',
    'resources': '/resources',
    'memo': '/workspace/memos',
  };
  return routes[toolName] || '/tools';
}

function getToolIcon(toolName: string): string {
  // 返回图标名称，前端会根据名称渲染对应的图标
  const icons: Record<string, string> = {
    'tracking': 'truck',
    'shipping-calculator': 'calculator',
    'postal-code': 'map-pin',
    'hs-code': 'file-text',
    'exchange-rate': 'calculator',
    'documents': 'package',
    'resources': 'bookmark',
    'memo': 'sticky-note',
  };
  return icons[toolName] || 'tool';
}
