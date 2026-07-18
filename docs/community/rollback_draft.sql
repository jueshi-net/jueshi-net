-- ============================================================
-- Forum V1 Schema Upgrade - ROLLBACK
-- Status: DRAFT - NOT FOR EXECUTION
-- 
-- 执行前请确保已备份相关数据
-- ============================================================

-- ─── 1. 删除 ForumPostRevision 表 ───
DROP TABLE IF EXISTS "forum_post_revisions";

-- ─── 2. 删除 ForumComment 新增列 ───
-- 先删除 FK 约束
ALTER TABLE "forum_comments" DROP CONSTRAINT IF EXISTS "forum_comments_parent_id_fkey";
ALTER TABLE "forum_comments" DROP CONSTRAINT IF EXISTS "forum_comments_reply_to_user_id_fkey";

-- 删除索引
DROP INDEX IF EXISTS "forum_comments_parent_id_idx";
DROP INDEX IF EXISTS "forum_comments_reply_to_user_id_idx";
DROP INDEX IF EXISTS "forum_comments_post_parent_status_idx";

-- 删除列
ALTER TABLE "forum_comments" DROP COLUMN IF EXISTS "parent_id";
ALTER TABLE "forum_comments" DROP COLUMN IF EXISTS "reply_to_user_id";

-- ─── 3. 删除 ForumUserRestriction 表 ───
DROP TABLE IF EXISTS "forum_user_restrictions";

-- ─── 回滚完成 ───
-- 所有新增对象已删除
-- 现有数据不受影响 (仅删除了新增的表和列)
