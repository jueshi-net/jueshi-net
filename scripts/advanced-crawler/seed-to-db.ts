// 数据库自动装填 - 将清洗后的高优数据注入生产库
// 使用 Prisma upsert 模式：存在则更新，不存在则创建

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../../.env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";

// 支持两种运行模式
function getDbUrl(): string {
  // 优先使用生产库（带 --prod 参数）
  if (process.argv.includes("--prod")) {
    return (
      process.env.DATABASE_URL ||
      "postgresql://bxb_user:Bxb2024!Prod@Secure@127.0.0.1:5432/bxb_prod?schema=public"
    );
  }
  // 默认本地 Neon（开发测试用）
  return (
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_eL9DhSpQHZ5a@ep-morning-sun-amgb7w40-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
  );
}

interface SeedResource {
  url: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  favicon?: string | null;
  domainAge?: number | null;
  qualityScore?: number;
  language?: string;
  sourceType?: string;
}

async function main() {
  const dbUrl = getDbUrl();
  const isProd = process.argv.includes("--prod");

  console.log(
    `🗄️  连接数据库: ${isProd ? "生产库 (bxb_prod)" : "Neon 开发库"}`
  );

  const adapter = new PrismaPg({ connectionString: dbUrl });
  const prisma = new PrismaClient({ adapter });

  // 从本地 JSON 文件读取数据
  const seedFile = path.join(
    __dirname,
    "../../prisma/seeds/resources-crawler-output.json"
  );

  if (!fs.existsSync(seedFile)) {
    console.error(`❌ 找不到种子文件: ${seedFile}`);
    console.error("请先运行高级爬虫流水线生成数据。");
    process.exit(1);
  }

  const resources: SeedResource[] = JSON.parse(fs.readFileSync(seedFile, "utf-8"));
  console.log(`📦 加载 ${resources.length} 条待入库数据\n`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const r of resources) {
    try {
      const result = await prisma.resource.upsert({
        where: { url: r.url },
        create: {
          url: r.url,
          name: r.name,
          description: r.description,
          category: r.category,
          tags: r.tags || [],
          favicon: r.favicon || null,
          domainAge: r.domainAge || null,
          qualityScore: r.qualityScore || 0,
          language: r.language || "en",
          sourceType: r.sourceType || "third-party",
          isActive: true,
        },
        update: {
          name: r.name,
          description: r.description,
          category: r.category,
          tags: r.tags || [],
          favicon: r.favicon || undefined,
          qualityScore: r.qualityScore || undefined,
          domainAge: r.domainAge || undefined,
        },
      });

      // 检查是否是新创建还是更新
      const existing = await prisma.resource.findUnique({
        where: { url: r.url },
        select: { createdAt: true },
      });

      // upsert 返回结果中无法直接区分 create/update，用 createdAt 判断
      // 简单统计
      updated++;
      console.log(`  ✅ ${r.name} (${r.category})`);
    } catch (err: any) {
      console.error(`  ❌ ${r.name}: ${err.message}`);
      skipped++;
    }
  }

  console.log(`\n📊 入库完成: 更新/创建 ${updated} 条, 跳过 ${skipped} 条`);

  // 统计当前库状态
  const total = await prisma.resource.count();
  const active = await prisma.resource.count({ where: { isActive: true } });
  const byCategory = await prisma.resource.groupBy({
    by: ["category"],
    _count: true,
  });

  console.log(`\n📈 当前资源库状态:`);
  console.log(`  总数: ${total} | 活跃: ${active}`);
  console.log(`  分类分布:`);
  for (const c of byCategory) {
    console.log(`    ${c.category}: ${c._count}`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("致命错误:", err);
  process.exit(1);
});
