import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/ads/dispatch?placement=xxx&country=xxx
 *
 * 分发广告：
 * 1. 匹配 isActive=true 且 placement 相符的广告
 * 2. 如果广告设置了 targetCountries，必须包含当前国家（空数组=通投）
 * 3. 检查 startDate/endDate 有效期
 * 4. 自动 impressions + 1
 * 5. 按 priority 降序返回最高优先级广告
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const placement = searchParams.get('placement');
    const country = searchParams.get('country'); // e.g. 'MY', 'CA', or empty

    if (!placement) {
      return NextResponse.json({ error: 'placement is required' }, { status: 400 });
    }

    const now = new Date();

    // Fetch matching campaigns
    const campaigns = await prisma.adCampaign.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
        placements: {
          has: placement,
        },
      },
      orderBy: { priority: 'desc' },
    });

    // Filter by country targeting
    let matched = campaigns;
    if (country) {
      matched = campaigns.filter(c =>
        c.targetCountries.length === 0 || c.targetCountries.includes(country)
      );
    }

    if (matched.length === 0) {
      return NextResponse.json({ ad: null });
    }

    const ad = matched[0];

    // Increment impressions (fire-and-forget, non-blocking)
    prisma.adCampaign.update({
      where: { id: ad.id },
      data: { impressions: { increment: 1 } },
    }).catch(() => {}); // silently ignore errors

    return NextResponse.json({
      ad: {
        id: ad.id,
        adType: ad.adType,
        imageUrl: ad.imageUrl,
        targetUrl: ad.targetUrl,
        codeSnippet: ad.codeSnippet,
        title: ad.title,
        priority: ad.priority,
      },
    });
  } catch (e) {
    console.error('[Ad Dispatch] Error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
