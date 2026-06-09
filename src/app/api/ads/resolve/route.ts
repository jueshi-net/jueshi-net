import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAdRenderToken } from "@/lib/ad-token";

/**
 * GET /api/ads/resolve
 *
 * Resolves a placement to an active creative.
 * Returns creative metadata + signed adRenderToken for impression/click reporting.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placementKey = searchParams.get("placementKey");

    if (!placementKey) {
      return NextResponse.json(
        { error: "Missing required parameter: placementKey" },
        { status: 400 }
      );
    }

    // 1. Verify placement exists and is active
    const placement = await prisma.adPlacement.findUnique({
      where: { key: placementKey },
    });

    if (!placement || !placement.isActive) {
      return NextResponse.json({ ad: null }, { status: 200 });
    }

    // 2. Find active campaigns that include this placement
    const now = new Date();
    const campaigns = await prisma.adCampaign.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
        placements: {
          has: placementKey,
        },
      },
      orderBy: { priority: "desc" },
    });

    // 3. For each campaign, find an active creative
    let selectedCreative = null;
    let selectedCampaign = null;

    for (const campaign of campaigns) {
      const creative = await prisma.adCreative.findFirst({
        where: {
          campaignId: campaign.id,
          isActive: true,
        },
        orderBy: { sortOrder: "desc" },
      });

      if (creative) {
        selectedCampaign = campaign;
        selectedCreative = creative;
        break;
      }
    }

    if (!selectedCreative || !selectedCampaign) {
      return NextResponse.json({ ad: null }, { status: 200 });
    }

    // 4. Generate adRenderToken
    const adRenderToken = generateAdRenderToken(
      selectedCampaign.id,
      placementKey,
      selectedCreative.id
    );

    // 5. Build response (never expose codeSnippet to frontend)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const ad = {
      placementKey,
      campaignId: selectedCampaign.id,
      creativeId: selectedCreative.id,
      creativeType: selectedCreative.creativeType,
      imageUrl: selectedCreative.imageUrl,
      headline: selectedCreative.headline,
      bodyText: selectedCreative.bodyText,
      ctaText: selectedCreative.ctaText,
      targetUrl: selectedCreative.targetUrl,
      adRenderToken,
      sponsoredLabel: "推广",
      expiresAt,
    };

    return NextResponse.json({ ad });
  } catch (error) {
    console.error("[/api/ads/resolve] Error:", error);
    return NextResponse.json({ ad: null }, { status: 200 });
  }
}
