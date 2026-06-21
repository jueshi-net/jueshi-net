#!/usr/bin/env node
/**
 * Audit script for reward system state
 * Usage: node scripts/audit-rewards-state.js
 */

require("dotenv").config({ path: ".env.production", override: true });
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== Reward Items ===");
  const rewardItems = await prisma.rewardItem.findMany({
    orderBy: { sortOrder: "asc" },
  });
  console.log(JSON.stringify(rewardItems, null, 2));

  console.log("\n=== User Rewards Count ===");
  const userRewardsCount = await prisma.userReward.count();
  console.log(`Total: ${userRewardsCount}`);

  console.log("\n=== User Rewards by Status ===");
  const byStatus = await prisma.userReward.groupBy({
    by: ["status"],
    _count: true,
  });
  console.log(JSON.stringify(byStatus, null, 2));

  console.log("\n=== User Rewards by RewardType ===");
  const byType = await prisma.userReward.groupBy({
    by: ["rewardType"],
    _count: true,
  });
  console.log(JSON.stringify(byType, null, 2));

  console.log("\n=== Reward Grants Count ===");
  const rewardGrantsCount = await prisma.rewardGrant.count();
  console.log(`Total: ${rewardGrantsCount}`);

  console.log("\n=== Reward Grants by Status ===");
  const grantsByStatus = await prisma.rewardGrant.groupBy({
    by: ["status"],
    _count: true,
  });
  console.log(JSON.stringify(grantsByStatus, null, 2));

  console.log("\n=== Reward Grants by Type ===");
  const grantsByType = await prisma.rewardGrant.groupBy({
    by: ["rewardType"],
    _count: true,
  });
  console.log(JSON.stringify(grantsByType, null, 2));

  console.log("\n=== Growth Logs Count ===");
  const growthLogsCount = await prisma.growthLog.count();
  console.log(`Total: ${growthLogsCount}`);

  console.log("\n=== Growth Logs by Type ===");
  const growthByType = await prisma.growthLog.groupBy({
    by: ["type"],
    _count: true,
  });
  console.log(JSON.stringify(growthByType, null, 2));

  console.log("\n=== Point Ledgers Count ===");
  const pointLedgersCount = await prisma.pointLedger.count();
  console.log(`Total: ${pointLedgersCount}`);

  console.log("\n=== Users with memberUntil > now ===");
  const activeMembers = await prisma.user.count({
    where: {
      memberUntil: {
        gt: new Date(),
      },
    },
  });
  console.log(`Active members: ${activeMembers}`);

  console.log("\n=== Role Distribution ===");
  const roleDistribution = await prisma.user.groupBy({
    by: ["role"],
    _count: true,
  });
  console.log(JSON.stringify(roleDistribution, null, 2));

  console.log("\n=== Membership Tier Distribution ===");
  const tierDistribution = await prisma.user.groupBy({
    by: ["membershipTier"],
    _count: true,
  });
  console.log(JSON.stringify(tierDistribution, null, 2));

  console.log("\n=== Admin Account Status ===");
  const admin = await prisma.user.findUnique({
    where: { email: "9833416@qq.com" },
    select: {
      email: true,
      role: true,
      membershipTier: true,
      memberUntil: true,
      points: true,
      growthValue: true,
    },
  });
  console.log(JSON.stringify(admin, null, 2));
}

main()
  .catch((e) => {
    console.error("❌ Audit failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
