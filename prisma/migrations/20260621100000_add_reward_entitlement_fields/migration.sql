-- AlterTable: Add limit fields to reward_items
ALTER TABLE "reward_items" ADD COLUMN IF NOT EXISTS "stock_limit" INTEGER;
ALTER TABLE "reward_items" ADD COLUMN IF NOT EXISTS "stock_used" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "reward_items" ADD COLUMN IF NOT EXISTS "per_user_limit" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "reward_items" ADD COLUMN IF NOT EXISTS "cooldown_hours" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "reward_items" ADD COLUMN IF NOT EXISTS "start_at" TIMESTAMP(3);
ALTER TABLE "reward_items" ADD COLUMN IF NOT EXISTS "end_at" TIMESTAMP(3);
ALTER TABLE "reward_items" ADD COLUMN IF NOT EXISTS "requires_approval" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "reward_items" ADD COLUMN IF NOT EXISTS "fulfillment_type" TEXT;
ALTER TABLE "reward_items" ADD COLUMN IF NOT EXISTS "fulfillment_status" TEXT;
ALTER TABLE "reward_items" ADD COLUMN IF NOT EXISTS "inactive_reason" TEXT;

-- AlterTable: Add audit and fulfillment fields to user_rewards
ALTER TABLE "user_rewards" ADD COLUMN IF NOT EXISTS "audit_status" TEXT NOT NULL DEFAULT 'auto';
ALTER TABLE "user_rewards" ADD COLUMN IF NOT EXISTS "audit_note" TEXT;
ALTER TABLE "user_rewards" ADD COLUMN IF NOT EXISTS "points_cost" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "user_rewards" ADD COLUMN IF NOT EXISTS "grant_id" TEXT;
ALTER TABLE "user_rewards" ADD COLUMN IF NOT EXISTS "failure_reason" TEXT;

-- AlterTable: Change default status for user_rewards
ALTER TABLE "user_rewards" ALTER COLUMN "status" SET DEFAULT 'pending';

-- CreateTable: Create coupon_entitlements table
CREATE TABLE IF NOT EXISTS "coupon_entitlements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "coupon_type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "expires_at" TIMESTAMP(3),
    "source_reward_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupon_entitlements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Add indexes for coupon_entitlements
CREATE INDEX IF NOT EXISTS "coupon_entitlements_user_id_idx" ON "coupon_entitlements"("user_id");
CREATE INDEX IF NOT EXISTS "coupon_entitlements_coupon_type_idx" ON "coupon_entitlements"("coupon_type");
CREATE INDEX IF NOT EXISTS "coupon_entitlements_status_idx" ON "coupon_entitlements"("status");
