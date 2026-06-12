# @提及功能 Preflight

## 概述

本文档评估论坛 @提及功能的实现方案，为未来开发提供技术指导。

## 当前状态

- 论坛帖子和评论支持纯文本内容
- 没有富文本编辑器
- 没有通知系统
- 没有用户 handle / username 字段，使用 email 作为标识

## 方案选择

### 方案 A：简单文本解析（推荐初期）

**实现方式**：
- 用户在文本中输入 `@用户名` 或 `@邮箱前缀`
- 后端解析文本，提取 @提及
- 前端渲染时高亮显示，点击跳转到用户主页

**优点**：
- 实现简单，不需要富文本编辑器
- 向后兼容
- 风险低

**缺点**：
- 没有自动补全
- 用户体验一般

### 方案 B：富文本 + 自动补全（推荐最终）

**实现方式**：
- 使用富文本编辑器（如 TipTap / Slate.js）
- 输入 `@` 时触发自动补全下拉框
- 选择用户后插入 mention 节点
- 后端存储为结构化数据

**优点**：
- 用户体验好
- 功能完整

**缺点**：
- 实现复杂
- 需要替换现有纯文本编辑器
- 数据迁移成本高

## 推荐方案

**第一阶段**：方案 A（简单文本解析）
**第二阶段**：方案 B（富文本 + 自动补全）

## 第一阶段实现细节

### 1. 提及解析

**正则表达式**：
```javascript
const mentionRegex = /@([a-zA-Z0-9_]+)/g;
```

**解析逻辑**：
```javascript
function parseMentions(content) {
  const mentions = [];
  const matches = content.matchAll(mentionRegex);
  
  for (const match of matches) {
    const username = match[1];
    // 查询用户
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { name: username },
          { email: { startsWith: username + '@' } }
        ]
      }
    });
    
    if (user) {
      mentions.push({
        userId: user.id,
        username: user.name || user.email.split('@')[0]
      });
    }
  }
  
  return mentions;
}
```

### 2. Schema 变更

**新增 Mention 表**：
```prisma
model ForumMention {
  id        String   @id @default(cuid())
  postId    String?  @map("post_id")
  commentId String?  @map("comment_id")
  userId    String   @map("user_id")  // 被提及的用户
  mentionedByUserId String @map("mentioned_by_user_id")  // 提及者
  createdAt DateTime @default(now()) @map("created_at")
  
  post      ForumPost? @relation(fields: [postId], references: [id], onDelete: Cascade)
  comment   ForumComment? @relation(fields: [commentId], references: [id], onDelete: Cascade)
  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)
  mentionedBy User @relation("MentionsGiven", fields: [mentionedByUserId], references: [id], onDelete: Cascade)
  
  @@index([postId])
  @@index([commentId])
  @@index([userId])
  @@index([mentionedByUserId])
  @@unique([postId, userId])  // 同一帖子中同一用户只记录一次
  @@unique([commentId, userId])
  @@map("forum_mentions")
}
```

**User 表新增**：
```prisma
model User {
  // ... existing fields
  mentions    ForumMention[] @relation()  // 被提及
  mentionsGiven ForumMention[] @relation("MentionsGiven")  // 提及他人
}

model ForumPost {
  // ... existing fields
  mentions ForumMention[]
}

model ForumComment {
  // ... existing fields
  mentions ForumMention[]
}
```

### 3. API 变更

**POST /api/forum/posts**
- 创建帖子时，解析内容中的 @提及
- 写入 ForumMention 表

**POST /api/forum/posts/[slug]/comments**
- 创建评论时，解析内容中的 @提及
- 写入 ForumMention 表

**GET /api/forum/mentions**
- 获取当前用户被提及的列表
- 用于通知中心

### 4. 前端渲染

**帖子内容渲染**：
```javascript
function renderContent(content) {
  // 解析 @提及
  const parts = content.split(/(@[a-zA-Z0-9_]+)/g);
  
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      const username = part.slice(1);
      return (
        <Link key={i} href={`/user/${username}`} className="text-brand font-medium">
          {part}
        </Link>
      );
    }
    return part;
  });
}
```

### 5. 通知系统

**当前状态**：无通知系统

**建议实现**：
1. **EventLog 方式**（简单）
   - 写入 `forum_mention` EventLog
   - 前端轮询 `/api/forum/mentions`
   - 显示红点提示

2. **独立通知表**（完整）
   - 新增 Notification 表
   - 支持多种通知类型
   - 支持已读/未读状态
   - 支持推送（WebSocket / 邮件）

**推荐**：第一阶段使用 EventLog 方式

### 6. 反骚扰处理

**问题**：用户可能滥用 @提及骚扰他人

**解决方案**：
1. **频率限制**
   - 每个帖子/评论最多 @10 个用户
   - 每分钟最多 @5 个不同用户

2. **隐私保护**
   - 用户可以在设置中关闭 @提及通知
   - 用户可以屏蔽特定用户的 @提及

3. **举报机制**
   - 复用现有举报系统
   - 管理员可以删除恶意提及

### 7. 用户信息泄露风险

**风险**：@提及可能泄露用户邮箱

**解决方案**：
- 只显示用户名或邮箱前缀
- 不显示完整邮箱
- 使用 `user.name || user.email.split('@')[0]`

### 8. GrowthLog 奖励

- @提及不奖励成长值
- 避免刷提及刷分

## 影响评估

### 需要修改的文件

1. `prisma/schema.prisma` - 新增 ForumMention 表
2. `src/app/api/forum/posts/route.ts` - 解析提及
3. `src/app/api/forum/posts/[slug]/comments/route.ts` - 解析提及
4. `src/components/bbs/post-content.tsx` - 渲染提及
5. `src/components/bbs/comment-content.tsx` - 渲染提及
6. `src/app/api/forum/mentions/route.ts` - 新增 API

### Migration

- 需要新增 migration
- 新增 ForumMention 表
- 向后兼容

### 性能影响

- 创建帖子/评论时需要额外查询用户
- 需要索引 mentionedByUserId 和 userId
- 性能影响小

## 风险评估

1. **Schema 变更风险**：低（新增表，不影响现有数据）
2. **API 变更风险**：低（新增逻辑，不影响现有功能）
3. **隐私风险**：中（需要谨慎处理用户信息）
4. **骚扰风险**：中（需要频率限制和举报机制）
5. **性能风险**：低

## 建议

**是否建议下一阶段做**：⚠️ 暂缓

**理由**：
1. 当前没有通知系统，@提及价值有限
2. 需要处理隐私和骚扰问题
3. 实现复杂度高于评论回复
4. 可以等通知系统完善后再做

**建议时间**：
- 第一阶段（简单文本解析）：在通知系统完成后
- 第二阶段（富文本 + 自动补全）：在论坛功能稳定后

## 下一步

1. 先完成评论回复功能
2. 实现简单通知系统（EventLog + 轮询）
3. 再考虑 @提及功能
4. 最终升级到富文本编辑器
