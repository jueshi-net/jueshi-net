/**
 * Seed default AdSlot placements for v1.19.4
 * 
 * Usage: npx tsx scripts/seed-ad-slots.ts
 * 
 * Creates default ad placement slots in the ad_slots table.
 * Each slot is created with isActive=false by default (ads disabled until admin enables).
 * Skips existing placements (name is unique).
 */

import { prisma } from "../src/lib/prisma";

const DEFAULT_SLOTS = [
  {
    name: "home-after-tools",
    position: "home-after-tools",
    description: "首页工具列表下方",
  },
  {
    name: "home-before-footer",
    position: "home-before-footer",
    description: "首页底部之前（footer 上方）",
  },
  {
    name: "tool-bottom",
    position: "tool-bottom",
    description: "工具页底部",
  },
  {
    name: "sidebar",
    position: "sidebar",
    description: "侧边栏广告位",
  },
  {
    name: "article-bottom",
    position: "article-bottom",
    description: "文章详情页底部（/guides/[slug] 末尾）",
  },
];

async function main() {
  let created = 0;
  let skipped = 0;

  for (const slot of DEFAULT_SLOTS) {
    const existing = await prisma.adSlot.findUnique({
      where: { name: slot.name },
    });
    if (existing) {
      console.log(`  ⏭  ${slot.name} 已存在，跳过`);
      skipped++;
      continue;
    }

    await prisma.adSlot.create({
      data: {
        name: slot.name,
        position: slot.position,
        type: "image",
        isActive: false, // 默认关闭，admin 需要时手动开启
        startDate: new Date(),
        endDate: null,
      },
    });
    console.log(`  ✅ ${slot.name} 已创建 (${slot.description})`);
    created++;
  }

  console.log(`\n完成: ${created} 个已创建, ${skipped} 个已跳过`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
