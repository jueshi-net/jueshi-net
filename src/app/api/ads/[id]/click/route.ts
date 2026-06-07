import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/ads/[id]/click
 *
 * 记录直投广告点击。网盟广告由第三方自行统计，本地不需要调用此接口。
 * 仅对 DIRECT 类型广告生效。
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const campaign = await prisma.adCampaign.findUnique({
      where: { id },
      select: { id: true, adType: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Only track clicks for DIRECT ads
    if (campaign.adType !== 'DIRECT') {
      return NextResponse.json({ tracked: false, reason: 'Not a DIRECT ad' });
    }

    await prisma.adCampaign.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });

    return NextResponse.json({ tracked: true, clicks: 'incremented' });
  } catch (e) {
    console.error('[Ad Click] Error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
