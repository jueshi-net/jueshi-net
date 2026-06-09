import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const campaigns = await prisma.adCampaign.findMany({
    where: { title: { contains: "TEST" } },
    select: { id: true, title: true, priority: true, isActive: true, startDate: true, endDate: true, impressions: true, clicks: true, placements: true },
    orderBy: { priority: "desc" },
  });

  console.log("Campaigns by priority:");
  for (const c of campaigns) {
    console.log(`  ${c.title} | priority=${c.priority} | isActive=${c.isActive} | impressions=${c.impressions} | clicks=${c.clicks} | placements=${JSON.stringify(c.placements)}`);
  }

  // Check which campaign the resolve API picks for article.footer_recommend
  const picked = await prisma.adCampaign.findFirst({
    where: {
      isActive: true,
      placements: { has: "article.footer_recommend" },
    },
    orderBy: { priority: "desc" },
    select: { id: true, title: true, priority: true },
  });

  console.log("\nResolve picks for article.footer_recommend:", picked ? `${picked.title} (priority=${picked.priority})` : "none");

  // Check if TEST_SAFE_AD_19 has creatives
  const safe19 = campaigns.find(c => c.title.includes("SAFE_AD_19"));
  if (safe19) {
    const creatives = await prisma.adCreative.findMany({
      where: { campaignId: safe19.id },
      select: { id: true, title: true, isActive: true, creativeType: true },
    });
    console.log("\nTEST_SAFE_AD_19 creatives:", JSON.stringify(creatives, null, 2));
  }

  // Check if TEST_VERIFY_18_2 has creatives
  const verify18 = campaigns.find(c => c.title.includes("VERIFY_18_2"));
  if (verify18) {
    const creatives = await prisma.adCreative.findMany({
      where: { campaignId: verify18.id },
      select: { id: true, title: true, isActive: true, creativeType: true },
    });
    console.log("\nTEST_VERIFY_18_2 creatives:", JSON.stringify(creatives, null, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
