import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateInviteCode } from '@/lib/utils/invite-code';

/**
 * GET /api/workspace/invites
 * 获取当前用户的邀请码列表
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  try {
    const inviteCodes = await prisma.inviteCode.findMany({
      where: { ownerUserId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        redemptions: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            invitee: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // 统计已邀请人数
    const invitedCount = inviteCodes.reduce((sum, code) => sum + code.usedCount, 0);

    return NextResponse.json({
      success: true,
      inviteCodes,
      invitedCount,
    });
  } catch (error) {
    console.error('GET /api/workspace/invites error:', error);
    return NextResponse.json({ error: '获取邀请码失败' }, { status: 500 });
  }
}

/**
 * POST /api/workspace/invites
 * 生成新的邀请码
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  try {
    // 检查用户当前持有的邀请码数量
    const existingCount = await prisma.inviteCode.count({
      where: { ownerUserId: session.user.id },
    });

    // 限制：每个用户最多持有 3 个邀请码
    if (existingCount >= 3) {
      return NextResponse.json(
        { error: '您最多只能持有 3 个邀请码' },
        { status: 400 }
      );
    }

    // 检查今天生成的邀请码数量
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await prisma.inviteCode.count({
      where: {
        ownerUserId: session.user.id,
        createdAt: { gte: today },
      },
    });

    // 限制：每天最多生成 3 个邀请码
    if (todayCount >= 3) {
      return NextResponse.json(
        { error: '今天生成的邀请码已达上限（3 个）' },
        { status: 400 }
      );
    }

    // 生成邀请码
    const code = generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 天后过期

    const inviteCode = await prisma.inviteCode.create({
      data: {
        code,
        ownerUserId: session.user.id,
        source: 'USER',
        status: 'ACTIVE',
        maxUses: 10,
        usedCount: 0,
        isActive: true,
        expiresAt,
        createdBy: session.user.email,
        note: `用户 ${session.user.name || session.user.email} 生成的邀请码`,
      },
    });

    return NextResponse.json({
      success: true,
      inviteCode,
    });
  } catch (error) {
    console.error('POST /api/workspace/invites error:', error);
    return NextResponse.json({ error: '生成邀请码失败' }, { status: 500 });
  }
}
