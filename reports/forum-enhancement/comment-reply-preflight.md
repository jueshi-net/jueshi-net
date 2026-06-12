# 评论回复功能 Preflight

## 概述

本文档评估论坛评论回复功能的实现方案，为下一阶段开发提供技术指导。

## 当前状态

- ForumComment schema 已有 `postId` 字段，关联到 ForumPost
- 没有 `parentId` 字段，不支持嵌套评论
- 评论审核流程已实现（pending / published）
- 反垃圾门槛已实现（频率限制、重复检测）

## 方案选择

### 方案 A：一层回复（推荐）

**实现方式**：
- 新增 `parentId` 字段（可选，指向父评论）
- 支持一层回复，不支持多层嵌套
- 回复显示在父评论下方，缩进显示

**优点**：
- 实现简单，改动小
- UI 清晰，不会过度嵌套
- 审核流程复用现有逻辑
- 反垃圾规则复用现有逻辑

**缺点**：
- 不支持多层讨论

**Migration**：
```prisma
model ForumComment {
  // ... existing fields
  parentId String? @map("parent_id")
  parent   ForumComment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies  ForumComment[] @relation("CommentReplies")
  
  @@index([parentId])
}
```

### 方案 B：多层嵌套

**实现方式**：
- 新增 `parentId` 字段
- 支持无限层级嵌套
- 使用递归查询加载完整树结构

**优点**：
- 支持深度讨论

**缺点**：
- 实现复杂，查询性能差
- UI 可能过度嵌套，移动端体验差
- 需要限制最大嵌套深度

**不推荐**：复杂度高，收益低

## 推荐方案：方案 A（一层回复）

## 实现细节

### 1. Schema 变更

```prisma
model ForumComment {
  id        String     @id @default(cuid())
  postId    String     @map("post_id")
  post      ForumPost  @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId    String     @map("user_id")
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  parentId  String?    @map("parent_id")  // 新增
  parent    ForumComment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies   ForumComment[] @relation("CommentReplies")
  content   String
  status    String     @default("pending")
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")
  rewardGrantedAt DateTime? @map("reward_granted_at")

  @@index([postId])
  @@index([userId])
  @@index([parentId])  // 新增
  @@index([status])
  @@map("forum_comments")
}
```

### 2. API 变更

**POST /api/forum/posts/[slug]/comments**
- 新增 `parentId` 参数（可选）
- 如果提供 `parentId`，验证父评论存在且属于同一帖子
- 不允许回复回复（只支持一层）

**GET /api/forum/posts/[slug]/comments**
- 返回评论树结构
- 顶层评论：`parentId === null`
- 回复：包含在父评论的 `replies` 数组中

### 3. 审核流程

- 回复走同样的审核流程（pending → published）
- 管理员审核父评论时，可以选择同时审核所有回复
- 或者回复独立审核

**推荐**：回复独立审核，与父评论解耦

### 4. 反垃圾规则

- 回复走同样的频率限制（1min/3）
- 回复走同样的重复检测（1h）
- 回复计入每日评论上限（20/天）

### 5. 通知系统

- 回复父评论时，通知父评论作者
- 需要通知系统支持（当前未实现）

**当前状态**：无通知系统

**建议**：
- 第一阶段：不实现通知，用户需要手动查看
- 第二阶段：实现简单通知（EventLog + 前端轮询）
- 第三阶段：实现实时通知（WebSocket）

### 6. GrowthLog 奖励

- 回复审核通过，奖励 +5 成长值（与评论相同）
- 复用现有 `forum_comment_approved` 奖励逻辑

### 7. UI 设计

**评论列表**：
```
评论 A（顶层）
  ├── 回复 A1（缩进显示）
  ├── 回复 A2
  └── [回复] 按钮

评论 B（顶层）
  └── 回复 B1
```

**回复表单**：
- 点击"回复"按钮，展开回复表单
- 表单显示"回复 @用户名"
- 提交后，回复显示在父评论下方

## 影响评估

### 需要修改的文件

1. `prisma/schema.prisma` - 新增 `parentId` 字段
2. `src/app/api/forum/posts/[slug]/comments/route.ts` - 支持 `parentId` 参数
3. `src/components/bbs/comment-section.tsx` - 显示回复、回复表单
4. `src/app/api/forum/admin/comments/[id]/approve/route.ts` - 审核回复
5. `src/lib/forum-rewards.ts` - 回复奖励逻辑（复用）

### Migration

- 需要新增 migration
- 向后兼容（`parentId` 可选）
- 现有评论自动成为顶层评论

### 性能影响

- 查询评论时需要 include replies
- 一层嵌套性能影响小
- 需要索引 `parentId` 字段

## 风险评估

1. **Schema 变更风险**：低（新增可选字段，向后兼容）
2. **API 变更风险**：低（新增可选参数）
3. **UI 复杂度**：中（需要处理嵌套显示）
4. **审核复杂度**：低（复用现有逻辑）
5. **反垃圾风险**：低（复用现有逻辑）

## 建议

**是否建议下一阶段做**：✅ 是

**理由**：
1. 实现简单，改动小
2. 用户体验提升明显
3. 风险可控
4. 可以复用现有逻辑

**建议时间**：1-2 天

## 下一步

1. 用户批准 Schema 变更
2. 执行 migration
3. 实现 API 变更
4. 实现 UI 变更
5. E2E 测试
6. 部署
