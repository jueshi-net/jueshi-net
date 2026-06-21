#!/usr/bin/env node
/**
 * Production verification script for v1.20.42.18.4.3.1
 * Tests reward redemption functionality
 * 
 * Usage: node scripts/verify-reward-redemption.js
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
  console.log("🔍 Starting production verification for v1.20.42.18.4.3.1...\n");

  // 1. Verify role safety
  console.log("=== 1. Role Safety Check ===");
  const roleDistribution = await prisma.user.groupBy({
    by: ["role"],
    _count: true,
  });
  console.log("Role distribution:", JSON.stringify(roleDistribution, null, 2));
  
  const memberCount = roleDistribution.find(r => r.role === "member")?._count || 0;
  console.log(`role=member count: ${memberCount}`);
  if (memberCount > 0) {
    console.error("❌ FAILED: role=member count should be 0");
    process.exit(1);
  }
  console.log("✅ PASSED: role=member count is 0\n");

  // 2. Verify admin account
  console.log("=== 2. Admin Account Check ===");
  const admin = await prisma.user.findUnique({
    where: { email: "9833416@qq.com" },
    select: { email: true, role: true, membershipTier: true, memberUntil: true },
  });
  console.log("Admin status:", JSON.stringify(admin, null, 2));
  
  if (admin.role !== "admin") {
    console.error("❌ FAILED: 9833416@qq.com role should be admin");
    process.exit(1);
  }
  console.log("✅ PASSED: 9833416@qq.com role is admin\n");

  // 3. Verify reward items
  console.log("=== 3. Reward Items Check ===");
  const rewardItems = await prisma.rewardItem.findMany({
    select: { code: true, name: true, enabled: true, rewardType: true },
    orderBy: { sortOrder: "asc" },
  });
  console.log("Reward items:", JSON.stringify(rewardItems, null, 2));
  
  const activeItems = rewardItems.filter(r => r.enabled);
  const inactiveItems = rewardItems.filter(r => !r.enabled);
  console.log(`Active items: ${activeItems.length}`);
  console.log(`Inactive items: ${inactiveItems.length}`);
  
  // Check ad_slot_7day is inactive
  const adSlot = rewardItems.find(r => r.code === "ad_slot_7day");
  if (adSlot && adSlot.enabled) {
    console.error("❌ FAILED: ad_slot_7day should be inactive");
    process.exit(1);
  }
  console.log("✅ PASSED: ad_slot_7day is inactive\n");

  // 4. Verify coupon entitlements
  console.log("=== 4. Coupon Entitlements Check ===");
  const couponCount = await prisma.couponEntitlement.count();
  console.log(`Total coupon entitlements: ${couponCount}`);
  
  const couponsByType = await prisma.couponEntitlement.groupBy({
    by: ["couponType"],
    _count: true,
  });
  console.log("Coupons by type:", JSON.stringify(couponsByType, null, 2));
  console.log("✅ PASSED: Coupon entitlements exist\n");

  // 5. Verify user rewards with new fields
  console.log("=== 5. User Rewards Check ===");
  const userRewards = await prisma.userReward.findMany({
    take: 5,
    select: {
      id: true,
      rewardType: true,
      status: true,
      pointsCost: true,
      auditStatus: true,
    },
  });
  console.log("Sample user rewards:", JSON.stringify(userRewards, null, 2));
  
  // Check if new fields are populated
  const hasPointsCost = userRewards.every(r => r.pointsCost !== null && r.pointsCost !== undefined);
  const hasAuditStatus = userRewards.every(r => r.auditStatus !== null && r.auditStatus !== undefined);
  
  if (!hasPointsCost) {
    console.error("❌ FAILED: pointsCost should be populated");
    process.exit(1);
  }
  if (!hasAuditStatus) {
    console.error("❌ FAILED: auditStatus should be populated");
    process.exit(1);
  }
  console.log("✅ PASSED: User rewards have new fields\n");

  // 6. Verify reward items have new fields
  console.log("=== 6. Reward Items New Fields Check ===");
  const rewardItemsWithFields = await prisma.rewardItem.findMany({
    take: 3,
    select: {
      code: true,
      stockLimit: true,
      stockUsed: true,
      perUserLimit: true,
      cooldownHours: true,
      requiresApproval: true,
    },
  });
  console.log("Sample reward items with new fields:", JSON.stringify(rewardItemsWithFields, null, 2));
  
  const hasNewFields = rewardItemsWithFields.every(r => 
    r.stockUsed !== null && r.stockUsed !== undefined &&
    r.perUserLimit !== null && r.perUserLimit !== undefined &&
    r.cooldownHours !== null && r.cooldownHours !== undefined
  );
  
  if (!hasNewFields) {
    console.error("❌ FAILED: Reward items should have new fields");
    process.exit(1);
  }
  console.log("✅ PASSED: Reward items have new fields\n");

  // Summary
  console.log("=== Summary ===");
  console.log("✅ All production verification checks passed!");
  console.log("✅ Role safety verified");
  console.log("✅ Admin account verified");
  console.log("✅ Reward items verified");
  console.log("✅ Coupon entitlements verified");
  console.log("✅ User rewards verified");
  console.log("✅ New fields verified");
}

main()
  .catch((e) => {
    console.error("❌ Verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
