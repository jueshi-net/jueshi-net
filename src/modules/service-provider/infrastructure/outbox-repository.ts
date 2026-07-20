/**
 * DomainEventOutbox repository.
 *
 * Provides CRUD for the outbox table. The outbox stores domain events
 * in the same DB transaction as the domain change, then a worker
 * processes them asynchronously.
 */
import { prisma } from "./db";

export type OutboxStatus = "PENDING" | "PROCESSING" | "PROCESSED" | "FAILED";

/** Create an outbox entry. Call inside a $transaction. */
export async function createOutboxEntry(input: {
  eventId: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
}) {
  return prisma.domainEventOutbox.create({
    data: {
      eventId: input.eventId,
      eventType: input.eventType,
      aggregateType: input.aggregateType,
      aggregateId: input.aggregateId,
      payloadJson: JSON.stringify(input.payload),
      status: "PENDING",
    },
  });
}

/** Find pending outbox entries, ordered by availableAt. */
export async function findPendingOutbox(batchSize = 10) {
  return prisma.domainEventOutbox.findMany({
    where: {
      status: "PENDING",
      availableAt: { lte: new Date() },
    },
    orderBy: { availableAt: "asc" },
    take: batchSize,
  });
}

/** Atomically mark an entry as PROCESSING (only if still PENDING). */
export async function markProcessing(eventId: string): Promise<boolean> {
  const result = await prisma.domainEventOutbox.updateMany({
    where: { eventId, status: "PENDING" },
    data: { status: "PROCESSING", updatedAt: new Date() },
  });
  return result.count > 0;
}

/** Mark an entry as PROCESSED. */
export async function markProcessed(eventId: string) {
  return prisma.domainEventOutbox.update({
    where: { eventId },
    data: { status: "PROCESSED", processedAt: new Date(), updatedAt: new Date() },
  });
}

/** Mark an entry as FAILED, increment attempts. */
export async function markFailed(eventId: string, error: string, maxAttempts = 5) {
  const entry = await prisma.domainEventOutbox.findUnique({ where: { eventId } });
  if (!entry) return;
  const attempts = entry.attempts + 1;
  const isFinalFailure = attempts >= maxAttempts;
  await prisma.domainEventOutbox.update({
    where: { eventId },
    data: {
      status: isFinalFailure ? "FAILED" : "PENDING",
      attempts,
      lastError: error.substring(0, 2000),
      availableAt: new Date(Date.now() + Math.pow(2, attempts) * 1000), // exponential backoff
      updatedAt: new Date(),
    },
  });
}

/** Find by eventId (for idempotency checks). */
export async function findByEventId(eventId: string) {
  return prisma.domainEventOutbox.findUnique({ where: { eventId } });
}

/** Count entries by status (for diagnostics). */
export async function countByStatus() {
  const [pending, processing, processed, failed] = await Promise.all([
    prisma.domainEventOutbox.count({ where: { status: "PENDING" } }),
    prisma.domainEventOutbox.count({ where: { status: "PROCESSING" } }),
    prisma.domainEventOutbox.count({ where: { status: "PROCESSED" } }),
    prisma.domainEventOutbox.count({ where: { status: "FAILED" } }),
  ]);
  return { pending, processing, processed, failed };
}
