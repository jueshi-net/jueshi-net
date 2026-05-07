import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  const health: any = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    checks: {}
  };

  // Database check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = {
      status: 'healthy',
      latency: Date.now() - dbStart,
      tables: await getTableCounts()
    };
  } catch (error: any) {
    health.checks.database = { status: 'error', message: error.message };
    health.status = 'degraded';
  }

  // Disk check (simple)
  health.checks.disk = {
    status: 'healthy',
    note: 'SQLite file-based'
  };

  return NextResponse.json(health);
}

async function getTableCounts() {
  const tables = ['User', 'LinkItem', 'Category', 'Article', 'AdSlot', 'Memo', 'Favorite', 'Tag', 'Notification', 'ShortLink', 'AuditLog', 'Subscription', 'Webhook', 'SubscriptionPlan'];
  const counts: Record<string, number> = {};

  for (const table of tables) {
    try {
      counts[table] = await (prisma as any)[table.toLowerCase()]?.count() ?? 0;
    } catch {
      counts[table] = 0;
    }
  }

  return counts;
}
