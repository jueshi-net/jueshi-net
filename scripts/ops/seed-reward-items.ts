// scripts/ops/seed-reward-items.ts
// Seed/verify reward items in the database.
// Safe to run multiple times - uses upsert logic.
// Usage: npx tsx scripts/ops/seed-reward-items.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface RewardItemData {
  code: string;
  name: string;
  description: string;
  costPoints: number;
  rewardType: string;
  rewardValue: number;
  enabled: boolean;
  sortOrder: number;
}

const REWARD_ITEMS: RewardItemData[] = [
  {
    code: "word_export_1x",
    name: "Word 导出次数券 ×1",
    description: "额外 1 次 Word 文档导出额度",
    costPoints: 50,
    rewardType: "word_export_coupon",
    rewardValue: 1,
    enabled: true,
    sortOrder: 1,
  },
  {
    code: "word_export_3x",
    name: "Word 导出次数券 ×3",
    description: "额外 3 次 Word 文档导出额度",
    costPoints: 120,
    rewardType: "word_export_coupon",
    rewardValue: 3,
    enabled: true,
    sortOrder: 2,
  },
  {
    code: "member_1day",
    name: "会员体验券 ×1天",
    description: "1 天会员体验：签到双倍积分、Logo 上传、会员模板、去品牌",
    costPoints: 200,
    rewardType: "member_trial",
    rewardValue: 1,
    enabled: true,
    sortOrder: 10,
  },
  {
    code: "member_3day",
    name: "会员体验券 ×3天",
    description: "3 天会员体验：签到双倍积分、Logo 上传、会员模板、去品牌",
    costPoints: 500,
    rewardType: "member_trial",
    rewardValue: 3,
    enabled: true,
    sortOrder: 11,
  },
  {
    code: "member_7day",
    name: "会员体验券 ×7天",
    description: "7 天会员体验：签到双倍积分、Logo 上传、会员模板、去品牌",
    costPoints: 1000,
    rewardType: "member_trial",
    rewardValue: 7,
    enabled: true,
    sortOrder: 12,
  },
  {
    code: "no_branding_1x",
    name: "去品牌体验券 ×1",
    description: "1 次去除导出文档品牌水印",
    costPoints: 30,
    rewardType: "no_branding_coupon",
    rewardValue: 1,
    enabled: false,
    sortOrder: 20,
  },
];

async function main() {
  console.log("开始同步 RewardItem 数据...");

  for (const item of REWARD_ITEMS) {
    const existing = await prisma.rewardItem.findUnique({
      where: { code: item.code },
    });

    if (existing) {
      // Update existing (ensure enabled status is current)
      await prisma.rewardItem.update({
        where: { code: item.code },
        data: {
          name: item.name,
          description: item.description,
          costPoints: item.costPoints,
          rewardType: item.rewardType,
          rewardValue: item.rewardValue,
          enabled: item.enabled,
          sortOrder: item.sortOrder,
        },
      });
      console.log(`  ✅ 更新: ${item.code} (${item.name})`);
    } else {
      // Create new
      await prisma.rewardItem.create({ data: item });
      console.log(`  ✅ 创建: ${item.code} (${item.name})`);
    }
  }

  // Verify
  const all = await prisma.rewardItem.findMany({
    orderBy: { sortOrder: "asc" },
    select: { code: true, name: true, costPoints: true, rewardType: true, rewardValue: true, enabled: true },
  });

  console.log("\n最终 RewardItem 列表:");
  all.forEach((r) => {
    console.log(`  ${r.code} | ${r.name} | ${r.costPoints}分 | ${r.rewardType} | ×${r.rewardValue} | ${r.enabled ? "开放" : "关闭"}`);
  });
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
