import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import 'dotenv/config';

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const p = new PrismaClient({ adapter });

(async () => {
  const toolView = await p.eventLog.count({ where: { eventType: "Tool_View" } });
  const toolClick = await p.eventLog.count({ where: { eventType: "Tool_Click" } });
  const unknown = await p.eventLog.count({ where: { eventType: "unknown" } });
  const docSave = await p.eventLog.count({ where: { eventType: "Document_Save" } });
  const favTool = await p.eventLog.count({ where: { eventType: "Favorite_Tool" } });
  const otherTypes = await p.eventLog.groupBy({
    by: ["eventType"],
    _count: { eventType: true }
  });
  
  console.log("Event type distribution:");
  for (const t of otherTypes.sort((a, b) => b._count.eventType - a._count.eventType)) {
    console.log(`  ${t.eventType}: ${t._count.eventType}`);
  }
  console.log(`\nTool_View: ${toolView}, Tool_Click: ${toolClick}, unknown: ${unknown}`);
  
  // Show latest 3 non-checklist events
  const latest = await p.eventLog.findMany({
    where: { NOT: { eventType: { contains: "checklist" } } },
    orderBy: { createdAt: "desc" },
    take: 3
  });
  console.log("\nLatest non-checklist events:");
  for (const e of latest) {
    const act = (e.action || "").substring(0, 100);
    console.log(`  eventType: ${e.eventType} | action: ${act} | path: ${e.path}`);
  }
  await p.$disconnect();
})()
