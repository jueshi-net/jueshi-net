import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Count events
  const count = await prisma.adEvent.count();
  console.log("Total AdEvents:", count);

  // Recent events
  const events = await prisma.adEvent.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  for (const e of events) {
    console.log(`  [${e.eventType}] campaign=${e.campaignId.slice(0, 8)}... placement=${e.placementKey} ipHash=${e.ipHash?.slice(0, 16)} uaHash=${e.userAgentHash ? "SHA256(64)" : "null"}`);
  }

  // Check no raw IP or UA
  const rawIpCount = await prisma.adEvent.count({
    where: { ipHash: { contains: "." } },
  });
  console.log("Events with raw IP (dots in ip_hash):", rawIpCount);

  const rawUaCount = await prisma.adEvent.count({
    where: { userAgentHash: { startsWith: "Mozilla" } },
  });
  console.log("Events with raw UA (starts with Mozilla):", rawUaCount);

  // Campaign counters
  const campaigns = await prisma.adCampaign.findMany({
    select: { id: true, title: true, impressions: true, clicks: true },
  });
  console.log("\nCampaign counters:");
  for (const c of campaigns) {
    console.log(`  ${c.title}: impressions=${c.impressions}, clicks=${c.clicks}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
