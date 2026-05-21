import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/permissions';
import { prisma } from '@/lib/prisma';

// PATCH /api/admin/invites/[id] — 更新邀请码（如 toggle isActive）
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const res = await requireAdmin();
  if ('error' in res) return res.error;

  try {
    const { id } = await params;
    const body = await req.json();

    const data: Record<string, any> = {};
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.maxUses !== undefined) data.maxUses = body.maxUses;
    if (body.note !== undefined) data.note = body.note;
    if (body.expiresAt !== undefined) data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

    const code = await prisma.inviteCode.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: code });
  } catch (e: any) {
    if (e.code === 'P2025') {
      return NextResponse.json({ success: false, error: '邀请码不存在' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: '更新失败' }, { status: 500 });
  }
}

// DELETE /api/admin/invites/[id] — 删除邀请码
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const res = await requireAdmin();
  if ('error' in res) return res.error;

  try {
    const { id } = await params;
    await prisma.inviteCode.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.code === 'P2025') {
      return NextResponse.json({ success: false, error: '邀请码不存在' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: '删除失败' }, { status: 500 });
  }
}
