// 一次性资源导入脚本 — 从 processed-urls.txt 批量 Upsert 到 resources 表
// 用法: npx tsx scripts/import-resources.ts [--prod]
// 逻辑: 读取已爬取 URL，若 DB 中不存在则插入默认分类，存在则更新 isActive=true

import { config } from "dotenv";
import { resolve } from "path";
import { existsSync, readFileSync } from "fs";

if (existsSync(resolve(__dirname, "../.env.production"))) {
  config({ path: resolve(__dirname, "../.env.production") });
} else {
  config({ path: resolve(__dirname, "../.env") });
}

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const PROCESSED_FILE = resolve(__dirname, "advanced-crawler/processed-urls.txt");

async function main() {
  console.log("═══════════════════════════════════════");
  console.log("📥 网址导航数据归位脚本启动");
  console.log("═══════════════════════════════════════");

  if (!existsSync(PROCESSED_FILE)) {
    console.error("❌ 找不到已处理 URL 文件:", PROCESSED_FILE);
    process.exit(1);
  }

  const urls = readFileSync(PROCESSED_FILE, "utf-8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("http"));

  console.log(`📊 待核对 URL 总数: ${urls.length}`);

  let upserted = 0;
  let skipped = 0;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const domain = new URL(url).hostname.replace("www.", "");
    
    // 智能分类映射
    let category = "tools";
    const tags: string[] = [];
    if (/post|mail|ship|logistic|fedex|ups|dhl|usps|royalmail/i.test(url)) {
      category = "logistics"; tags.push("物流", "快递");
    } else if (/tax|irs|gov|visa|immigration/i.test(url)) {
      category = "business"; tags.push("政务", "签证");
    } else if (/shop|amazon|ebay|store|product/i.test(url)) {
      category = "business"; tags.push("电商", "购物");
    } else if (/travel|flight|hotel|airbnb|booking/i.test(url)) {
      category = "life"; tags.push("旅行", "住宿");
    }

    try {
      await prisma.resource.upsert({
        where: { url },
        update: { isActive: true, updatedAt: new Date() },
        create: {
          name: domain,
          url,
          description: `${domain} - 跨境出海实用工具`,
          category,
          tags,
          sourceType: "third-party",
          isActive: true,
          qualityScore: 50,
          language: "en",
        },
      });
      upserted++;
    } catch (e: any) {
      if (e.code === "P2002") {
        skipped++; // 唯一约束冲突，已存在
      } else {
        console.error(`  ⚠️ 失败: ${url} - ${e.message}`);
      }
    }

    if ((i + 1) % 50 === 0) console.log(`  进度: ${i + 1}/${urls.length}`);
  }

  console.log(`\n✅ 导入完成: 新增/更新 ${upserted} 条, 跳过 ${skipped} 条 (已存在)`);
  const finalCount = await prisma.resource.count({ where: { isActive: true } });
  console.log(`📈 当前 resources 表活跃总数: ${finalCount}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("💥 导入失败:", e);
  process.exit(1);
});
