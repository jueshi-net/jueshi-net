-- ============================================================
-- Forum V1 Schema Upgrade - Forward Migration
-- Date: 2026-07-17
-- Branch: feature/forum-v1-schema-upgrade-design
-- Status: DRAFT - NOT FOR EXECUTION
-- 
-- Additive migration: new tables + new columns only
-- NO DROP of existing tables, NO DELETE of existing data
-- ============================================================

-- ─── 1. ForumUserRestriction (用户禁言/封禁) ───

CREATE TABLE IF NOT EXISTS "forum_user_restrictions" (
  "id"               TEXT      NOT NULL,
  "user_id"          TEXT      NOT NULL,
  "restriction_type" TEXT      NOT NULL,  -- mute / ban / suspend
  "reason"           TEXT      NOT NULL,
  "starts_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at"       TIMESTAMP(3),          -- NULL = permanent
  "status"           TEXT      NOT NULL DEFAULT 'active',  -- active / revoked / expired
  "created_by"       TEXT      NOT NULL,
  "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revoked_by"       TEXT,
  "revoked_at"       TIMESTAMP(3),
  "revoke_reason"    TEXT,

  CONSTRAINT "forum_user_restrictions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "forum_user_restrictions_user_status_idx"
  ON "forum_user_restrictions" ("user_id", "status");
CREATE INDEX IF NOT EXISTS "forum_user_restrictions_status_expires_idx"
  ON "forum_user_restrictions" ("status", "expires_at");
CREATE INDEX IF NOT EXISTS "forum_user_restrictions_type_status_idx"
  ON "forum_user_restrictions" ("restriction_type", "status");
CREATE INDEX IF NOT EXISTS "forum_user_restrictions_created_at_idx"
  ON "forum_user_restrictions" ("created_at" DESC);

ALTER TABLE "forum_user_restrictions"
  ADD CONSTRAINT "forum_user_restrictions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "forum_user_restrictions"
  ADD CONSTRAINT "forum_user_restrictions_created_by_fkey"
    FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "forum_user_restrictions"
  ADD CONSTRAINT "forum_user_restrictions_revoked_by_fkey"
    FOREIGN KEY ("revoked_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── 2. ForumComment: parentId + replyToUserId (楼中楼) ───

ALTER TABLE "forum_comments" ADD COLUMN IF NOT EXISTS "parent_id" TEXT;
ALTER TABLE "forum_comments" ADD COLUMN IF NOT EXISTS "reply_to_user_id" TEXT;

-- 自关联 FK: parent_id -> forum_comments.id (CASCADE 删除子回复)
ALTER TABLE "forum_comments"
  ADD CONSTRAINT "forum_comments_parent_id_fkey"
    FOREIGN KEY ("parent_id") REFERENCES "forum_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- FK: reply_to_user_id -> users.id
ALTER TABLE "forum_comments"
  ADD CONSTRAINT "forum_comments_reply_to_user_id_fkey"
    FOREIGN KEY ("reply_to_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 索引
CREATE INDEX IF NOT EXISTS "forum_comments_parent_id_idx"
  ON "forum_comments" ("parent_id");
CREATE INDEX IF NOT EXISTS "forum_comments_reply_to_user_id_idx"
  ON "forum_comments" ("reply_to_user_id");
CREATE INDEX IF NOT EXISTS "forum_comments_post_parent_status_idx"
  ON "forum_comments" ("post_id", "parent_id", "status");

-- ─── 3. ForumPostRevision (版本历史) ───

CREATE TABLE IF NOT EXISTS "forum_post_revisions" (
  "id"          TEXT      NOT NULL,
  "post_id"     TEXT      NOT NULL,
  "version"     INTEGER   NOT NULL,
  "title"       TEXT      NOT NULL,
  "content"     TEXT      NOT NULL,
  "tags"        JSONB,
  "edited_by"   TEXT      NOT NULL,
  "edit_reason" TEXT,
  "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "forum_post_revisions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "forum_post_revisions_post_id_version_key" UNIQUE ("post_id", "version")
);

CREATE INDEX IF NOT EXISTS "forum_post_revisions_post_created_idx"
  ON "forum_post_revisions" ("post_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "forum_post_revisions_edited_by_idx"
  ON "forum_post_revisions" ("edited_by");

ALTER TABLE "forum_post_revisions"
  ADD CONSTRAINT "forum_post_revisions_post_id_fkey"
    FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "forum_post_revisions"
  ADD CONSTRAINT "forum_post_revisions_edited_by_fkey"
    FOREIGN KEY ("edited_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─── 4. 数据回填: 无需回填 ───
-- 所有新列默认 NULL, 新表为空
-- 现有评论 parent_id = NULL (顶层评论) — 正确
-- 现有帖子无版本记录 — 版本从第一次编辑后开始

-- ─── 迁移完成 ───
