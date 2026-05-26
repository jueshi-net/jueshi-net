import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  const count = await prisma.resource.count({ where: { sourceType: "third-party" } });
  const active = await prisma.resource.count({ where: { isActive: true } });
  const newToday = await prisma.resource.count({
    where: {
      sourceType: "third-party",
      createdAt: { gte: new Date(Date.now() - 3600000) }, // last hour
    },
  });

  console.log(`📊 数据库状态:`);
  console.log(`  third-party 资源: ${count}`);
  console.log(`  活跃资源总计: ${active}`);
  console.log(`  最近1小时新增: ${newToday}`);

  // 最近入库的 10 条
  const recent = await prisma.resource.findMany({
    where: { sourceType: "third-party" },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { name: true, category: true, description: true, qualityScore: true },
  });

  console.log(`\n🆕 最近入库的 10 条:`);
  recent.forEach((r, i) => {
    console.log(`  ${i + 1}. [${r.category}] ⭐${r.qualityScore} ${r.name}`);
    console.log(`     ${r.description}`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);
