/**
 * Outbox Worker - Preview Environment
 *
 * Processes PENDING outbox entries every 5 seconds.
 * PM2_NAME=xixiong-service-provider-worker-preview
 *
 * Full chain: Outbox -> EventLog -> Notification Adapter -> PROCESSED
 * If either EventLog or Notification Adapter fails, the entry is retried
 * with exponential backoff. Only marked PROCESSED when both succeed.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) { console.error("DATABASE_URL is not set"); process.exit(1); }
const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

const POLL_INTERVAL_MS = 3000;
const BATCH_SIZE = 10;
const MAX_ATTEMPTS = 5;

/**
 * Write an EventLog entry for the outbox event.
 * Uses the event_logs table with:
 *   eventType = outbox event_type
 *   toolName  = "service-provider"
 *   action    = outbox event_id (for matching)
 *   path      = aggregate_id
 */
async function writeEventLog(entry) {
  await prisma.$executeRaw`
    INSERT INTO "event_logs" (id, "eventType", "toolName", action, path, "createdAt")
    VALUES (gen_random_uuid(), ${entry.event_type}, 'service-provider', ${entry.event_id}, ${entry.aggregate_id}, NOW())
  `;
}

/**
 * Call the notification adapter for the outbox event.
 * Writes a notification log entry to event_logs with:
 *   eventType = outbox event_type
 *   toolName  = "notification-adapter"
 *   action    = outbox event_id (for matching)
 *   path      = aggregate_id
 *
 * This simulates the notification adapter receiving the event.
 */
async function callNotificationAdapter(entry) {
  const payload = JSON.parse(entry.payload_json);
  // Simulate notification adapter processing
  // In production this would send an email/push notification to the provider
  await prisma.$executeRaw`
    INSERT INTO "event_logs" (id, "eventType", "toolName", action, path, "createdAt", "userId")
    VALUES (gen_random_uuid(), ${entry.event_type}, 'notification-adapter', ${entry.event_id}, ${entry.aggregate_id}, NOW(), ${payload.requesterUserId || null})
  `;
}

async function processOutboxBatch() {
  try {
    // Find PENDING entries ordered by creation time
    const entries = await prisma.$queryRaw`
      SELECT * FROM "domain_event_outbox"
      WHERE status = 'PENDING'
      AND "available_at" <= NOW()
      ORDER BY "created_at" ASC
      LIMIT ${BATCH_SIZE}
    `;

    if (entries.length === 0) return;

    for (const entry of entries) {
      // Atomically mark as PROCESSING (only if still PENDING)
      const updated = await prisma.$executeRaw`
        UPDATE "domain_event_outbox"
        SET status = 'PROCESSING', "updated_at" = NOW()
        WHERE event_id = ${entry.event_id} AND status = 'PENDING'
      `;

      if (updated === 0) continue;

      try {
        console.log(`[Worker] Processing: ${entry.event_type} (${entry.event_id})`);

        // Step 1: Write EventLog (MUST succeed)
        await writeEventLog(entry);
        console.log(`[Worker] EventLog written: ${entry.event_id}`);

        // Step 2: Call Notification Adapter (MUST succeed)
        await callNotificationAdapter(entry);
        console.log(`[Worker] Notification adapter called: ${entry.event_id}`);

        // Step 3: Both succeeded -> mark PROCESSED
        await prisma.$executeRaw`
          UPDATE "domain_event_outbox"
          SET status = 'PROCESSED', "processed_at" = NOW(), "updated_at" = NOW(), last_error = NULL
          WHERE event_id = ${entry.event_id}
        `;
        console.log(`[Worker] Processed: ${entry.event_type} -> PROCESSED`);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        const attempts = (entry.attempts || 0) + 1;
        const isFinalFailure = attempts >= MAX_ATTEMPTS;
        const backoffMs = Math.pow(2, attempts) * 1000;
        const availableAt = new Date(Date.now() + backoffMs);

        await prisma.$executeRaw`
          UPDATE "domain_event_outbox"
          SET status = ${isFinalFailure ? 'FAILED' : 'PENDING'},
              attempts = ${attempts},
              last_error = ${errorMsg.substring(0, 2000)},
              "available_at" = ${availableAt},
              "updated_at" = NOW()
          WHERE event_id = ${entry.event_id}
        `;

        if (isFinalFailure) {
          console.error(`[Worker] FAILED (max attempts): ${entry.event_type} (${entry.event_id}) - ${errorMsg}`);
        } else {
          console.error(`[Worker] Retry ${attempts}/${MAX_ATTEMPTS}: ${entry.event_type} (${entry.event_id}) - ${errorMsg}`);
        }
      }
    }
  } catch (err) {
    console.error("[Worker] Batch error:", err.message);
  }
}

console.log(`[Worker] Started. Polling every ${POLL_INTERVAL_MS}ms. DB=${dbUrl.split("/").pop()}`);

// Process immediately on startup
processOutboxBatch();
setInterval(processOutboxBatch, POLL_INTERVAL_MS);

process.on("SIGTERM", async () => {
  console.log("[Worker] Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("[Worker] Interrupted, shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});
