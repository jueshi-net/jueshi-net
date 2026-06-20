#!/usr/bin/env node
/**
 * Seed script for initial reward items
 * 
 * This script creates the initial set of reward items for the points redemption system.
 * It is idempotent - running it multiple times will not create duplicates.
 * 
 * Usage: node scripts/seed-reward-items.js
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

const INITIAL_REWARD_ITEMS = [
  {
    code: "member_3day",
    name: "3天会员体验",
    description: "延长会员有效期3天，享受更多会员专属功能",
    costPoints: 300,
    rewardType: "member_trial",
    rewardValue: 3,
    enabled: true,
    sortOrder: 1,
  },
  {
    code: "member_7day",
    name: "7天会员体验",
    description: "延长会员有效期7天，享受更多会员专属功能",
    costPoints: 600,
    rewardType: "member_trial",
    rewardValue: 7,
    enabled: true,
    sortOrder: 2,
  },
  {
    code: "word_export_10x",
    name: "Word导出券 x10",
    description: "10次文档导出为Word格式的机会",
    costPoints: 200,
    rewardType: "word_export_coupon",
    rewardValue: 10,
    enabled: true,
    sortOrder: 3,
  },
  {
    code: "no_branding_5x",
    name: "去品牌券 x5",
    description: "5次去除文档品牌标识的机会",
    costPoints: 150,
    rewardType: "no_branding_coupon",
    rewardValue: 5,
    enabled: true,
    sortOrder: 4,
  },
  {
    code: "ad_slot_7day",
    name: "7天广告权益",
    description: "获得7天广告展示权益（即将支持）",
    costPoints: 800,
    rewardType: "ad_slot_days",
    rewardValue: 7,
    enabled: false, // 暂不启用，等待后端支持
    sortOrder: 10,
  },
  {
    code: "growth_50",
    name: "成长值 +50",
    description: "增加50点成长值（即将支持）",
    costPoints: 200,
    rewardType: "growth",
    rewardValue: 50,
    enabled: false, // 暂不启用，等待后端支持
    sortOrder: 11,
  },
];

async function main() {
  console.log("🌱 Starting reward items seed...\n");

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const item of INITIAL_REWARD_ITEMS) {
    try {
      // Check if item already exists
      const existing = await prisma.rewardItem.findUnique({
        where: { code: item.code },
      });

      if (existing) {
        console.log(`⏭️  Skipping ${item.code} (already exists)`);
        skipped++;
        continue;
      }

      // Create new item
      await prisma.rewardItem.create({
        data: item,
      });

      console.log(`✅ Created ${item.code}: ${item.name}`);
      created++;
    } catch (error) {
      console.error(`❌ Failed to create ${item.code}:`, error.message);
    }
  }

  console.log("\n📊 Seed Summary:");
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total:   ${INITIAL_REWARD_ITEMS.length}`);

  // List all reward items
  const allItems = await prisma.rewardItem.findMany({
    orderBy: { sortOrder: "asc" },
  });

  console.log("\n📋 Current Reward Items:");
  allItems.forEach((item) => {
    const status = item.enabled ? "✅" : "⏸️";
    console.log(`   ${status} ${item.code}: ${item.name} (${item.costPoints} pts, ${item.rewardValue} ${item.rewardType})`);
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
