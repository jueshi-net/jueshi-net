import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Check if test data already exists
  const existing = await prisma.adCampaign.findFirst({
    where: { title: { contains: "TEST_SAFE_AD_19" } },
  });

  if (existing) {
    console.log("Test campaign already exists:", existing.id);
    const creatives = await prisma.adCreative.findMany({
      where: { campaignId: existing.id },
      select: { id: true, title: true },
    });
    console.log("Creatives:", JSON.stringify(creatives, null, 2));
    process.exit(0);
  }

  // Create campaign
  const campaign = await prisma.adCampaign.create({
    data: {
      title: "TEST_SAFE_AD_19_CAMPAIGN",
      adType: "DIRECT",
      isActive: true,
      placements: ["article.footer_recommend", "tool.footer_banner"],
      targetCountries: [],
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      priority: 10,
      imageUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=200&fit=crop",
      targetUrl: "https://jueshi.net/resources",
      impressions: 0,
      clicks: 0,
    },
  });

  console.log("Created campaign:", campaign.id);

  // Create image creative
  const creative1 = await prisma.adCreative.create({
    data: {
      campaignId: campaign.id,
      title: "TEST_SAFE_AD_19_IMAGE_CREATIVE",
      creativeType: "image",
      isActive: true,
      imageUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=200&fit=crop",
      targetUrl: "https://jueshi.net/resources",
      headline: "🚀 出海经营必备工具箱",
      bodyText: "百宝箱精选工具，助你轻松拓展海外市场",
      ctaText: "立即查看",
      sortOrder: 10,
    },
  });

  console.log("Created creative 1:", creative1.id);

  // Create native creative
  const creative2 = await prisma.adCreative.create({
    data: {
      campaignId: campaign.id,
      title: "TEST_SAFE_AD_19_NATIVE_CREATIVE",
      creativeType: "native",
      isActive: true,
      headline: "📦 跨境物流费用计算器",
      bodyText: "一键计算体积重，精准估算运费",
      ctaText: "免费使用 →",
      targetUrl: "https://jueshi.net/tools/shipping-calculator",
      sortOrder: 5,
    },
  });

  console.log("Created creative 2:", creative2.id);
  console.log("\nTest data ready for v1.20.42.6.19 Safe Ad Rendering Pilot");
}

main().catch(console.error).finally(() => prisma.$disconnect());
