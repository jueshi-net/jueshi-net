import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/workspace/ad-entitlements
 * 获取当前用户的广告权益
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  try {
    // 查询 AD_SLOT_DAYS 类型的奖励发放记录
    const entitlements = await prisma.rewardGrant.findMany({
      where: {
        userId: session.user.id,
        rewardType: 'AD_SLOT_DAYS',
        status: 'GRANTED',
      },
      include: {
        rewardRule: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { grantedAt: 'desc' },
    });

    // 计算总可用天数
    const totalDays = entitlements.reduce((sum, e) => sum + e.rewardValue, 0);

    // 计算已使用天数
    const usedDays = entitlements
      .filter((e) => e.rewardMetadata && (e.rewardMetadata as any).used)
      .reduce((sum, e) => sum + e.rewardValue, 0);

    // 计算已过期天数
    const now = new Date();
    const expiredDays = entitlements
      .filter((e) => e.expiresAt && e.expiresAt < now && !(e.rewardMetadata && (e.rewardMetadata as any).used))
      .reduce((sum, e) => sum + e.rewardValue, 0);

    const availableDays = totalDays - usedDays - expiredDays;

    // 查询用户的广告申请记录
    const applications = await prisma.adApplication.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // 查询可用广告位
    const placements = await prisma.adPlacement.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      entitlements: entitlements.map((e) => ({
        id: e.id,
        rewardValue: e.rewardValue,
        source: e.rewardRule?.name || '邀请奖励',
        status: e.status,
        grantedAt: e.grantedAt,
        expiresAt: e.expiresAt,
        used: e.rewardMetadata && (e.rewardMetadata as any).used,
        usedAt: e.rewardMetadata && (e.rewardMetadata as any).usedAt,
      })),
      summary: {
        totalDays,
        usedDays,
        expiredDays,
        availableDays,
      },
      applications: applications.map((a) => ({
        id: a.id,
        placementKey: a.placementKey,
        description: a.description,
        materialUrl: a.materialUrl,
        materialType: a.materialType,
        status: a.status,
        reviewNote: a.reviewNote,
        startDate: a.startDate,
        endDate: a.endDate,
        createdAt: a.createdAt,
        reviewedAt: a.reviewedAt,
      })),
      placements: placements.map((p) => ({
        key: p.key,
        name: p.name,
        pageType: p.pageType,
        zone: p.zone,
        description: p.description,
      })),
    });
  } catch (error) {
    console.error('GET /api/workspace/ad-entitlements error:', error);
    return NextResponse.json({ error: '获取广告权益失败' }, { status: 500 });
  }
}

/**
 * POST /api/workspace/ad-entitlements
 * 用户提交广告权益申请
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { placementKey, description, materialUrl, materialType, startDate, endDate, rewardGrantId } = body;

    // 验证必填字段
    if (!placementKey || !description) {
      return NextResponse.json({ error: '请选择广告位并填写说明' }, { status: 400 });
    }

    // 验证广告位是否存在
    const placement = await prisma.adPlacement.findUnique({
      where: { key: placementKey, isActive: true },
    });
    if (!placement) {
      return NextResponse.json({ error: '广告位不存在或已下线' }, { status: 400 });
    }

    // 验证用户是否有可用的广告权益天数
    const entitlements = await prisma.rewardGrant.findMany({
      where: {
        userId: session.user.id,
        rewardType: 'AD_SLOT_DAYS',
        status: 'GRANTED',
      },
    });

    const now = new Date();
    const availableDays = (entitlements as any[])
      .filter((e) => !(e.rewardMetadata && (e.rewardMetadata as any).used))
      .filter((e) => !e.expiresAt || e.expiresAt > now)
      .reduce((sum, e) => sum + e.rewardValue, 0);

    if (availableDays <= 0) {
      return NextResponse.json({ error: '暂无可用广告权益天数，请先通过邀请好友等方式获取' }, { status: 400 });
    }

    // 检查是否有待审核的申请（同一广告位）
    const existingPending = await prisma.adApplication.findFirst({
      where: {
        userId: session.user.id,
        placementKey,
        status: 'PENDING',
      },
    });
    if (existingPending) {
      return NextResponse.json({ error: '您已有该广告位的待审核申请' }, { status: 400 });
    }

    // 创建申请
    const application = await prisma.adApplication.create({
      data: {
        userId: session.user.id,
        placementKey,
        description,
        materialUrl: materialUrl || null,
        materialType: materialType || 'image',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        rewardGrantId: rewardGrantId || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        placementKey: application.placementKey,
        status: application.status,
        createdAt: application.createdAt,
      },
    });
  } catch (error) {
    console.error('POST /api/workspace/ad-entitlements error:', error);
    return NextResponse.json({ error: '提交申请失败' }, { status: 500 });
  }
}
