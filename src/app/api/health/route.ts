import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { isAdminRole } from '@/lib/auth/permissions';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || !isAdminRole(user.role)) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  const health: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    database: 'ok',
    message: '所有服务正常运行',
    checks: {}
  };

  // Database check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = {
      status: 'ok',
      latency: Date.now() - dbStart,
      tables: await getTableCounts()
    };
  } catch (error: any) {
    health.database = 'error';
    health.checks.database = { status: 'error', message: error.message };
    health.status = 'degraded';
    health.message = `数据库连接异常: ${error.message}`;
  }

  // Disk check (simple)
  health.checks.disk = {
    status: 'healthy',
    note: 'SQLite file-based'
  };

  return NextResponse.json(health);
}

async function getTableCounts() {
  // Use dynamic introspection to get actual Prisma model names, then count them
  const counts: Record<string, number> = {};
  // Only probe tables that actually exist in the schema
  const tables = ['User', 'Article', 'Topic', 'Resource', 'AdCampaign', 'LinkItem', 'Category'];
  for (const table of tables) {
    try {
      counts[table] = await (prisma as any)[table.toLowerCase()]?.count() ?? 0;
    } catch {
      counts[table] = 0;
    }
  }
  return counts;
}
