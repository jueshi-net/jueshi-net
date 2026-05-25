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
  const all = await prisma.resource.findMany({
    select: { id: true, url: true, name: true },
  });

  const urlMap: Record<string, any[]> = {};
  for (const r of all) {
    if (!urlMap[r.url]) urlMap[r.url] = [];
    urlMap[r.url].push(r);
  }

  let dupCount = 0;
  for (const [url, items] of Object.entries(urlMap)) {
    if (items.length > 1) {
      console.log(`Duplicate: ${url} (${items.length} entries)`);
      for (let i = 1; i < items.length; i++) {
        console.log(`  Deleting: ${items[i].id} - ${items[i].name}`);
        await prisma.resource.delete({ where: { id: items[i].id } });
        dupCount++;
      }
    }
  }
  console.log(`Cleaned ${dupCount} duplicates`);
  await prisma.$disconnect();
}

main().catch(console.error);
