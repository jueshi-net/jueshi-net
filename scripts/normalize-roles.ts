import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env") });

const isProd = process.argv.includes("--prod");
const dbUrl = isProd
  ? "postgresql://bxb_user:Bxb2024!Prod@Secure@127.0.0.1:5432/bxb_prod?schema=public"
  : (process.env.DATABASE_URL || "postgresql://neondb_owner:npg_eL9DhSpQHZ5a@ep-morning-sun-amgb7w40-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true");

const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(`DB: ${isProd ? "生产库" : "Neon 开发库"}`);

  // Show current distribution
  const before = await prisma.user.groupBy({ by: ["role"], _count: true });
  console.log("Before:", JSON.stringify(before));

  // Normalize all roles to "管理员"
  const result = await prisma.user.updateMany({
    where: { role: { in: ["ADMIN", "admin", "USER"] } },
    data: { role: "管理员" },
  });

  console.log(`Updated ${result.count} users to "管理员"`);

  // Verify
  const after = await prisma.user.groupBy({ by: ["role"], _count: true });
  console.log("After:", JSON.stringify(after));

  await prisma.$disconnect();
}

main().catch(console.error);
