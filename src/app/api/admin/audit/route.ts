import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { isAdminRole } from '@/lib/auth/permissions';

// GET /api/admin/audit - 获取审计日志
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || !isAdminRole((session.user as any).role)) {
    return NextResponse.json({ error: '未授权' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const action = searchParams.get('action') || '';
  const userId = searchParams.get('userId') || '';

  const skip = (page - 1) * limit;
  const where: any = {};
  if (action) where.action = { contains: action };
  if (userId) where.userId = userId;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return NextResponse.json({ logs, total, page, totalPages: Math.ceil(total / limit) });
}

// POST /api/admin/audit - 创建审计日志
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: '未授权' }, { status: 403 });
  }

  const { action, entity, entityId, details } = await req.json();

  const log = await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action,
      entity,
      entityId,
      details,
    },
  });

  return NextResponse.json({ success: true, log });
}
