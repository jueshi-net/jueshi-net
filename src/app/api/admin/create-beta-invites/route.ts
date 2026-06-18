import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { isAdminRole } from '@/lib/auth/permissions';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || !isAdminRole(user.role)) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  const codes = [
    { code: 'BETA2026-001', maxUses: 5, expiresAt: new Date('2026-07-18'), note: 'Beta 测试批次 1' },
    { code: 'BETA2026-002', maxUses: 5, expiresAt: new Date('2026-07-18'), note: 'Beta 测试批次 2' },
    { code: 'BETA2026-003', maxUses: 5, expiresAt: new Date('2026-07-18'), note: 'Beta 测试批次 3' }
  ];

  const created = [];
  for (const c of codes) {
    try {
      const result = await prisma.inviteCode.create({
        data: {
          code: c.code,
          maxUses: c.maxUses,
          usedCount: 0,
          isActive: true,
          expiresAt: c.expiresAt,
          note: c.note,
          createdBy: session.user.email
        }
      });
      created.push(result.code);
    } catch (e: any) {
      if (e.code === 'P2002') {
        // 邀请码已存在，跳过
        continue;
      }
      return NextResponse.json({ error: `创建失败: ${e.message}` }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, created });
}
