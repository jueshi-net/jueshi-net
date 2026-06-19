-- v1.20.42.12.0: 用户邀请增长系统
-- 扩展 InviteCode 模型，新增 InviteRedemption、RewardRule、RewardGrant 模型

-- 1. 扩展 invite_codes 表
ALTER TABLE "invite_codes" 
ADD COLUMN IF NOT EXISTS "owner_user_id" TEXT,
ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'ADMIN',
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS "invite_codes_owner_user_id_idx" ON "invite_codes"("owner_user_id");

-- 3. 创建 invite_redemptions 表
CREATE TABLE IF NOT EXISTS "invite_redemptions" (
    "id" TEXT NOT NULL,
    "invite_code_id" TEXT NOT NULL,
    "inviter_user_id" TEXT NOT NULL,
    "invitee_user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "qualified_at" TIMESTAMP(3),
    "rewarded_at" TIMESTAMP(3),
    "reject_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invite_redemptions_pkey" PRIMARY KEY ("id")
);

-- 4. 创建 invite_redemptions 索引
CREATE UNIQUE INDEX IF NOT EXISTS "invite_redemptions_invitee_user_id_key" ON "invite_redemptions"("invitee_user_id");
CREATE INDEX IF NOT EXISTS "invite_redemptions_inviter_user_id_idx" ON "invite_redemptions"("inviter_user_id");
CREATE INDEX IF NOT EXISTS "invite_redemptions_invitee_user_id_idx" ON "invite_redemptions"("invitee_user_id");
CREATE INDEX IF NOT EXISTS "invite_redemptions_status_idx" ON "invite_redemptions"("status");

-- 5. 创建 reward_rules 表
CREATE TABLE IF NOT EXISTS "reward_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "reward_type" TEXT NOT NULL,
    "reward_value" INTEGER NOT NULL,
    "reward_metadata" JSONB,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "max_rewards_per_inviter" INTEGER,
    "max_rewards_total" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reward_rules_pkey" PRIMARY KEY ("id")
);

-- 6. 创建 reward_rules 索引
CREATE INDEX IF NOT EXISTS "reward_rules_enabled_idx" ON "reward_rules"("enabled");
CREATE INDEX IF NOT EXISTS "reward_rules_trigger_idx" ON "reward_rules"("trigger");

-- 7. 创建 reward_grants 表
CREATE TABLE IF NOT EXISTS "reward_grants" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "invite_redemption_id" TEXT,
    "reward_rule_id" TEXT NOT NULL,
    "reward_type" TEXT NOT NULL,
    "reward_value" INTEGER NOT NULL,
    "reward_metadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "granted_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reward_grants_pkey" PRIMARY KEY ("id")
);

-- 8. 创建 reward_grants 索引
CREATE INDEX IF NOT EXISTS "reward_grants_user_id_idx" ON "reward_grants"("user_id");
CREATE INDEX IF NOT EXISTS "reward_grants_status_idx" ON "reward_grants"("status");
CREATE INDEX IF NOT EXISTS "reward_grants_reward_type_idx" ON "reward_grants"("reward_type");
CREATE UNIQUE INDEX IF NOT EXISTS "reward_grants_invite_redemption_id_reward_rule_id_key" ON "reward_grants"("invite_redemption_id", "reward_rule_id");

-- 9. 添加外键约束
ALTER TABLE "invite_codes" 
ADD CONSTRAINT "invite_codes_owner_user_id_fkey" 
FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "invite_redemptions" 
ADD CONSTRAINT "invite_redemptions_invite_code_id_fkey" 
FOREIGN KEY ("invite_code_id") REFERENCES "invite_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "invite_redemptions" 
ADD CONSTRAINT "invite_redemptions_inviter_user_id_fkey" 
FOREIGN KEY ("inviter_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "invite_redemptions" 
ADD CONSTRAINT "invite_redemptions_invitee_user_id_fkey" 
FOREIGN KEY ("invitee_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reward_grants" 
ADD CONSTRAINT "reward_grants_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reward_grants" 
ADD CONSTRAINT "reward_grants_invite_redemption_id_fkey" 
FOREIGN KEY ("invite_redemption_id") REFERENCES "invite_redemptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "reward_grants" 
ADD CONSTRAINT "reward_grants_reward_rule_id_fkey" 
FOREIGN KEY ("reward_rule_id") REFERENCES "reward_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
