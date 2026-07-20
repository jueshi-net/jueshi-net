/**
 * Outbox Worker - Preview Environment
 *
 * Runs continuously, processing PENDING outbox entries every 5 seconds.
 * Used in the isolated preview environment to demonstrate the full
 * Inquiry -> Outbox -> Worker -> Event Bus -> EventLog flow.
 *
 * PM2_NAME=xixiong-service-provider-worker-preview
 *
 * Usage:
 *   DATABASE_URL=... node scripts/outbox-worker-preview.mjs
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

const POLL_INTERVAL_MS = 5000;
const BATCH_SIZE = 10;

// Simple in-memory event log for preview (no external event bus needed)
const eventLog = [];

async function processOutboxBatch() {
  try {
    // Find PENDING entries
    const entries = await prisma.$queryRaw`
      SELECT * FROM "domain_event_outbox"
      WHERE status = 'PENDING'
      ORDER BY "createdAt" ASC
      LIMIT ${BATCH_SIZE}
    `;

    if (entries.length === 0) return;

    for (const entry of entries) {
      // Atomically mark as PROCESSING
      const updated = await prisma.$executeRaw`
        UPDATE "domain_event_outbox"
        SET status = 'PROCESSING', "processedAt" = NOW()
        WHERE "eventId" = ${entry.eventId} AND status = 'PENDING'
      `;

      if (updated === 0) continue; // Someone else grabbed it

      try {
        const payload = JSON.parse(entry.payloadJson);

        // Log the event (preview EventLog)
        console.log(`[Worker] Processing event: ${entry.eventType} (${entry.eventId})`);

        // Write to EventLog if table exists
        try {
          await prisma.$executeRaw`
            INSERT INTO "EventLog" ("id", "eventType", "module", "payload", "createdAt")
            VALUES (gen_random_uuid(), ${entry.eventType}, 'service-provider', ${entry.payloadJson}::jsonb, NOW())
          `;
        } catch (e) {
          // EventLog table might not exist in preview - that's OK
        }

        // Mark as PROCESSED
        await prisma.$executeRaw`
          UPDATE "domain_event_outbox"
          SET status = 'PROCESSED', "processedAt" = NOW()
          WHERE "eventId" = ${entry.eventId}
        `;

        console.log(`[Worker] Processed: ${entry.eventType} -> PROCESSED`);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        await prisma.$executeRaw`
          UPDATE "domain_event_outbox"
          SET status = 'FAILED', "errorMessage" = ${errorMsg}
          WHERE "eventId" = ${entry.eventId}
        `;
        console.error(`[Worker] Failed: ${entry.eventType} - ${errorMsg}`);
      }
    }
  } catch (err) {
    console.error("[Worker] Batch error:", err.message);
  }
}

console.log(`[Worker] Started. Polling every ${POLL_INTERVAL_MS}ms. DB=${dbUrl.split("/").pop()}`);

// Run immediately, then on interval
processOutboxBatch();
setInterval(processOutboxBatch, POLL_INTERVAL_MS);

// Keep alive
process.on("SIGTERM", async () => {
  console.log("[Worker] Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});
