import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/permissions';
import { prisma } from '@/lib/prisma';

// GET /api/admin/invites — 获取所有邀请码
export async function GET() {
  const res = await requireAdmin();
  if ('error' in res) return res.error;

  try {
    const codes = await prisma.inviteCode.findMany({
      orderBy: [{ createdAt: 'desc' }],
    });
    return NextResponse.json({ success: true, data: codes });
  } catch {
    return NextResponse.json({ success: false, error: '获取邀请码列表失败' }, { status: 500 });
  }
}

// POST /api/admin/invites — 创建邀请码
export async function POST(req: NextRequest) {
  const res = await requireAdmin();
  if ('error' in res) return res.error;

  try {
    const body = await req.json();

    if (!body.code?.trim()) {
      return NextResponse.json({ success: false, error: '邀请码不能为空' }, { status: 400 });
    }

    const code = body.code.trim().toUpperCase();
    const existing = await prisma.inviteCode.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ success: false, error: '邀请码已存在' }, { status: 409 });
    }

    const session = await import('@/lib/auth').then(m => m.auth());
    const newCode = await prisma.inviteCode.create({
      data: {
        code,
        maxUses: body.maxUses || 100,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        note: body.note || null,
        createdBy: session?.user?.email || null,
      },
    });

    return NextResponse.json({ success: true, data: newCode });
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ success: false, error: '邀请码已存在' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: '创建邀请码失败' }, { status: 500 });
  }
}
