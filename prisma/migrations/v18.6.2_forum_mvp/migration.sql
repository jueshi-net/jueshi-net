-- v1.20.42.18.6.2: Forum MVP — likes, bookmarks, reports
-- Additive migration: new tables only
-- NO DROP, NO DELETE, NO TRUNCATE

-- 1. Create forum_likes table
CREATE TABLE IF NOT EXISTS "forum_likes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT,
    "comment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "forum_likes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "forum_likes_user_id_post_id_key" ON "forum_likes"("user_id", "post_id");
CREATE UNIQUE INDEX IF NOT EXISTS "forum_likes_user_id_comment_id_key" ON "forum_likes"("user_id", "comment_id");
CREATE INDEX IF NOT EXISTS "forum_likes_post_id_idx" ON "forum_likes"("post_id");
CREATE INDEX IF NOT EXISTS "forum_likes_comment_id_idx" ON "forum_likes"("comment_id");

ALTER TABLE "forum_likes" ADD CONSTRAINT "forum_likes_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "forum_likes" ADD CONSTRAINT "forum_likes_post_id_fkey"
    FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE;
ALTER TABLE "forum_likes" ADD CONSTRAINT "forum_likes_comment_id_fkey"
    FOREIGN KEY ("comment_id") REFERENCES "forum_comments"("id") ON DELETE CASCADE;

-- 2. Create forum_bookmarks table
CREATE TABLE IF NOT EXISTS "forum_bookmarks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "forum_bookmarks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "forum_bookmarks_user_id_post_id_key" ON "forum_bookmarks"("user_id", "post_id");
CREATE INDEX IF NOT EXISTS "forum_bookmarks_user_id_idx" ON "forum_bookmarks"("user_id");
CREATE INDEX IF NOT EXISTS "forum_bookmarks_post_id_idx" ON "forum_bookmarks"("post_id");

ALTER TABLE "forum_bookmarks" ADD CONSTRAINT "forum_bookmarks_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "forum_bookmarks" ADD CONSTRAINT "forum_bookmarks_post_id_fkey"
    FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE;

-- 3. Create forum_reports table
CREATE TABLE IF NOT EXISTS "forum_reports" (
    "id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "post_id" TEXT,
    "comment_id" TEXT,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "resolved_by" TEXT,
    "resolved_at" TIMESTAMP(3),
    "resolution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "forum_reports_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "forum_reports_reporter_id_post_id_key" ON "forum_reports"("reporter_id", "post_id");
CREATE UNIQUE INDEX IF NOT EXISTS "forum_reports_reporter_id_comment_id_key" ON "forum_reports"("reporter_id", "comment_id");
CREATE INDEX IF NOT EXISTS "forum_reports_post_id_idx" ON "forum_reports"("post_id");
CREATE INDEX IF NOT EXISTS "forum_reports_comment_id_idx" ON "forum_reports"("comment_id");
CREATE INDEX IF NOT EXISTS "forum_reports_status_idx" ON "forum_reports"("status");

ALTER TABLE "forum_reports" ADD CONSTRAINT "forum_reports_reporter_id_fkey"
    FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "forum_reports" ADD CONSTRAINT "forum_reports_post_id_fkey"
    FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE;
ALTER TABLE "forum_reports" ADD CONSTRAINT "forum_reports_comment_id_fkey"
    FOREIGN KEY ("comment_id") REFERENCES "forum_comments"("id") ON DELETE CASCADE;
