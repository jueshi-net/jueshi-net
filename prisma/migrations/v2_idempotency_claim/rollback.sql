-- ContentOps Idempotency Claim Rollback
-- V2-IDEMPOTENCY: v1.20.42.18.6.24.1
--
-- Rollback not yet executed. Database migration authorization pending.
--
-- Executing this rollback will drop the contentops_idempotency_claims table.
-- This will delete all accumulated idempotency claim records.
-- Content records (Guides, Checklists, Topics) are NOT affected.

DROP TABLE IF EXISTS "contentops_idempotency_claims";
