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
-- THIS MIGRATION IS NOT YET EXECUTED.
-- DATABASE_MIGRATION_AUTHORIZED=false

CREATE TABLE `contentops_idempotency_claims` (
    `id` VARCHAR(191) NOT NULL,
    `key_hash` VARCHAR(191) NOT NULL,
    `key_version` INT NOT NULL DEFAULT 1,
    `request_hash` VARCHAR(191) NULL,
    `task_id` VARCHAR(191) NOT NULL,
    `job_id` VARCHAR(191) NULL,
    `content_type` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'CLAIMED',
    `backend_content_id` VARCHAR(191) NULL,
    `attempt_count` INT NOT NULL DEFAULT 1,
    `last_error` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `contentops_idempotency_claims_key_hash_key` (`key_hash`),
    INDEX `contentops_idempotency_claims_status_idx` (`status`),
    INDEX `contentops_idempotency_claims_task_id_idx` (`task_id`),
    INDEX `contentops_idempotency_claims_content_type_idx` (`content_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
