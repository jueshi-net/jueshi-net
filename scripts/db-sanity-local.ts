import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("=== Tables with 'metric' ===");
  const tables = await prisma.$queryRawUnsafe<Array<{table_name: string}>>(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%metric%' ORDER BY table_name"
  );
  console.log(JSON.stringify(tables, null, 2));

  console.log("\n=== Tables with 'tool' ===");
  const toolTables = await prisma.$queryRawUnsafe<Array<{table_name: string}>>(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%tool%' ORDER BY table_name"
  );
  console.log(JSON.stringify(toolTables, null, 2));

  console.log("\n=== ToolMetricDaily via Prisma ===");
  try {
    const metrics = await (prisma as any).toolMetricDaily.findMany({ 
      where: { toolSlug: "quote-sheet" }, 
      take: 5,
      orderBy: { date: "desc" }
    });
    console.log("Count:", metrics.length);
    console.log(JSON.stringify(metrics, null, 2));
  } catch (e: any) {
    console.log("Error:", e.message);
  }

  console.log("\n=== ToolDocumentDrafts (quote_sheet) ===");
  try {
    const drafts = await (prisma as any).toolDocumentDraft.findMany({ 
      where: { toolKey: "quote_sheet" }, 
      take: 5,
      orderBy: { createdAt: "desc" }
    });
    console.log("Count:", drafts.length);
    drafts.forEach((d: any) => {
      console.log(`  ${d.id} | title=${d.title} | createdAt=${d.createdAt}`);
      if (d.dataJson) {
        const data = typeof d.dataJson === 'string' ? JSON.parse(d.dataJson) : d.dataJson;
        console.log(`    clientName=${data?.clientName}, companyName=${data?.companyName}`);
      }
    });
  } catch (e: any) {
    console.log("Error:", e.message);
  }

  console.log("\n=== EventLog ===");
  try {
    const events = await (prisma as any).eventLog.findMany({ 
      where: { eventType: { in: ["Document_Save", "Document_Export", "Tool_View"] } },
      take: 10,
      orderBy: { createdAt: "desc" }
    });
    console.log("Count:", events.length);
    events.forEach((e: any) => {
      console.log(`  ${e.eventType} | toolSlug=${e.toolSlug} | metadata=${JSON.stringify(e.metadata)?.slice(0,100)} | ${e.createdAt}`);
    });
  } catch (e: any) {
    console.log("Error:", e.message);
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
