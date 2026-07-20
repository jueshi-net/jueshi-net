/**
 * Outbox Worker — processes PENDING outbox entries by publishing them
 * to the platform event bus.
 *
 * Flow:
 *   1. Read PENDING entries (batch)
 *   2. For each: mark PROCESSING (atomically, only if still PENDING)
 *   3. Publish to platform event bus via publishEvent()
 *   4. Mark PROCESSED on success, mark FAILED (with retry) on error
 *
 * Idempotency: eventId is unique. If publishEvent is called twice for
 * the same eventId, subscribers must handle dedup.
 */
import { findPendingOutbox, markProcessing, markProcessed, markFailed } from "./outbox-repository";
import { publishEvent } from "@/platform";

export interface OutboxProcessResult {
  processed: number;
  failed: number;
  skipped: number;
}

/**
 * Process a batch of outbox entries.
 * Safe to call repeatedly. Returns counts for diagnostics.
 */
export async function processOutbox(batchSize = 10): Promise<OutboxProcessResult> {
  const entries = await findPendingOutbox(batchSize);
  let processed = 0;
  let failed = 0;
  let skipped = 0;

  for (const entry of entries) {
    // Atomically mark as PROCESSING (only if still PENDING)
    const acquired = await markProcessing(entry.eventId);
    if (!acquired) {
      skipped++;
      continue;
    }

    try {
      const payload = JSON.parse(entry.payloadJson);
      await publishEvent(entry.eventType, "service-provider", payload);
      await markProcessed(entry.eventId);
      processed++;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      await markFailed(entry.eventId, errorMsg);
      failed++;
    }
  }

  return { processed, failed, skipped };
}
