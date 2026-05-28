import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";

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
  console.log("⚠️ 正在清空 hs_codes 表...");
  const count = await prisma.hSCode.deleteMany({});
  console.log(`✅ 清空完成，共删除 ${count.count} 条 Mock 数据。`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
