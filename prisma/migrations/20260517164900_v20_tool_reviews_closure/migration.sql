-- v1.20.20: Tool Reviews Closure
-- Add reviewedRewardedAt column, drop unique constraint, add userId index
-- Rollback: ALTER TABLE "tool_reviews" DROP COLUMN "reviewedRewardedAt"; ALTER TABLE "tool_reviews" ADD CONSTRAINT "tool_reviews_userId_toolKey_key" UNIQUE ("userId", "toolKey"); DROP INDEX "tool_reviews_userId_idx";

-- Step 1: Drop unique constraint (replaced by index for daily limit)
DROP INDEX IF EXISTS "tool_reviews_userId_toolKey_key";

-- Step 2: Add new column for reward tracking
ALTER TABLE "tool_reviews" ADD COLUMN "reviewedRewardedAt" TIMESTAMP(3);

-- Step 3: Add userId index (was implicit in unique constraint)
CREATE INDEX "tool_reviews_userId_idx" ON "tool_reviews"("userId");
