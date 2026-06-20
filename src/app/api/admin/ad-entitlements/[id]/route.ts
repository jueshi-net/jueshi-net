import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * PUT /api/admin/ad-entitlements/[id]
 * 管理员审核广告权益申请（批准/拒绝）
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  // 检查管理员权限
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { action, reviewNote } = body; // action: 'approve' | 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: '无效操作' }, { status: 400 });
    }

    // 查找申请
    const application = await prisma.adApplication.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!application) {
      return NextResponse.json({ error: '申请不存在' }, { status: 404 });
    }

    if (application.status !== 'PENDING') {
      return NextResponse.json({ error: '该申请已处理' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

    // 更新申请状态
    const updated = await prisma.adApplication.update({
      where: { id },
      data: {
        status: newStatus,
        reviewNote: reviewNote || null,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      },
    });

    // 如果批准，标记对应的 reward grant 为已使用
    if (action === 'approve' && application.rewardGrantId) {
      await prisma.rewardGrant.update({
        where: { id: application.rewardGrantId },
        data: {
          rewardMetadata: {
            used: true,
            usedAt: new Date(),
            applicationId: application.id,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      application: {
        id: updated.id,
        status: updated.status,
        reviewedAt: updated.reviewedAt,
      },
    });
  } catch (error) {
    console.error('PUT /api/admin/ad-entitlements/[id] error:', error);
    return NextResponse.json({ error: '审核操作失败' }, { status: 500 });
  }
}
