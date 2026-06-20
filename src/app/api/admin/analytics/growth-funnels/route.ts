import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAdminRole } from '@/lib/auth/permissions';

/**
 * GET /api/admin/analytics/growth-funnels
 * 增长漏斗分析（管理员）
 * 
 * 包含：
 * - 邀请增长漏斗
 * - 工具链漏斗
 * - 商品库分析
 * - 推荐资源分析
 * - 广告权益分析
 * 
 * 安全：不返回明文 IP、不返回敏感 metadata
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: '未授权' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || '30d';

  let daysBack = 30;
  if (range === '7d') daysBack = 7;
  else if (range === '14d') daysBack = 14;
  else if (range === '30d') daysBack = 30;
  else if (range === 'all') daysBack = 3650;

  const since = new Date();
  since.setDate(since.getDate() - daysBack);

  try {
    // ── 1. 邀请增长漏斗 ──
    const inviteEvents = await prisma.eventLog.groupBy({
      by: ['eventType'],
      where: {
        eventType: {
          in: [
            'invite_code_generate',
            'invite_code_copy',
            'invite_link_copy',
            'invite_register_success',
            'invite_reward_granted',
          ],
        },
        createdAt: { gte: since },
      },
      _count: true,
    });

    const inviteMap = new Map<string, number>(
      inviteEvents.map((e: any) => [e.eventType, e._count as number])
    );

    const inviteFunnel = {
      generate: inviteMap.get('invite_code_generate') || 0,
      copy: inviteMap.get('invite_code_copy') || 0,
      linkCopy: inviteMap.get('invite_link_copy') || 0,
      registerSuccess: inviteMap.get('invite_register_success') || 0,
      rewardGranted: inviteMap.get('invite_reward_granted') || 0,
    };

    // 转化率计算
    const calcRate = (numerator: number, denominator: number): string => {
      if (denominator <= 0) return 'N/A';
      return ((numerator / denominator) * 100).toFixed(1);
    };

    const inviteConversions = {
      generateToCopy: calcRate(inviteFunnel.copy, inviteFunnel.generate),
      copyToLinkCopy: calcRate(inviteFunnel.linkCopy, inviteFunnel.copy),
      linkCopyToRegister: calcRate(inviteFunnel.registerSuccess, inviteFunnel.linkCopy),
      registerToReward: calcRate(inviteFunnel.rewardGranted, inviteFunnel.registerSuccess),
      overallConversion: calcRate(inviteFunnel.rewardGranted, inviteFunnel.generate),
    };

    // ── 2. 工具链漏斗 ──
    const toolchainEvents = await prisma.eventLog.groupBy({
      by: ['eventType'],
      where: {
        eventType: {
          in: [
            'toolchain_quotation_to_proforma_invoice',
            'toolchain_proforma_invoice_to_commercial_invoice',
            'toolchain_commercial_invoice_to_packing_list',
            'toolchain_container_to_packing_list',
            'company_profile_apply_to_document',
          ],
        },
        createdAt: { gte: since },
      },
      _count: true,
    });

    const toolchainMap = new Map<string, number>(
      toolchainEvents.map((e: any) => [e.eventType, e._count as number])
    );

    const toolchainFunnel = {
      quote: toolchainMap.get('toolchain_quotation_to_proforma_invoice') || 0,
      pi: toolchainMap.get('toolchain_proforma_invoice_to_commercial_invoice') || 0,
      ci: toolchainMap.get('toolchain_commercial_invoice_to_packing_list') || 0,
      pl: toolchainMap.get('toolchain_container_to_packing_list') || 0,
      container: toolchainMap.get('toolchain_container_to_packing_list') || 0,
      companyProfileApply: toolchainMap.get('company_profile_apply_to_document') || 0,
    };

    const toolchainConversions = {
      quoteToPI: calcRate(toolchainFunnel.pi, toolchainFunnel.quote),
      piToCI: calcRate(toolchainFunnel.ci, toolchainFunnel.pi),
      ciToPL: calcRate(toolchainFunnel.pl, toolchainFunnel.ci),
    };

    // ── 3. 商品库分析 ──
    const [
      productTotal,
      productActive,
      productUsers,
      productRecent,
    ] = await Promise.all([
      prisma.productItem.count(),
      prisma.productItem.count({ where: { isActive: true } }),
      prisma.productItem.groupBy({ by: ['userId'], _count: true }),
      prisma.productItem.count({
        where: { createdAt: { gte: since } },
      }),
    ]);

    // 商品导入事件
    const productImportEvents = await prisma.eventLog.groupBy({
      by: ['eventType'],
      where: {
        eventType: {
          in: ['product_import', 'product_insert', 'product_import_failed'],
        },
        createdAt: { gte: since },
      },
      _count: true,
    });

    const productEventMap = new Map<string, number>(
      productImportEvents.map((e: any) => [e.eventType, e._count as number])
    );

    const products = {
      total: productTotal,
      active: productActive,
      uniqueUsers: productUsers.length,
      recentCreated: productRecent,
      importCount: productEventMap.get('product_import') || 0,
      insertCount: productEventMap.get('product_insert') || 0,
      importFailedCount: productEventMap.get('product_import_failed') || 0,
    };

    // ── 4. 推荐资源分析 ──
    const [
      featuredTotal,
      featuredActive,
      featuredGroupDist,
      resourceClickEvents,
    ] = await Promise.all([
      prisma.resource.count({ where: { isFeatured: true } }),
      prisma.resource.count({ where: { isFeatured: true, isActive: true } }),
      prisma.resource.groupBy({
        by: ['featuredGroup'],
        where: { isFeatured: true },
        _count: true,
        orderBy: { _count: { featuredGroup: 'desc' } },
      }),
      prisma.eventLog.groupBy({
        by: ['toolName', 'action'],
        where: {
          eventType: 'resource_click',
          createdAt: { gte: since },
        },
        _count: true,
        orderBy: { _count: { toolName: 'desc' } },
        take: 10,
      }),
    ]);

    // Top 10 推荐资源点击
    const topResourceClicks = resourceClickEvents.map((e: any) => ({
      resource: e.toolName || e.action || 'unknown',
      count: e._count as number,
    }));

    const featuredGroups = featuredGroupDist
      .filter((g: any) => g.featuredGroup !== null)
      .map((g: any) => ({
        group: g.featuredGroup as string,
        count: g._count as number,
      }));

    const resources = {
      featuredTotal,
      featuredActive,
      totalClicks: resourceClickEvents.reduce((sum: number, e: any) => sum + (e._count as number), 0),
      topClicks: topResourceClicks,
      featuredGroups,
    };

    // ── 5. 广告权益分析 (AD_SLOT_DAYS) ──
    const [
      adGrantsByStatus,
      adApplications,
      adTotalDays,
    ] = await Promise.all([
      prisma.rewardGrant.groupBy({
        by: ['status'],
        where: { rewardType: 'AD_SLOT_DAYS' },
        _count: true,
        _sum: { rewardValue: true },
      }),
      prisma.adApplication.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.rewardGrant.aggregate({
        where: { rewardType: 'AD_SLOT_DAYS', status: 'GRANTED' },
        _sum: { rewardValue: true },
        _count: true,
      }),
    ]);

    const adGrantStatus = adGrantsByStatus.map((g: any) => ({
      status: g.status as string,
      count: g._count as number,
      totalDays: (g._sum?.rewardValue as number) || 0,
    }));

    const adAppStatus = adApplications.map((a: any) => ({
      status: a.status as string,
      count: a._count as number,
    }));

    const adEntitlements = {
      granted: adGrantStatus.find(s => s.status === 'GRANTED')?.count || 0,
      grantedDays: (adTotalDays._sum.rewardValue as number) || 0,
      pending: adGrantStatus.find(s => s.status === 'PENDING')?.count || 0,
      failed: adGrantStatus.find(s => s.status === 'FAILED')?.count || 0,
      revoked: adGrantStatus.find(s => s.status === 'REVOKED')?.count || 0,
      applications: {
        pending: adAppStatus.find(s => s.status === 'PENDING')?.count || 0,
        approved: adAppStatus.find(s => s.status === 'APPROVED')?.count || 0,
        rejected: adAppStatus.find(s => s.status === 'REJECTED')?.count || 0,
        active: adAppStatus.find(s => s.status === 'ACTIVE')?.count || 0,
        expired: adAppStatus.find(s => s.status === 'EXPIRED')?.count || 0,
      },
    };

    // ── 6. 奖励发放总览 ──
    const rewardGrants = await prisma.rewardGrant.groupBy({
      by: ['rewardType', 'status'],
      _count: true,
      _sum: { rewardValue: true },
    });

    const rewardSummary = rewardGrants.map((r: any) => ({
      type: r.rewardType as string,
      status: r.status as string,
      count: r._count as number,
      totalValue: (r._sum?.rewardValue as number) || 0,
    }));

    // ── 样本量判断 ──
    const MIN_SAMPLE_SIZE = 5;
    const sampleSizeWarning = {
      invite: inviteFunnel.generate < MIN_SAMPLE_SIZE,
      toolchain: toolchainFunnel.quote < MIN_SAMPLE_SIZE,
      products: products.total < MIN_SAMPLE_SIZE,
      resources: resources.featuredTotal < MIN_SAMPLE_SIZE,
      adEntitlements: adEntitlements.granted < MIN_SAMPLE_SIZE,
    };

    return NextResponse.json({
      success: true,
      range,
      daysBack,
      funnels: {
        invite: {
          steps: inviteFunnel,
          conversions: inviteConversions,
        },
        toolchain: {
          steps: toolchainFunnel,
          conversions: toolchainConversions,
        },
        products,
        resources,
        adEntitlements,
        rewardSummary,
      },
      sampleSizeWarning,
    });
  } catch (error) {
    console.error('GET /api/admin/analytics/growth-funnels error:', error);
    return NextResponse.json({ error: '获取增长漏斗失败' }, { status: 500 });
  }
}
