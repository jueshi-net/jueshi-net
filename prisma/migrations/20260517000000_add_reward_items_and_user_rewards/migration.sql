-- CreateTable
CREATE TABLE "reward_items" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "costPoints" INTEGER NOT NULL,
    "rewardType" TEXT NOT NULL,
    "rewardValue" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reward_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_rewards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rewardItemId" TEXT NOT NULL,
    "rewardType" TEXT NOT NULL,
    "rewardValue" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "expiresAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reward_items_code_key" ON "reward_items"("code");

-- CreateIndex
CREATE INDEX "reward_items_enabled_idx" ON "reward_items"("enabled");

-- CreateIndex
CREATE INDEX "reward_items_sortOrder_idx" ON "reward_items"("sortOrder");

-- CreateIndex
CREATE INDEX "user_rewards_userId_idx" ON "user_rewards"("userId");

-- CreateIndex
CREATE INDEX "user_rewards_status_idx" ON "user_rewards"("status");

-- CreateIndex
CREATE INDEX "user_rewards_rewardType_idx" ON "user_rewards"("rewardType");

-- CreateIndex
CREATE INDEX "user_rewards_expiresAt_idx" ON "user_rewards"("expiresAt");

-- AddForeignKey
ALTER TABLE "user_rewards" ADD CONSTRAINT "user_rewards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rewards" ADD CONSTRAINT "user_rewards_rewardItemId_fkey" FOREIGN KEY ("rewardItemId") REFERENCES "reward_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
