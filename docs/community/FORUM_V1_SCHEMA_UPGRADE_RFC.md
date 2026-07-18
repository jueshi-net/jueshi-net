# Forum V1 Schema Upgrade RFC

> **Status:** DRAFT — For review by default Hermes and user
> **Branch:** `feature/forum-v1-schema-upgrade-design`
> **Base:** `0b5c02f` (Forum V1 P6 final closure)
> **Date:** 2026-07-16
> **Author:** Forum Agent

---

## Executive Summary

Forum V1 在不修改数据库结构的前提下已完成 P0–P6 全部功能。本 RFC 针对三个需要 Schema 支持的能力完成技术设计：

1. **用户禁言与封禁** (`ForumUserRestriction`)
2. **楼中楼评论** (`ForumComment.parentId` 自关联)
3. **完整内容版本历史** (`ForumPostRevision`)

每项均提供：Prisma Schema 草案 → PostgreSQL Migration SQL → 索引 → 数据回填 → 回滚 SQL → 风险评估。

**不执行任何 migration，不部署 staging，不连接 production。**

---

## Table of Contents

- [1. 用户禁言与封禁设计](#1-用户禁言与封禁设计)
- [2. 楼中楼评论设计](#2-楼中楼评论设计)
- [3. 完整内容版本历史](#3-完整内容版本历史)
- [4. 迁移与回滚](#4-迁移与回滚)
- [5. API 和 UI 影响](#5-api-和-ui-影响)
- [6. 决策记录](#6-决策记录)

---

## 1. 用户禁言与封禁设计

### 1.1 现状审计

| 模型 | 现有字段 | 是否可用于限制状态 |
|------|---------|-------------------|
| `User` | `role` (admin/user) | ❌ 这是权限角色，不是社区限制状态 |
| `User` | 无 `banned`/`muted`/`suspended` 字段 | ❌ 不存在 |
| `UserCommunityProfile` | `isPublic`, `displayName`, `bio` 等 | ❌ 纯展示字段，无限制状态 |
| `CommunityStat` | `violationCount` (Int) | ⚠️ 仅统计计数，无活跃状态、时间、原因 |
| `ModerationLog` | action, reason, adminId | ⚠️ 仅审计日志，查询活跃限制需扫描全表 |

**结论：当前 Schema 无法支持禁言/封禁功能。必须新增模型。**

### 1.2 方案对比

| 维度 | A: User 加 Boolean 字段 | B: UserCommunityProfile 加字段 | C: 新 ForumUserRestriction 模型 |
|------|----------------------|----------------------------|-------------------------------|
| 权限边界 | User 是全局模型，影响范围过大 | 社区专属，隔离性好 | 社区专属，隔离性好 |
| 历史记录 | ❌ 无法记录历史，只存当前状态 | ❌ 同左 | ✅ 每次操作一条记录 |
| 临时禁言 | ❌ 需额外字段 expiresAt | ⚠️ 需加多个字段 | ✅ 原生支持 startsAt/expiresAt |
| 永久封禁 | ⚠️ Boolean isBanned | ⚠️ Boolean | ✅ expiresAt = NULL |
| 到期自动解除 | ❌ 需要 cron 扫描 | ❌ 同左 | ✅ 查询时 WHERE expiresAt < NOW() |
| 多管理员操作 | ❌ 谁操作的不可追溯 | ❌ 同左 | ✅ createdBy/revokedBy 完整审计 |
| 审计 | ❌ 无法审计 | ❌ 无法审计 | ✅ 完整审计链 |
| 查询性能 | ✅ 最快 (单行查询) | ✅ 快 | ⚠️ 需要 WHERE status='active' + index |
| 实现复杂度 | 最低 | 中 | 最高但最完整 |

### 1.3 决策

```
USER_RESTRICTION_MODEL_DECISION = RECOMMENDED: C (新 ForumUserRestriction 模型)
```

**理由：**
- 禁言/封禁是社区治理核心能力，必须有完整审计链
- 临时禁言需要 expiresAt，Boolean 无法表达
- 多管理员操作需要追溯 createdBy/revokedBy
- 查询性能通过索引可接受 (userId + status 复合索引)
- 不污染 User 全局模型

```
ALTERNATIVE: B (UserCommunityProfile 加字段) — 如果需要极简实现
  - 在 UserCommunityProfile 增加: restrictionType, restrictionReason, restrictionExpiresAt, restrictedBy, restrictedAt
  - 优点：不新增表
  - 缺点：无历史记录，无 revoke 审计，到期自动解除需要每次查询判断
  - 适用场景：MVP 阶段快速上线

REJECTED: A (User 加 Boolean 字段)
  - 理由：User 是全局模型，影响认证、会员、Stripe 等全系统
  - Boolean 无法表达临时禁言、到期时间、操作审计
  - 无法记录历史（从 ban → unban → ban 无法追溯）
```

### 1.4 Prisma Schema 草案

```prisma
/// Forum user restriction - ban/mute/suspend with audit trail
model ForumUserRestriction {
  id              String   @id @default(cuid())
  userId          String   @map("user_id")
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  restrictionType String   @map("restriction_type") // mute / ban / suspend
  reason          String   // 封禁/禁言原因
  startsAt        DateTime @default(now()) @map("starts_at")
  expiresAt       DateTime? @map("expires_at") // NULL = 永久
  status          String   @default("active") // active / revoked / expired

  createdBy       String   @map("created_by") // 管理员 userId
  createdAt       DateTime @default(now()) @map("created_at")
  revokedBy       String?  @map("revoked_by") // 解除管理员 userId
  revokedAt       DateTime? @map("revoked_at")
  revokeReason    String?  @map("revoke_reason")

  @@index([userId, status])
  @@index([status, expiresAt])
  @@index([restrictionType, status])
  @@index([createdAt(sort: Desc)])
  @@map("forum_user_restrictions")
}
```

### 1.5 临时禁言设计 (TEMP_MUTE_DESIGN)

```
restrictionType = "mute"
expiresAt = NOW() + interval (e.g., 24h, 7d, 30d)

运行时检查逻辑 (在发帖/评论 API 中):
  SELECT 1 FROM forum_user_restrictions
  WHERE user_id = ?
    AND restriction_type = 'mute'
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW())
  LIMIT 1

如果存在记录 → 返回 403 + 原因 + 到期时间

到期处理:
  - 懒过期: 查询时 WHERE expires_at > NOW()，过期记录自动不在结果中
  - 定时任务 (可选): 每 10 分钟将 status='active' AND expires_at < NOW() 的记录更新为 status='expired'
  - 不影响已发布内容，仅阻止新发帖/评论
```

### 1.6 永久封禁设计 (PERMANENT_BAN_DESIGN)

```
restrictionType = "ban"
expiresAt = NULL

运行时检查逻辑 (在所有互动 API 中: 发帖、评论、点赞、举报、收藏):
  SELECT 1 FROM forum_user_restrictions
  WHERE user_id = ?
    AND restriction_type = 'ban'
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW())
  LIMIT 1

如果存在记录 → 返回 403 + 原因 + "永久封禁，如需申诉请联系管理员"

封禁用户的历史内容处理:
  - 已发布内容保持可见 (不自动隐藏)
  - 管理员可选择额外执行 hide 操作
  - 封禁仅阻止新互动，不追溯删除历史内容
```

### 1.7 审计设计 (RESTRICTION_AUDIT_DESIGN)

```
每次操作记录:
  - 创建限制: createdBy, createdAt, reason
  - 解除限制: revokedBy, revokedAt, revokeReason
  - 自动过期: status='expired' (由定时任务或查询时判定)

ModerationLog 关联:
  - action: 'user_mute' / 'user_ban' / 'user_unmute' / 'user_unban'
  - 在现有 ModerationLog 中增加 targetType 字段 (可选, 向后兼容)
  - 或者直接在 ForumUserRestriction 自身存储完整审计

管理员不受限流误伤:
  - 在所有限流和限制检查前先判断 User.role === 'admin'
  - admin 用户跳过 ForumUserRestriction 检查
  - admin 用户跳过发帖/评论限流
```

---

## 2. 楼中楼评论设计

### 2.1 现状审计

当前 `ForumComment` 模型是扁平结构：
- 无 `parentId` 字段
- 所有评论都是帖子的直接回复
- `commentCount` 统计所有评论（无层级区分）
- 无 `replyToUserId` 字段

### 2.2 设计

```
COMMENT_REPLY_MODEL_DECISION = RECOMMENDED: ForumComment 加 parentId 自关联
```

```
ALTERNATIVE: 新建 ForumReply 模型 — 被拒绝
  - 理由：查询时需要 UNION 两张表，分页复杂
  - 统计 commentCount 需要跨表计算

REJECTED: 嵌套 JSON 存储 — 被拒绝
  - 理由：无法查询、排序、分页子回复
```

### 2.3 Prisma Schema 草案

```prisma
model ForumComment {
  // ... 现有字段保持不变 ...

  // 新增: 楼中楼支持
  parentId        String?        @map("parent_id")
  parent          ForumComment?  @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies         ForumComment[] @relation("CommentReplies")

  replyToUserId   String?        @map("reply_to_user_id") // 被回复的用户 (方便通知)
  replyToUser     User?          @relation("CommentReplyTarget", fields: [replyToUserId], references: [id])

  // 新增索引
  @@index([parentId])
  @@index([replyToUserId])
}
```

### 2.4 深度限制 (COMMENT_DEPTH_LIMIT)

```
COMMENT_DEPTH_LIMIT = 2 (顶层 + 1 层子回复)

实现逻辑 (在评论创建 API 中):
  1. 如果 parentId 为 NULL → 顶层评论，直接创建
  2. 如果 parentId 不为 NULL:
     a. 查询 parent 评论
     b. 如果 parent.parentId 不为 NULL → 返回 400 "不支持三级嵌套回复"
     c. 如果 parent.parentId 为 NULL → 创建子回复 (第 2 层)

前端约束:
  - 顶层评论显示 "回复" 按钮
  - 子回复不显示 "回复" 按钮 (或点击后提示 "请直接回复主评论")
  - 子回复可以 @ 提及用户 (replyToUserId)
```

### 2.5 删除策略 (COMMENT_DELETE_BEHAVIOR)

```
父评论删除策略: ON DELETE CASCADE (数据库层)
  - 父评论被删除时，所有子回复级联删除
  - 这是最简单且一致的策略

软删除 (status='deleted') 处理:
  - 当父评论被设为 status='deleted' 时:
    - 子回复保持原状态 (不级联软删除)
    - 前端显示 "该评论已删除" 占位
    - 子回复仍然可见，显示在占位下方
  - 当子回复被设为 status='deleted' 时:
    - 仅该子回复显示 "已删除"
    - 不影响父评论和其他子回复

被封禁用户历史评论:
  - 保持可见 (封禁仅阻止新互动)
  - 管理员可选择额外执行 hide 操作
```

### 2.6 commentCount 统计口径 (COMMENT_COUNT_STATISTICS)

```
口径定义: commentCount = 所有 status='published' 的评论数 (含子回复)

更新时机:
  - 创建评论 (顶层或子回复) → commentCount + 1
  - 评论被删除 (status='deleted') → commentCount - 1
  - 评论被恢复 (status='published') → commentCount + 1
  - 评论被隐藏 (status='hidden') → commentCount - 1 (隐藏不算入公开评论数)

分页:
  - 顶层评论分页: WHERE post_id = ? AND parent_id IS NULL AND status = 'published'
  - 子回复加载: WHERE parent_id = ? AND status = 'published' ORDER BY created_at ASC
  - 子回复不分页 (默认全部加载，前端可做 "展开更多" 折叠)
```

### 2.7 索引设计 (COMMENT_INDEX_DESIGN)

```sql
-- 顶层评论查询: WHERE post_id = ? AND parent_id IS NULL AND status = 'published'
CREATE INDEX forum_comments_post_parent_status_idx
  ON forum_comments (post_id, parent_id, status);

-- 子回复查询: WHERE parent_id = ? AND status = 'published'
CREATE INDEX forum_comments_parent_status_idx
  ON forum_comments (parent_id, status);

-- replyToUser 通知查询
CREATE INDEX forum_comments_reply_to_user_idx
  ON forum_comments (reply_to_user_id);
```

### 2.8 迁移兼容

```
- parentId 默认 NULL → 所有现有评论自动成为顶层评论
- replyToUserId 默认 NULL → 无被回复用户
- 不需要数据回填
- 向后兼容: 查询不加 parentId 条件时，行为与扁平评论完全一致
```

---

## 3. 完整内容版本历史

### 3.1 需求分析

```
POST_REVISION_MODEL_DECISION = RECOMMENDED: 新建 ForumPostRevision 模型
```

```
ALTERNATIVE: 在 ForumPost 上增加 editHistory JSON 字段 — 被拒绝
  - 理由: JSON 无法高效查询、比较、分页
  - Prisma 对 Json 字段的查询支持有限
  - 大型 editHistory 会拖慢 ForumPost 查询

REJECTED: 仅用 ModerationLog 记录编辑 — 被拒绝
  - 理由: ModerationLog 不存储完整内容快照，无法 diff
  - 审计日志不应该存储大文本内容
```

### 3.2 Prisma Schema 草案

```prisma
/// Forum post revision history - tracks content changes over time
model ForumPostRevision {
  id          String   @id @default(cuid())
  postId      String   @map("post_id")
  post        ForumPost @relation(fields: [postId], references: [id], onDelete: Cascade)

  version     Int      // 版本号，从 1 开始递增
  title       String   // 编辑时的标题快照
  content     String   // 编辑时的内容快照
  tags        Json?    // 编辑时的标签快照

  editedBy    String   @map("edited_by") // 编辑者 userId (作者或管理员)
  editReason  String?  @map("edit_reason") // 编辑原因
  createdAt   DateTime @default(now()) @map("created_at")

  @@unique([postId, version])
  @@index([postId, createdAt(sort: Desc)])
  @@index([editedBy])
  @@map("forum_post_revisions")
}
```

### 3.3 版本创建策略 (REVISION_CREATION_POLICY)

```
场景 1: 初次发布
  → 不创建版本 (原始内容已在 ForumPost 中)
  → 版本从第 1 次编辑开始

场景 2: 草稿自动保存
  → 不创建版本
  → 草稿保存仅更新 ForumPost 当前内容
  → 理由: 自动保存频繁，会产生大量无意义版本

场景 3: 提交审核
  → 不创建版本
  → 审核是对当前内容的审核，不需要版本快照

场景 4: 审核通过后编辑 (published 状态)
  → ✅ 创建版本
  → 版本号 = max(version) + 1
  → 快照 = 编辑前的内容 (即旧内容)
  → 然后 ForumPost 更新为新内容
  → editReason = 用户填写的编辑原因 (可选)

场景 5: 管理员编辑
  → ✅ 创建版本
  → editedBy = 管理员 userId
  → editReason = 管理员填写的原因

场景 6: 管理员 hide/restore
  → 不创建版本 (不修改内容)
  → 仅记录 ModerationLog
```

### 3.4 版本比较策略

```
管理员比较差异:
  - GET /api/forum/posts/:postId/revisions → 返回版本列表
  - GET /api/forum/posts/:postId/revisions/:versionA/:versionB → 返回两个版本的 diff
  - diff 算法: 前端使用 diff-match-patch 或 similar 库
  - API 仅返回两个版本的完整内容，由前端计算 diff

版本展示:
  - 版本列表按 version DESC 排序
  - 每个版本显示: version, editedBy, editReason, createdAt
  - 点击版本可查看该版本完整内容
  - 管理员可比较任意两个版本
```

### 3.5 版本保留策略 (REVISION_RETENTION_POLICY)

```
保留策略:
  - 最近 50 个版本: 完整保留
  - 超过 50 个版本: 仅保留每 10 个版本中的最后一个 (即第 60, 70, 80...)
  - 超过 1 年的版本: 仅保留每 50 个版本中的最后一个

清理:
  - 定时任务 (可选): 每周扫描 forum_post_revisions
  - 对超过 50 个版本的帖子，按上述策略清理旧版本
  - 清理时记录 ModerationLog (action: 'revision_cleanup')

不自动恢复:
  - 版本仅用于查看和比较
  - 恢复操作需要管理员手动确认
  - 恢复 = 创建新版本 (内容为指定版本的内容)
```

---

## 4. 迁移与回滚

### 4.1 迁移文件结构

```
prisma/migrations/
  20260717000000_forum_v1_schema_upgrade/
    migration.sql       (正向迁移)
    rollback.sql        (回滚脚本, 非 Prisma 标准)
```

### 4.2 正向迁移 SQL (MIGRATION_SQL_DRAFT)

```sql
-- ============================================================
-- Forum V1 Schema Upgrade
-- Date: 2026-07-17
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

-- ─── 4. User 模型关系补充 (无需建表/列, 仅 Prisma 层关系声明) ───
-- ForumUserRestriction.user -> User (已在上面 FK 中创建)
-- ForumPostRevision.post -> ForumPost (已在上面 FK 中创建)

-- ─── 5. 数据回填 ───
-- 所有新列默认 NULL / 默认值，不需要回填
-- 现有评论 parent_id = NULL (顶层评论) — 正确
-- 现有评论 reply_to_user_id = NULL — 正确
-- 无需迁移现有数据

-- ─── 6. 可选: 更新 forum_posts.commentCount 口径说明 ───
-- 无需 SQL 变更，commentCount 逻辑在应用层调整
```

### 4.3 回滚 SQL (ROLLBACK_SQL_DRAFT)

```sql
-- ============================================================
-- Forum V1 Schema Upgrade - ROLLBACK
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

-- 回滚完成。所有新增对象已删除。
-- 现有数据不受影响 (仅删除了新增的表和列)。
```

### 4.4 数据回填计划 (BACKFILL_PLAN)

```
BACKFILL_PLAN = NONE_REQUIRED

理由:
1. ForumUserRestriction: 新表，无现有数据需要回填
2. ForumComment.parentId: 默认 NULL，所有现有评论自动成为顶层评论
3. ForumComment.replyToUserId: 默认 NULL
4. ForumPostRevision: 新表，历史帖子无版本记录 (v1 = 当前内容)
   - 可选: 为已发布帖子创建初始版本 (version=1)，但非必需
   - 建议: 不回填，版本从第一次编辑后开始

数据量评估:
  - forum_posts: 预估 < 10,000 行
  - forum_comments: 预估 < 50,000 行
  - forum_user_restrictions: 新表，0 行
  - forum_post_revisions: 新表，0 行
  - 迁移影响行数: 0 (仅 DDL，无 DML)
  - 预计执行时间: < 5 秒 (仅建表和加列)
```

### 4.5 灰度发布顺序 (ROLLOUT_PLAN)

```
ROLLOUT_PLAN:

Phase 1: Schema Migration (低风险)
  1. 在 staging 执行 migration.sql
  2. 验证表结构和索引
  3. 运行 prisma generate 更新客户端
  4. 在 staging 运行全量测试

Phase 2: Application Deploy (中风险)
  5. 合并 feature 分支到 staging 分支
  6. 部署 staging 环境
  7. 验证现有功能不受影响 (扁平评论仍正常工作)
  8. 验证新功能 (楼中楼、禁言、版本历史)

Phase 3: Production Migration (需用户确认)
  9. 备份 production 数据库
  10. 在 production 执行 migration.sql
  11. 验证表结构
  12. 部署 production 应用

Phase 4: Verification
  13. 验证 production 论坛正常工作
  14. 监控错误日志 24 小时

回滚条件:
  - 任何 Phase 失败 → 执行 rollback.sql → 回退应用版本
  - Phase 3 失败 → 执行 rollback.sql → 不部署新应用
```

### 4.6 风险评估 (RISK_ASSESSMENT)

| 风险 | 等级 | 缓解措施 |
|------|------|---------|
| ForumComment.parentId FK 影响 DELETE 性能 | 低 | 已加索引，CASCADE 删除由数据库处理 |
| 迁移期间应用不可用 | 低 | ALTER TABLE ADD COLUMN 在 PostgreSQL 中不锁表 (仅元数据操作) |
| Prisma 客户端未及时更新 | 中 | 迁移后立即执行 prisma generate |
| 回滚丢失楼中楼数据 | 中 | 回滚前导出 forum_comments.parent_id 数据 |
| 版本历史表膨胀 | 低 | 版本保留策略 + 定期清理 |
| 禁言检查增加 API 延迟 | 低 | 复合索引 (user_id, status) 保证 O(1) 查询 |
| 自关联 CASCADE 删除大量子回复 | 中 | 限制单帖评论数，前端做子回复折叠 |

---

## 5. API 和 UI 影响

### 5.1 API 变更清单

| API | 变更类型 | 说明 |
|-----|---------|------|
| `POST /api/forum/posts` | 权限守卫 | 检查 ForumUserRestriction (mute/ban) |
| `POST /api/forum/comments` | 权限守卫 + 功能 | 检查限制 + 支持 parentId 创建子回复 |
| `GET /api/forum/posts/:slug` | 查询调整 | 评论按层级返回 (顶层 + 子回复) |
| `GET /api/forum/comments?postId=X` | 查询调整 | 先查顶层，再批量查子回复 |
| `PUT /api/forum/posts/:id` | 功能增强 | 创建版本快照 (编辑前内容) |
| `POST /api/forum/admin/ban` | **新增** | 创建 ForumUserRestriction (ban) |
| `POST /api/forum/admin/mute` | **新增** | 创建 ForumUserRestriction (mute) |
| `POST /api/forum/admin/unban` | **新增** | 撤销 ban 限制 |
| `POST /api/forum/admin/unmute` | **新增** | 撤销 mute 限制 |
| `GET /api/forum/admin/restrictions` | **新增** | 查看限制列表 |
| `GET /api/forum/posts/:id/revisions` | **新增** | 查看版本历史 |
| `GET /api/forum/posts/:id/revisions/:v1/:v2` | **新增** | 比较两个版本差异 |
| `POST /api/forum/posts/:id/revisions/:v/restore` | **新增** | 恢复到指定版本 (管理员) |
| 所有互动 API | 权限守卫 | 检查 ban 状态 |
| `GET /api/forum/notifications` | 通知增强 | 子回复通知 replyToUserId |

### 5.2 权限守卫变更

```typescript
// 新增中间件: checkUserRestriction
async function checkUserRestriction(userId: string, action: 'post' | 'comment' | 'interact') {
  const restrictions = await prisma.forumUserRestriction.findMany({
    where: {
      userId,
      status: 'active',
      OR: [
        { expiresAt: null }, // permanent
        { expiresAt: { gt: new Date() } }, // not expired
      ],
    },
  });

  const ban = restrictions.find(r => r.restrictionType === 'ban');
  if (ban) {
    return { restricted: true, type: 'ban', reason: ban.reason };
  }

  if (action === 'post' || action === 'comment') {
    const mute = restrictions.find(r => r.restrictionType === 'mute');
    if (mute) {
      return { restricted: true, type: 'mute', reason: mute.reason, expiresAt: mute.expiresAt };
    }
  }

  return { restricted: false };
}

// 管理员豁免
if (user.role === 'admin') {
  // Skip restriction check
}
```

### 5.3 Forum 页面变更

| 页面 | 变更 |
|------|------|
| 帖子详情页 | 评论按层级渲染 (顶层 + 折叠子回复)；锁定帖不显示评论框 |
| 发帖页 | 检查 ban/mute 状态，显示限制提示 |
| 用户资料页 | 显示限制状态 (如果公开) |
| 版本历史页 (新增) | 管理员可查看帖子版本历史和 diff |
| 封禁提示页 (新增) | 被封禁用户尝试操作时显示原因和申诉入口 |

### 5.4 管理后台变更

| 页面 | 变更 |
|------|------|
| 管理员工作台 | 新增 "用户限制" tab |
| 用户限制面板 (新增) | 创建/撤销 ban/mute，查看限制历史 |
| 帖子审核 | 编辑帖子时创建版本快照 |
| 版本对比 (新增) | 管理员可比较帖子不同版本 |

### 5.5 通知变更

| 场景 | 通知类型 | 接收者 |
|------|---------|--------|
| 评论被回复 (子回复) | `reply` | 父评论作者 (replyToUserId) |
| 用户被封禁 | `ban` | 被封禁用户 |
| 用户被禁言 | `mute` | 被禁言用户 |
| 用户被解除封禁 | `unban` | 被解除用户 |
| 用户被解除禁言 | `unmute` | 被解除用户 |
| 帖子被管理员编辑 | `edit` | 帖子作者 |

### 5.6 审计变更

```
ModerationLog 新增 action 类型:
  - user_mute: 创建禁言
  - user_ban: 创建封禁
  - user_unmute: 解除禁言
  - user_unban: 解除封禁
  - post_edit: 管理员编辑帖子 (关联 ForumPostRevision)
  - revision_restore: 恢复历史版本

ForumUserRestriction 自身审计:
  - createdBy + createdAt: 谁在何时创建
  - revokedBy + revokedAt + revokeReason: 谁在何时为何解除
```

### 5.7 Sitemap/SEO 变更

```
- 子回复不影响 sitemap (sitemap 只包含帖子)
- 被封禁用户的历史帖子仍在 sitemap 中 (除非帖子被 hidden)
- 版本历史页面不纳入 sitemap (noindex)
- 被禁言用户不能发新帖 → sitemap 中不会出现新帖
```

### 5.8 自动化测试影响

| 测试领域 | 新增测试 |
|---------|---------|
| 用户限制 | 创建 ban/mute、到期解除、管理员豁免、重复操作幂等 |
| 楼中楼 | 创建子回复、深度限制、级联删除、子回复分页 |
| 版本历史 | 创建版本、版本比较、版本恢复、版本清理 |
| 通知 | 子回复通知、封禁通知、解除通知 |
| SEO | 被封禁用户帖子仍在 sitemap、版本页 noindex |
| 权限 | 普通用户不能调用 ban/mute API |

---

## 6. 决策记录

### 6.1 用户禁言与封禁

```
USER_RESTRICTION_MODEL_DECISION
  RECOMMENDED: C — 新建 ForumUserRestriction 模型
  ALTERNATIVE: B — UserCommunityProfile 加字段 (MVP 快速实现)
  REJECTED: A — User 加 Boolean 字段 (影响全局, 无法审计)

TEMP_MUTE_DESIGN
  - restrictionType='mute', expiresAt=NOW()+interval
  - 懒过期: 查询时 WHERE expiresAt > NOW()
  - 定时任务 (可选): 每 10 分钟更新过期记录

PERMANENT_BAN_DESIGN
  - restrictionType='ban', expiresAt=NULL
  - 阻止所有互动 (发帖、评论、点赞、举报、收藏)
  - 历史内容保持可见
  - 管理员不受限流误伤

RESTRICTION_AUDIT_DESIGN
  - 完整审计链: createdBy/revokedBy/reason
  - ModerationLog 记录 user_mute/user_ban/user_unmute/user_unban
  - 管理员豁免: User.role='admin' 跳过限制检查
```

### 6.2 楼中楼评论

```
COMMENT_REPLY_MODEL_DECISION
  RECOMMENDED: ForumComment 加 parentId 自关联
  ALTERNATIVE: 无 (保持扁平评论)
  REJECTED: 新建 ForumReply 模型 (查询复杂)、JSON 嵌套 (无法查询)

COMMENT_DEPTH_LIMIT = 2 (顶层 + 1 层子回复)
  - parent.parentId 不为 NULL 时拒绝创建
  - 前端子回复不显示回复按钮

COMMENT_DELETE_BEHAVIOR
  - 数据库层: ON DELETE CASCADE (删除父评论自动删子回复)
  - 软删除 (status='deleted'): 父显示 "已删除"，子回复保持可见
  - 被封禁用户历史评论: 保持可见

COMMENT_INDEX_DESIGN
  - (post_id, parent_id, status): 顶层评论查询
  - (parent_id, status): 子回复查询
  - (reply_to_user_id): 通知查询
```

### 6.3 内容版本历史

```
POST_REVISION_MODEL_DECISION
  RECOMMENDED: 新建 ForumPostRevision 模型
  ALTERNATIVE: 无 (不做版本历史)
  REJECTED: JSON 字段 (无法查询)、ModerationLog (无内容快照)

REVISION_CREATION_POLICY
  - 初次发布: 不创建版本
  - 草稿自动保存: 不创建版本
  - 提交审核: 不创建版本
  - 审核通过后编辑: ✅ 创建版本 (快照=编辑前内容)
  - 管理员编辑: ✅ 创建版本 (editedBy=管理员)
  - hide/restore: 不创建版本 (仅记录 ModerationLog)

REVISION_RETENTION_POLICY
  - 最近 50 个版本: 完整保留
  - 超过 50 个: 每 10 个保留最后 1 个
  - 超过 1 年: 每 50 个保留最后 1 个
  - 定期清理 (可选): 每周扫描
  - 不自动恢复 (恢复 = 创建新版本)
```

### 6.4 迁移与回滚

```
PRISMA_SCHEMA_DRAFT: 见 1.4, 2.3, 3.2
MIGRATION_SQL_DRAFT: 见 4.2
ROLLBACK_SQL_DRAFT: 见 4.3
BACKFILL_PLAN: 无需回填 (新列默认 NULL, 新表空)
ROLLOUT_PLAN: 4 阶段灰度 (Schema → App → Production → Verify)
RISK_ASSESSMENT: 全部低-中风险, 有缓解措施
```

---

## 附录: Prisma Schema 完整草案

以下是需要添加到 `prisma/schema.prisma` 的完整模型声明：

```prisma
// ─── Forum V1 Schema Upgrade ───

/// Forum user restriction - ban/mute/suspend with audit trail
model ForumUserRestriction {
  id              String   @id @default(cuid())
  userId          String   @map("user_id")
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  restrictionType String   @map("restriction_type") // mute / ban / suspend
  reason          String   // 封禁/禁言原因
  startsAt        DateTime @default(now()) @map("starts_at")
  expiresAt       DateTime? @map("expires_at") // NULL = permanent
  status          String   @default("active") // active / revoked / expired

  createdBy       String   @map("created_by")
  createdAt       DateTime @default(now()) @map("created_at")
  revokedBy       String?  @map("revoked_by")
  revokedAt       DateTime? @map("revoked_at")
  revokeReason    String?  @map("revoke_reason")

  @@index([userId, status])
  @@index([status, expiresAt])
  @@index([restrictionType, status])
  @@index([createdAt(sort: Desc)])
  @@map("forum_user_restrictions")
}

/// Forum post revision history
model ForumPostRevision {
  id          String    @id @default(cuid())
  postId      String    @map("post_id")
  post        ForumPost @relation(fields: [postId], references: [id], onDelete: Cascade)

  version     Int       // 版本号
  title       String    // 标题快照
  content     String    // 内容快照
  tags        Json?     // 标签快照

  editedBy    String    @map("edited_by")
  editReason  String?   @map("edit_reason")
  createdAt   DateTime  @default(now()) @map("created_at")

  @@unique([postId, version])
  @@index([postId, createdAt(sort: Desc)])
  @@index([editedBy])
  @@map("forum_post_revisions")
}

// ─── ForumComment 新增字段 (在现有模型上添加) ───
// parentId        String?        @map("parent_id")
// parent          ForumComment?  @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
// replies         ForumComment[] @relation("CommentReplies")
// replyToUserId   String?        @map("reply_to_user_id")
// replyToUser     User?          @relation("CommentReplyTarget", fields: [replyToUserId], references: [id])

// ─── User 模型新增关系 ───
// forumRestrictions   ForumUserRestriction[]
// replyTargetComments ForumComment[]          @relation("CommentReplyTarget")
// postRevisions       ForumPostRevision[]
// restrictedBy        ForumUserRestriction[] @relation("RestrictionCreator")
// revokedRestrictions ForumUserRestriction[]  @relation("RestrictionRevoker")

// ─── ForumPost 模型新增关系 ───
// revisions   ForumPostRevision[]
```

---

## 审核清单

- [ ] default Hermes 审阅
- [ ] 用户确认 Schema 设计
- [ ] 用户确认 ban/mute 方案 (推荐 C, 备选 B)
- [ ] 用户确认楼中楼方案 (推荐 parentId 自关联)
- [ ] 用户确认版本历史方案 (推荐 ForumPostRevision)
- [ ] 用户批准后进入 staging 验证
