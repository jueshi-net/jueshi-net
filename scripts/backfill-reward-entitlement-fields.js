#!/usr/bin/env node
/**
 * Data backfill script for v1.20.42.18.4.3
 * Backfills new fields for existing reward items and user rewards
 * 
 * Usage: node scripts/backfill-reward-entitlement-fields.js
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
  console.log("🔄 Starting data backfill for v1.20.42.18.4.3...\n");

  // 1. Backfill reward items with default values
  console.log("📦 Backfilling reward items...");
  const rewardItems = await prisma.rewardItem.findMany();
  console.log(`   Found ${rewardItems.length} reward items`);

  for (const item of rewardItems) {
    await prisma.rewardItem.update({
      where: { id: item.id },
      data: {
        stockUsed: item.stockUsed || 0,
        perUserLimit: item.perUserLimit || 1,
        cooldownHours: item.cooldownHours || 0,
        requiresApproval: item.requiresApproval || false,
      },
    });
  }
  console.log("   ✅ Reward items backfilled\n");

  // 2. Backfill user rewards with pointsCost
  console.log("📦 Backfilling user rewards...");
  const userRewards = await prisma.userReward.findMany();
  console.log(`   Found ${userRewards.length} user rewards`);

  let backfilled = 0;
  for (const reward of userRewards) {
    const rewardItem = await prisma.rewardItem.findUnique({
      where: { id: reward.rewardItemId },
    });

    if (rewardItem) {
      await prisma.userReward.update({
        where: { id: reward.id },
        data: {
          pointsCost: reward.pointsCost || rewardItem.costPoints,
          auditStatus: reward.auditStatus || "auto",
        },
      });
      backfilled++;
    }
  }
  console.log(`   ✅ ${backfilled} user rewards backfilled\n`);

  // 3. Create CouponEntitlement for existing word_export_coupon rewards
  console.log("📦 Creating coupon entitlements for word_export_coupon...");
  const wordExportRewards = await prisma.userReward.findMany({
    where: { rewardType: "word_export_coupon" },
  });
  console.log(`   Found ${wordExportRewards.length} word_export_coupon rewards`);

  let couponsCreated = 0;
  for (const reward of wordExportRewards) {
    // Check if coupon already exists
    const existingCoupon = await prisma.couponEntitlement.findFirst({
      where: { sourceRewardId: reward.id },
    });

    if (!existingCoupon) {
      await prisma.couponEntitlement.create({
        data: {
          userId: reward.userId,
          couponType: "word_export",
          quantity: reward.rewardValue,
          usedCount: 0,
          status: "active",
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年有效期
          sourceRewardId: reward.id,
        },
      });
      couponsCreated++;
    }
  }
  console.log(`   ✅ ${couponsCreated} word_export coupons created\n`);

  // 4. Create CouponEntitlement for existing no_branding_coupon rewards
  console.log("📦 Creating coupon entitlements for no_branding_coupon...");
  const noBrandingRewards = await prisma.userReward.findMany({
    where: { rewardType: "no_branding_coupon" },
  });
  console.log(`   Found ${noBrandingRewards.length} no_branding_coupon rewards`);

  let noBrandingCouponsCreated = 0;
  for (const reward of noBrandingRewards) {
    // Check if coupon already exists
    const existingCoupon = await prisma.couponEntitlement.findFirst({
      where: { sourceRewardId: reward.id },
    });

    if (!existingCoupon) {
      await prisma.couponEntitlement.create({
        data: {
          userId: reward.userId,
          couponType: "no_branding",
          quantity: reward.rewardValue,
          usedCount: 0,
          status: "active",
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年有效期
          sourceRewardId: reward.id,
        },
      });
      noBrandingCouponsCreated++;
    }
  }
  console.log(`   ✅ ${noBrandingCouponsCreated} no_branding coupons created\n`);

  // 5. Summary
  console.log("📊 Backfill Summary:");
  console.log(`   Reward items: ${rewardItems.length}`);
  console.log(`   User rewards: ${userRewards.length}`);
  console.log(`   User rewards backfilled: ${backfilled}`);
  console.log(`   Word export coupons created: ${couponsCreated}`);
  console.log(`   No branding coupons created: ${noBrandingCouponsCreated}`);

  // 6. Verify
  console.log("\n🔍 Verification:");
  const totalCoupons = await prisma.couponEntitlement.count();
  console.log(`   Total coupon entitlements: ${totalCoupons}`);

  const couponsByType = await prisma.couponEntitlement.groupBy({
    by: ["couponType"],
    _count: true,
  });
  console.log("   Coupons by type:");
  couponsByType.forEach((c) => {
    console.log(`     ${c.couponType}: ${c._count}`);
  });
}

main()
  .catch((e) => {
    console.error("❌ Backfill failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
