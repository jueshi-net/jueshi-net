-- v1.20.19: Membership levels, growth value, badges
-- Rollback: ALTER TABLE users DROP CONSTRAINT users_level_key_fkey; ALTER TABLE users DROP COLUMN growth_value, DROP COLUMN level_key; DROP TABLE IF EXISTS growth_logs, user_badge_awards, user_badges, user_levels CASCADE;

-- Step 1: New columns on users (NO DEFAULT for level_key to avoid FK violation)
ALTER TABLE "users" ADD COLUMN "growth_value" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "level_key" VARCHAR(191);

-- Step 2: Create user_levels
CREATE TABLE "user_levels" (
    "id" VARCHAR(191) NOT NULL,
    "key" VARCHAR(191) NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "min_growth" INTEGER NOT NULL,
    "max_growth" INTEGER,
    "description" TEXT,
    "benefits" JSONB,
    "icon_text" VARCHAR(191) NOT NULL,
    "color" VARCHAR(191) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_levels_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "user_levels_key_key" ON "user_levels"("key");

-- Step 3: Seed default levels
INSERT INTO "user_levels" ("id", "key", "name", "min_growth", "max_growth", "description", "icon_text", "color", "sort_order") VALUES
('lvl-001-lv1', 'lv1', 'Lv.1 新手', 0, 99, '刚注册的新用户', '🌱', 'green-500', 1),
('lvl-002-lv2', 'lv2', 'Lv.2 常用用户', 100, 499, '活跃使用的用户', '🌿', 'teal-500', 2),
('lvl-003-lv3', 'lv3', 'Lv.3 进阶用户', 500, 1499, '深度参与的用户', '🌳', 'blue-500', 3),
('lvl-004-lv4', 'lv4', 'Lv.4 高级用户', 1500, 4999, '核心贡献用户', '⭐', 'amber-500', 4),
('lvl-005-lv5', 'lv5', 'Lv.5 核心用户', 5000, NULL, '平台最重要的用户', '👑', 'purple-500', 5);

-- Step 4: Set all existing users to lv1
UPDATE "users" SET "level_key" = 'lv1' WHERE "level_key" IS NULL;

-- Step 5: Make level_key NOT NULL
ALTER TABLE "users" ALTER COLUMN "level_key" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "level_key" SET DEFAULT 'lv1';

-- Step 6: Create user_badges
CREATE TABLE "user_badges" (
    "id" VARCHAR(191) NOT NULL,
    "key" VARCHAR(191) NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "description" TEXT,
    "icon_text" VARCHAR(191) NOT NULL,
    "color" VARCHAR(191) NOT NULL,
    "category" VARCHAR(191) NOT NULL,
    "condition_text" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "user_badges_key_key" ON "user_badges"("key");

-- Step 7: Seed default badges
INSERT INTO "user_badges" ("id", "key", "name", "description", "icon_text", "color", "category", "condition_text", "sort_order") VALUES
('bdg-001', 'first_login', '初来乍到', '欢迎加入海外百宝箱', '🎉', 'purple-500', 'system', '完成注册', 1),
('bdg-002', 'checkin_first', '每日签到', '完成首次签到', '📅', 'green-500', 'checkin', '首次签到', 2),
('bdg-003', 'checkin_streak_7', '连续活跃', '累计签到 7 天', '🔥', 'red-500', 'checkin', '累计签到 7 天', 3),
('bdg-004', 'tool_explorer', '工具体验官', '使用过 AI 工具或实用工具', '🛠️', 'blue-500', 'member', '使用过工具', 4),
('bdg-005', 'first_review', '热心点评', '提交过工具短评', '💬', 'teal-500', 'review', '提交过点评', 5),
('bdg-006', 'resource_collector', '资源收藏家', '收藏过资源或工具', '📚', 'amber-500', 'member', '收藏过内容', 6),
('bdg-007', 'topic_contributor', '专题贡献者', '为专题内容做出贡献', '📝', 'indigo-500', 'topic', '后台手动授予', 7),
('bdg-008', 'member_pioneer', '会员先锋', '首批付费会员', '💎', 'purple-500', 'member', '后台手动授予', 8);

-- Step 8: Create user_badge_awards
CREATE TABLE "user_badge_awards" (
    "id" VARCHAR(191) NOT NULL,
    "user_id" VARCHAR(191) NOT NULL,
    "badge_id" VARCHAR(191) NOT NULL,
    "reason" TEXT,
    "awarded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_badge_awards_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "user_badge_awards_user_id_badge_id_key" ON "user_badge_awards"("user_id", "badge_id");
CREATE INDEX "user_badge_awards_user_id_idx" ON "user_badge_awards"("user_id");
CREATE INDEX "user_badge_awards_badge_id_idx" ON "user_badge_awards"("badge_id");

-- Step 9: Create growth_logs
CREATE TABLE "growth_logs" (
    "id" VARCHAR(191) NOT NULL,
    "user_id" VARCHAR(191) NOT NULL,
    "type" VARCHAR(191) NOT NULL,
    "value" INTEGER NOT NULL,
    "reason" TEXT,
    "ref_type" VARCHAR(191),
    "ref_id" VARCHAR(191),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "growth_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "growth_logs_user_id_idx" ON "growth_logs"("user_id");
CREATE INDEX "growth_logs_type_idx" ON "growth_logs"("type");
CREATE INDEX "growth_logs_created_at_idx" ON "growth_logs"("created_at");

-- Step 10: Add FK constraints (after data seeded)
ALTER TABLE "users" ADD CONSTRAINT "users_level_key_fkey" FOREIGN KEY ("level_key") REFERENCES "user_levels"("key") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "user_badge_awards" ADD CONSTRAINT "user_badge_awards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_badge_awards" ADD CONSTRAINT "user_badge_awards_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "user_badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "growth_logs" ADD CONSTRAINT "growth_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
