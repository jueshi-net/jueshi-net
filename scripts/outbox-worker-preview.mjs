/**
 * Outbox Worker - Preview Environment
 *
 * Processes PENDING outbox entries every 5 seconds.
 * PM2_NAME=xixiong-service-provider-worker-preview
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) { console.error("DATABASE_URL is not set"); process.exit(1); }
const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

const POLL_INTERVAL_MS = 5000;
const BATCH_SIZE = 10;

async function processOutboxBatch() {
  try {
    // Find PENDING entries (snake_case column names in domain_event_outbox table)
    const entries = await prisma.$queryRaw`
      SELECT * FROM "domain_event_outbox"
      WHERE status = 'PENDING'
      ORDER BY created_at ASC
      LIMIT ${BATCH_SIZE}
    `;

    if (entries.length === 0) return;

    for (const entry of entries) {
      // Atomically mark as PROCESSING
      const updated = await prisma.$executeRaw`
        UPDATE "domain_event_outbox"
        SET status = 'PROCESSING', processed_at = NOW()
        WHERE event_id = ${entry.event_id} AND status = 'PENDING'
      `;

      if (updated === 0) continue;

      try {
        const payload = JSON.parse(entry.payload_json);
        console.log(`[Worker] Processing: ${entry.event_type} (${entry.event_id})`);

        // Write to event_logs (camelCase columns in event_logs table)
        try {
          await prisma.$executeRaw`
            INSERT INTO "event_logs" ("id", "eventType", "action", "metadata", "createdAt")
            VALUES (gen_random_uuid(), ${entry.event_type}, 'service-provider', ${entry.payload_json}::jsonb, NOW())
          `;
        } catch (e) {
          // event_logs insert failure is non-fatal
        }

        // Mark as PROCESSED
        await prisma.$executeRaw`
          UPDATE "domain_event_outbox"
          SET status = 'PROCESSED', processed_at = NOW()
          WHERE event_id = ${entry.event_id}
        `;
        console.log(`[Worker] Processed: ${entry.event_type} -> PROCESSED`);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        await prisma.$executeRaw`
          UPDATE "domain_event_outbox"
          SET status = 'FAILED', last_error = ${errorMsg}
          WHERE event_id = ${entry.event_id}
        `;
        console.error(`[Worker] Failed: ${entry.event_type} - ${errorMsg}`);
      }
    }
  } catch (err) {
    console.error("[Worker] Batch error:", err.message);
  }
}

console.log(`[Worker] Started. Polling every ${POLL_INTERVAL_MS}ms. DB=${dbUrl.split("/").pop()}`);
processOutboxBatch();
setInterval(processOutboxBatch, POLL_INTERVAL_MS);
process.on("SIGTERM", async () => { console.log("[Worker] Shutting down..."); await prisma.$disconnect(); process.exit(0); });
