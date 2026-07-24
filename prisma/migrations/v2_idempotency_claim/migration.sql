-- ContentOps Idempotency Claim Migration
-- V2-IDEMPOTENCY: v1.20.42.18.6.24.1
--
-- Creates the contentops_idempotency_claims table for database-level
-- atomic content creation deduplication.
--
-- The key_hash @unique constraint is the atomic claim primitive:
-- when two concurrent requests try to create content for the same keyHash,
-- only one succeeds; the other gets a unique constraint violation (P2002)
-- and falls back to reading the existing claim.
--
-- Migration not yet executed. Database migration authorization pending.

CREATE TABLE "contentops_idempotency_claims" (
    "id" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "key_version" INTEGER NOT NULL DEFAULT 1,
    "request_hash" TEXT,
    "task_id" TEXT NOT NULL,
    "job_id" TEXT,
    "content_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CLAIMED',
    "backend_content_id" TEXT,
    "attempt_count" INTEGER NOT NULL DEFAULT 1,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contentops_idempotency_claims_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "contentops_idempotency_claims_key_hash_key" ON "contentops_idempotency_claims"("key_hash");
CREATE INDEX "contentops_idempotency_claims_status_idx" ON "contentops_idempotency_claims"("status");
CREATE INDEX "contentops_idempotency_claims_task_id_idx" ON "contentops_idempotency_claims"("task_id");
CREATE INDEX "contentops_idempotency_claims_content_type_idx" ON "contentops_idempotency_claims"("content_type");
