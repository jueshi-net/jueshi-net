-- v1.20.42.18.6.4: Community Forum Product Upgrade
-- Additive migration: new columns + new tables only
-- NO DROP, NO DELETE, NO TRUNCATE

-- 1. Add new columns to forum_posts
ALTER TABLE "forum_posts" ADD COLUMN IF NOT EXISTS "tags" JSONB;
ALTER TABLE "forum_posts" ADD COLUMN IF NOT EXISTS "is_solved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "forum_posts" ADD COLUMN IF NOT EXISTS "accepted_comment_id" TEXT;
ALTER TABLE "forum_posts" ADD COLUMN IF NOT EXISTS "is_featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "forum_posts" ADD COLUMN IF NOT EXISTS "related_tool" TEXT;
ALTER TABLE "forum_posts" ADD COLUMN IF NOT EXISTS "related_guide_id" TEXT;
ALTER TABLE "forum_posts" ADD COLUMN IF NOT EXISTS "related_checklist_id" TEXT;
ALTER TABLE "forum_posts" ADD COLUMN IF NOT EXISTS "related_task_chain_type" TEXT;

-- 2. Add new columns to forum_comments
ALTER TABLE "forum_comments" ADD COLUMN IF NOT EXISTS "floor_number" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "forum_comments" ADD COLUMN IF NOT EXISTS "is_accepted" BOOLEAN NOT NULL DEFAULT false;

-- 3. Add FK: forum_posts.accepted_comment_id -> forum_comments.id
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_accepted_comment_id_fkey"
  FOREIGN KEY ("accepted_comment_id") REFERENCES "forum_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. Create forum_notifications table
CREATE TABLE IF NOT EXISTS "forum_notifications" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "post_id" TEXT,
  "comment_id" TEXT,
  "actor_id" TEXT,
  "message" TEXT NOT NULL,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "forum_notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "forum_notifications_user_id_idx" ON "forum_notifications"("user_id");
CREATE INDEX IF NOT EXISTS "forum_notifications_is_read_idx" ON "forum_notifications"("is_read");
CREATE INDEX IF NOT EXISTS "forum_notifications_created_at_idx" ON "forum_notifications"("created_at" DESC);

ALTER TABLE "forum_notifications" ADD CONSTRAINT "forum_notifications_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "forum_notifications" ADD CONSTRAINT "forum_notifications_post_id_fkey"
  FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. Create moderation_logs table
CREATE TABLE IF NOT EXISTS "moderation_logs" (
  "id" TEXT NOT NULL,
  "admin_id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "post_id" TEXT,
  "comment_id" TEXT,
  "reason" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "moderation_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "moderation_logs_admin_id_idx" ON "moderation_logs"("admin_id");
CREATE INDEX IF NOT EXISTS "moderation_logs_post_id_idx" ON "moderation_logs"("post_id");
CREATE INDEX IF NOT EXISTS "moderation_logs_created_at_idx" ON "moderation_logs"("created_at" DESC);

ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_admin_id_fkey"
  FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_post_id_fkey"
  FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 6. Add new indexes to forum_posts
CREATE INDEX IF NOT EXISTS "forum_posts_is_featured_idx" ON "forum_posts"("is_featured");
CREATE INDEX IF NOT EXISTS "forum_posts_is_solved_idx" ON "forum_posts"("is_solved");

-- 7. Add new index to forum_comments
CREATE INDEX IF NOT EXISTS "forum_comments_is_accepted_idx" ON "forum_comments"("is_accepted");
