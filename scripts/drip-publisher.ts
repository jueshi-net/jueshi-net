// Drip-Feed Publisher — 每日从 draft 中随机抽取 1-2 篇发布
// 用法: npx tsx scripts/drip-publisher.ts
// 设计意图: 模拟真人日更频率，培养 Google 爬虫抓取习惯

import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";

// Load env
if (existsSync(resolve(__dirname, "../.env.production"))) {
  config({ path: resolve(__dirname, "../.env.production") });
} else {
  config({ path: resolve(__dirname, "../.env") });
}

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("═══════════════════════════════════════");
  console.log("📰 滴灌发布引擎启动 | " + new Date().toISOString());
  console.log("═══════════════════════════════════════");

  // 1. 统计草稿总数
  const totalDrafts = await prisma.article.count({ where: { status: "draft" } });
  console.log(`📊 当前草稿池: ${totalDrafts} 篇`);

  if (totalDrafts === 0) {
    console.log("✅ 无待发布文章，跳过本次执行。");
    process.exit(0);
  }

  // 2. 决定发布数量 (1 或 2)
  const count = Math.min(totalDrafts, Math.random() < 0.5 ? 1 : 2);
  console.log(`🎲 本次随机抽取: ${count} 篇`);

  // 3. 随机抽取 draft 文章 (Prisma 不支持 random(), 用 skip 模拟)
  const skip = Math.floor(Math.random() * totalDrafts);
  const articles = await prisma.article.findMany({
    where: { status: "draft" },
    orderBy: { createdAt: "asc" }, // 确保顺序稳定
    skip,
    take: count,
    select: { id: true, title: true, slug: true },
  });

  // 边界处理：如果 skip + count > total，补取
  if (articles.length < count) {
    const more = await prisma.article.findMany({
      where: { status: "draft" },
      orderBy: { createdAt: "asc" },
      take: count - articles.length,
      select: { id: true, title: true, slug: true },
    });
    articles.push(...more);
  }

  // 4. 执行发布
  const now = new Date();
  for (const art of articles) {
    await prisma.article.update({
      where: { id: art.id },
      data: { status: "published", publishedAt: now },
    });
    console.log(`✅ 已发布: [${art.slug}] ${art.title}`);
  }

  console.log("\n🎉 滴灌发布完成！下次执行时间: 明日 10:00");
  console.log("═══════════════════════════════════════");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("💥 滴灌引擎失败:", e);
  process.exit(1);
});
