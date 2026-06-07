import { prisma } from "@/lib/prisma";

export type AdPlacement =
  | "home-hero"
  | "home-after-tools"
  | "home-topic-native"
  | "home-forum-native"
  | "home-footer-partner";

export interface AdSlotData {
  slot: string;
  imageUrl?: string | null;
  targetUrl?: string | null;
  codeSnippet?: string | null;
  title?: string;
  description?: string;
}

export async function getAdForSlot(slot: AdPlacement): Promise<AdSlotData | null> {
  try {
    const now = new Date();
    const campaign = await prisma.adCampaign.findFirst({
      where: {
        isActive: true,
        startDate: { lte: now },
        OR: [{ endDate: { gte: now } }, { endDate: null }],
        placements: { has: slot },
      },
      orderBy: { priority: "desc" },
    });

    if (!campaign) return null;

    // Increment impressions
    await prisma.adCampaign.update({
      where: { id: campaign.id },
      data: { impressions: { increment: 1 } },
    });

    return {
      slot,
      imageUrl: campaign.imageUrl,
      targetUrl: campaign.targetUrl,
      codeSnippet: campaign.codeSnippet,
      title: campaign.title,
      description: campaign.adType === "DIRECT" ? "赞助内容" : "广告",
    };
  } catch {
    return null;
  }
}
