import { prisma } from "../src/lib/prisma";

async function main() {
  // Check ALL recent drafts
  const allDrafts = await prisma.toolDocumentDraft.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, title: true, toolKey: true, userId: true, createdAt: true },
  });
  
  console.log("=== All Recent Drafts ===");
  for (const d of allDrafts) {
    console.log(`ID: ${d.id} | toolKey: ${d.toolKey} | userId: ${d.userId} | title: ${d.title} | ${d.createdAt}`);
  }
  
  if (allDrafts.length === 0) {
    console.log("No drafts at all!");
  }
  
  // Check quote_sheet drafts
  const drafts = await prisma.toolDocumentDraft.findMany({
    where: { toolKey: "quote_sheet" },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      toolKey: true,
      createdAt: true,
      dataJson: true,
    },
  });
  
  console.log("\n=== Quote Sheet Drafts ===");
  for (const d of drafts) {
    console.log(`ID: ${d.id}`);
    console.log(`Title: ${d.title}`);
    console.log(`Created: ${d.createdAt}`);
    const hasQS = d.dataJson?.includes("QS-");
    console.log(`Has QS-VERIFY: ${hasQS}`);
    console.log("---");
  }
  
  if (drafts.length === 0) {
    console.log("No quote_sheet drafts found!");
  }
  
  // Also check event_logs for quote-sheet related events
  const events = await prisma.eventLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, eventType: true, action: true, path: true, createdAt: true },
  });
  console.log("\n=== Recent Events (quote-sheet) ===");
  const qsEvents = events.filter(e => 
    e.action?.includes("quote") || e.path?.includes("quote")
  );
  for (const e of qsEvents) {
    console.log(`${e.eventType} - ${e.action} - ${e.path} - ${e.createdAt}`);
  }
  if (qsEvents.length === 0) {
    console.log("No quote-sheet events in last 10");
    // Show all recent events
    for (const e of events) {
      console.log(`${e.eventType} - ${e.action} - ${e.path} - ${e.createdAt}`);
    }
  }
  
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
