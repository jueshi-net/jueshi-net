import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.adCampaign.findFirst({
    where: { title: { contains: "TEST_LANDING_AD_21" } },
  });

  if (existing) {
    console.log("Test campaign already exists:", existing.id);
    const creatives = await prisma.adCreative.findMany({
      where: { campaignId: existing.id },
      select: { id: true, title: true, isActive: true },
    });
    console.log("Creatives:", JSON.stringify(creatives, null, 2));
    process.exit(0);
  }

  const campaign = await prisma.adCampaign.create({
    data: {
      title: "TEST_LANDING_AD_21_CAMPAIGN",
      adType: "DIRECT",
      isActive: true,
      placements: ["landing.block_between"],
      targetCountries: [],
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      priority: 21,
      imageUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=150&fit=crop",
      targetUrl: "https://jueshi.net/tools",
      impressions: 0,
      clicks: 0,
    },
  });

  console.log("Created campaign:", campaign.id);

  const creative = await prisma.adCreative.create({
    data: {
      campaignId: campaign.id,
      title: "TEST_LANDING_AD_21_IMAGE_CREATIVE",
      creativeType: "image",
      isActive: true,
      imageUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=150&fit=crop",
      targetUrl: "https://jueshi.net/tools",
      headline: "🔧 百宝箱工具箱",
      bodyText: "外贸人必备的免费工具集合，一站式解决物流、报关、报价问题",
      ctaText: "立即使用",
      sortOrder: 10,
    },
  });

  console.log("Created creative:", creative.id);
  console.log("\nTest data ready for landing.block_between");
}

main().catch(console.error).finally(() => prisma.$disconnect());
