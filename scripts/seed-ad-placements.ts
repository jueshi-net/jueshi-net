/**
 * Seed basic ad placement keys.
 * Usage: NODE_ENV=production npx tsx scripts/seed-ad-placements.ts
 * 
 * This script is idempotent — it will not create duplicates.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PLACEMENTS = [
  // 首页
  { key: "home.hero_below", name: "首页首屏下方", pageType: "home", zone: "hero_below", device: "all", description: "首页 Hero 区域正下方横幅位" },
  { key: "home.mid_card", name: "首页中部卡片", pageType: "home", zone: "content_mid", device: "all", description: "首页内容区块中间推荐卡片" },
  { key: "home.footer_banner", name: "首页底部通栏", pageType: "home", zone: "footer", device: "all", description: "首页 Footer 上方通栏横幅" },
  // 工具页
  { key: "tool.result_below", name: "工具结果区下方", pageType: "tool", zone: "result_below", device: "all", description: "工具操作结果展示区下方推荐位" },
  { key: "tool.sidebar_desktop", name: "工具页右侧栏", pageType: "tool", zone: "sidebar", device: "desktop", description: "桌面端工具页右侧推荐栏" },
  { key: "tool.footer_banner", name: "工具页底部横幅", pageType: "tool", zone: "footer", device: "all", description: "工具页底部通栏" },
  // 文章页
  { key: "article.inline_mid", name: "文章正文中插入", pageType: "article", zone: "content_mid", device: "all", description: "文章正文中间插入位（每3段）" },
  { key: "article.sidebar_desktop", name: "文章页右侧栏", pageType: "article", zone: "sidebar", device: "desktop", description: "桌面端文章页右侧推荐栏" },
  { key: "article.footer_recommend", name: "文章页底部推荐", pageType: "article", zone: "footer", device: "all", description: "文章底部推荐区" },
  // 专题页
  { key: "topic.item_between", name: "专题项之间", pageType: "topic", zone: "content_mid", device: "all", description: "专题推荐项之间插入位" },
  { key: "topic.footer_recommend", name: "专题页底部推荐", pageType: "topic", zone: "footer", device: "all", description: "专题底部推荐区" },
  // 落地页
  { key: "landing.hero_below", name: "落地页Hero下方", pageType: "landing", zone: "hero_below", device: "all", description: "落地页 Hero 区域下方" },
  { key: "landing.block_between", name: "落地页内容区块间", pageType: "landing", zone: "content_mid", device: "all", description: "落地页内容区块之间" },
  { key: "landing.cta_side", name: "落地页CTA旁", pageType: "landing", zone: "native_card", device: "all", description: "落地页 CTA 按钮旁侧推荐" },
  // 黄页页
  { key: "yellowpage.list_top", name: "黄页列表顶部", pageType: "yellowpage", zone: "hero_below", device: "all", description: "黄页商家列表顶部推荐位" },
  { key: "yellowpage.detail_sidebar", name: "黄页详情页侧栏", pageType: "yellowpage", zone: "sidebar", device: "desktop", description: "黄页详情页桌面端侧栏" },
  // 任务链页
  { key: "task.step_between", name: "任务链步骤间", pageType: "task", zone: "content_mid", device: "all", description: "任务链步骤之间插入位" },
  { key: "task.complete_recommend", name: "任务链完成页推荐", pageType: "task", zone: "footer", device: "all", description: "任务链完成页底部推荐" },
  // 工作台
  { key: "workspace.light_recommend", name: "工作台轻量推荐", pageType: "workspace", zone: "native_card", device: "all", description: "工作台非打断式推荐卡片" },
];

async function main() {
  let created = 0;
  let skipped = 0;

  for (const p of PLACEMENTS) {
    const existing = await prisma.adPlacement.findUnique({ where: { key: p.key } });
    if (existing) {
      skipped++;
      console.log(`  ⏭  ${p.key} (已存在)`);
    } else {
      await prisma.adPlacement.create({ data: p });
      created++;
      console.log(`  ✅ ${p.key}`);
    }
  }

  console.log(`\n完成: 创建 ${created} 个，跳过 ${skipped} 个`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
