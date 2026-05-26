// Seed reward items for points redemption system
// Run: npx tsx prisma/seed-rewards.ts

import { prisma } from "../src/lib/prisma";

const rewardItems = [
  {
    code: "word_export_1x",
    name: "Word 导出次数券 ×1",
    description: "兑换后可额外导出 1 次 Word 文档",
    costPoints: 50,
    rewardType: "word_export_coupon",
    rewardValue: 1,
    enabled: true,
    sortOrder: 1,
  },
  {
    code: "word_export_3x",
    name: "Word 导出次数券 ×3",
    description: "兑换后可额外导出 3 次 Word 文档",
    costPoints: 120,
    rewardType: "word_export_coupon",
    rewardValue: 3,
    enabled: true,
    sortOrder: 2,
  },
  {
    code: "member_1day",
    name: "会员体验券 ×1天",
    description: "兑换后获得 1 天会员体验（需后台确认生效）",
    costPoints: 200,
    rewardType: "member_trial",
    rewardValue: 1,
    enabled: false, // 暂未开放
    sortOrder: 3,
  },
  {
    code: "no_branding_1x",
    name: "去品牌体验券 ×1",
    description: "兑换后获得 1 次去品牌导出权益",
    costPoints: 30,
    rewardType: "no_branding_coupon",
    rewardValue: 1,
    enabled: false, // coming soon
    sortOrder: 4,
  },
];

async function main() {
  console.log("Seeding reward items...");

  for (const item of rewardItems) {
    const existing = await prisma.rewardItem.findUnique({
      where: { code: item.code },
    });
    if (existing) {
      console.log(`  ⏭️  ${item.code} already exists`);
      continue;
    }
    await prisma.rewardItem.create({ data: item });
    console.log(`  ✅ Created: ${item.code} (${item.name}) - ${item.costPoints}pts`);
  }

  console.log("Done.");
  await prisma.$disconnect();
}

main().catch(console.error);
