-- v1.20.42.18.6.1: Community Reputation Identity Foundation
-- Additive migration: new tables + new column on users
-- NO DROP, NO DELETE, NO TRUNCATE

-- 1. Add honor_score column to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "honor_score" INTEGER DEFAULT 0;

-- 2. Create user_community_profiles table
CREATE TABLE IF NOT EXISTS "user_community_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "display_name" TEXT,
    "bio" TEXT,
    "location_text" TEXT,
    "website_url" TEXT,
    "public_title" TEXT,
    "joined_at_display_mode" TEXT NOT NULL DEFAULT 'date',
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_community_profiles_pkey" PRIMARY KEY ("id")
);

-- Unique constraint on user_id (1:1 relationship)
CREATE UNIQUE INDEX IF NOT EXISTS "user_community_profiles_user_id_key" ON "user_community_profiles"("user_id");

-- Foreign key
ALTER TABLE "user_community_profiles" ADD CONSTRAINT "user_community_profiles_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- 3. Create honor_logs table
CREATE TABLE IF NOT EXISTS "honor_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT,
    "actor_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "honor_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "honor_logs_user_id_idx" ON "honor_logs"("user_id");
CREATE INDEX IF NOT EXISTS "honor_logs_source_type_idx" ON "honor_logs"("source_type");
CREATE INDEX IF NOT EXISTS "honor_logs_created_at_idx" ON "honor_logs"("created_at");

ALTER TABLE "honor_logs" ADD CONSTRAINT "honor_logs_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- 4. Create community_stats table
CREATE TABLE IF NOT EXISTS "community_stats" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "accepted_answer_count" INTEGER NOT NULL DEFAULT 0,
    "featured_post_count" INTEGER NOT NULL DEFAULT 0,
    "helpful_vote_count" INTEGER NOT NULL DEFAULT 0,
    "report_accepted_count" INTEGER NOT NULL DEFAULT 0,
    "violation_count" INTEGER NOT NULL DEFAULT 0,
    "last_active_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "community_stats_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "community_stats_user_id_key" ON "community_stats"("user_id");

ALTER TABLE "community_stats" ADD CONSTRAINT "community_stats_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
