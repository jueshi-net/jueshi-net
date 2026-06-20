import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/analytics/growth-funnels
 * 增长漏斗分析（管理员）
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  try {
    // 最近 30 天
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 邀请增长漏斗
    const inviteFunnels = await prisma.eventLog.groupBy({
      by: ['eventName'],
      where: {
        eventName: {
          in: [
            'invite_code_generate',
            'invite_code_copy',
            'invite_link_copy',
            'invite_register_success',
            'invite_reward_granted',
          ],
        },
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: true,
    });

    // 工具链漏斗
    const toolchainFunnels = await prisma.eventLog.groupBy({
      by: ['eventName'],
      where: {
        eventName: {
          in: [
            'toolchain_quotation_to_proforma_invoice',
            'toolchain_proforma_invoice_to_commercial_invoice',
            'toolchain_commercial_invoice_to_packing_list',
            'toolchain_container_to_packing_list',
            'company_profile_apply_to_document',
          ],
        },
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: true,
    });

    // 商品库分析
    const productStats = await prisma.productItem.count();
    const activeUsersWithProducts = await prisma.productItem.groupBy({
      by: ['userId'],
      _count: true,
    });

    // 推荐资源分析
    const featuredResources = await prisma.resource.count({
      where: { isFeatured: true },
    });

    // 广告权益分析
    const adEntitlements = await prisma.rewardGrant.groupBy({
      by: ['rewardType', 'status'],
      where: {
        rewardType: 'AD_SLOT_DAYS',
      },
      _sum: {
        rewardValue: true,
      },
    });

    // 奖励发放统计
    const rewardGrants = await prisma.rewardGrant.groupBy({
      by: ['rewardType', 'status'],
      _count: true,
      _sum: {
        rewardValue: true,
      },
    });

    const funnels = {
      invite: {
        generate: inviteFunnels.find((f) => f.eventName === 'invite_code_generate')?._count || 0,
        copy: inviteFunnels.find((f) => f.eventName === 'invite_code_copy')?._count || 0,
        linkCopy: inviteFunnels.find((f) => f.eventName === 'invite_link_copy')?._count || 0,
        registerSuccess: inviteFunnels.find((f) => f.eventName === 'invite_register_success')?._count || 0,
        rewardGranted: inviteFunnels.find((f) => f.eventName === 'invite_reward_granted')?._count || 0,
      },
      toolchain: {
        quoteToPI: toolchainFunnels.find((f) => f.eventName === 'toolchain_quotation_to_proforma_invoice')?._count || 0,
        piToCI: toolchainFunnels.find((f) => f.eventName === 'toolchain_proforma_invoice_to_commercial_invoice')?._count || 0,
        ciToPL: toolchainFunnels.find((f) => f.eventName === 'toolchain_commercial_invoice_to_packing_list')?._count || 0,
        containerToPL: toolchainFunnels.find((f) => f.eventName === 'toolchain_container_to_packing_list')?._count || 0,
        companyProfileApply: toolchainFunnels.find((f) => f.eventName === 'company_profile_apply_to_document')?._count || 0,
      },
      products: {
        total: productStats,
        activeUsers: activeUsersWithProducts.length,
      },
      featuredResources,
      adEntitlements: adEntitlements.map((e) => ({
        type: e.rewardType,
        status: e.status,
        totalDays: e._sum.rewardValue || 0,
      })),
      rewardGrants: rewardGrants.map((r) => ({
        type: r.rewardType,
        status: r.status,
        count: r._count,
        totalValue: r._sum.rewardValue || 0,
      })),
    };

    return NextResponse.json({ success: true, funnels });
  } catch (error) {
    console.error('GET /api/admin/analytics/growth-funnels error:', error);
    return NextResponse.json({ error: '获取增长漏斗失败' }, { status: 500 });
  }
}
