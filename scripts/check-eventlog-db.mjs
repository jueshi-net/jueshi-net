import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import 'dotenv/config';

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const p = new PrismaClient({ adapter });

const label = process.argv[2] || "CHECK";

(async () => {
  const total = await p.eventLog.count();
  const cl = await p.eventLog.count({ where: { eventType: { contains: "checklist" } } });
  const clAction = await p.eventLog.count({ where: { action: { contains: "checklist" } } });
  console.log(`${label} total:`, total);
  console.log(`${label} checklist in eventType:`, cl);
  console.log(`${label} checklist in action:`, clAction);
  
  if (cl > 0 || clAction > 0) {
    const latest = await p.eventLog.findMany({
      where: {
        OR: [
          { eventType: { contains: "checklist" } },
          { action: { contains: "checklist" } }
        ]
      },
      orderBy: { createdAt: "desc" },
      take: 10
    });
    console.log(`\nLatest checklist events:`);
    for (const e of latest) {
      console.log(`  id: ${e.id}`);
      console.log(`  eventType: ${e.eventType}`);
      console.log(`  action: ${(e.action || "").substring(0, 120)}`);
      console.log(`  path: ${e.path}`);
      console.log(`  toolName: ${e.toolName}`);
      console.log(`  sessionId: ${e.sessionId}`);
      console.log(`  createdAt: ${e.createdAt.toISOString()}`);
      console.log(`  ---`);
    }
  }
  await p.$disconnect();
})()
