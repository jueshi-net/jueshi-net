# 论坛/社区 V4 基础版审计报告

> 审计时间：2026-07-17
> 审计者：Forum Agent (GLM-5.2)
> 分支：feature/forum-v4-foundation-1
> Base commit: e9349807ab8da7e55fbd389b8a55d49b46c452fb

## 1. Canonical 路由

| 路由 | 说明 | 文件 |
|------|------|------|
| `/bbs` | 论坛首页 | `src/app/(public)/bbs/page.tsx` |
| `/bbs/category/[key]` | 版块/分类页 | `src/app/(public)/bbs/category/[key]/page.tsx` |
| `/bbs/[slug]` | 帖子详情 | `src/app/(public)/bbs/[slug]/page.tsx` |
| `/bbs/[slug]/edit` | 编辑帖子 | `src/app/(public)/bbs/[slug]/edit/page.tsx` |
| `/bbs/new` | 发帖页 | `src/app/(public)/bbs/new/page.tsx` |

## 2. Legacy 路由（全部 redirect 到 /bbs）

| Legacy 路由 | 重定向目标 |
|------------|-----------|
| `/community` | `/bbs` |
| `/community/t/[slug]` | `/bbs/[slug]` |
| `/community/c/[slug]` | `/bbs/category/[slug]` |
| `/community/[slug]` | `/bbs/[slug]` |
| `/community/new` | `/bbs/new` |

## 3. 重复实现/死代码

| 文件 | 状态 | 说明 |
|------|------|------|
| `community/t/[slug]/topic-detail-client.tsx` | **死代码** (898行) | page.tsx 重定向到 /bbs/[slug]，此文件未被引用 |
| `community/new/new-post-client.tsx` | **死代码** | page.tsx 重定向到 /bbs/new |
| `community-preview-v2/` | **预览页** | 旧版预览 |
| `community-preview-v3/` | **预览页** | 旧版预览 |
| `components/community/user-trust-card.tsx` | **仅被死代码引用** | 被 topic-detail-client.tsx 引用 |

## 4. Prisma 模型

| 模型 | 说明 |
|------|------|
| `ForumCategory` | 论坛分类 (key, name, iconText, color, sortOrder, isActive) |
| `ForumPost` | 帖子 (slug, title, content, status, isPinned, isLocked, isFeatured, isSolved, tags, relatedTool 等) |
| `ForumComment` | 评论 (floorNumber, isAccepted, status) |
| `ForumLike` | 点赞 (userId + postId 唯一约束) |
| `ForumBookmark` | 收藏 (userId + postId 唯一约束) |
| `ForumReport` | 举报 (reporterId + postId 唯一约束) |

**结论：后端模型完整，无需修改 Prisma Schema。**

## 5. API 路由

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/forum/posts` | GET/POST | 帖子列表/创建 |
| `/api/forum/posts/[slug]` | GET/PATCH/DELETE | 单帖 CRUD |
| `/api/forum/posts/[slug]/comments` | GET/POST | 评论列表/创建 |
| `/api/forum/posts/[slug]/like` | POST/DELETE | 点赞/取消 |
| `/api/forum/posts/[slug]/bookmark` | POST/DELETE | 收藏/取消 |
| `/api/forum/posts/[slug]/accept` | POST | 采纳最佳回答 |
| `/api/forum/posts/[slug]/report` | POST | 举报 |
| `/api/forum/comments/[id]/like` | POST/DELETE | 评论点赞 |
| `/api/forum/categories` | GET | 分类列表 |
| `/api/forum/stats` | GET | 统计 |

**结论：后端 API 完整，支持发帖、回复、点赞、收藏、举报、采纳。**

## 6. 组件清单

### bbs/ 组件（已存在）
- `post-card.tsx` - 帖子卡片
- `category-badge.tsx` - 分类标签
- `comment-section.tsx` - 回复表单（客户端）
- `post-form.tsx` - 发帖表单（客户端）
- `post-content.tsx` - 帖子内容渲染
- `bbs-composer.tsx` - 富文本编辑器

### community/ 组件（V4 新增）
- `forum-skeleton.tsx` - 骨架屏加载
- `forum-empty-state.tsx` - 空状态
- `post-detail-actions.tsx` - 帖子操作（点赞/收藏/分享/举报）

## 7. V4 基础版改动

### 新增文件
- `src/lib/community/types.ts` - 共享类型
- `src/lib/community/utils.ts` - 工具函数
- `src/components/community/forum-skeleton.tsx` - 骨架屏
- `src/components/community/forum-empty-state.tsx` - 空状态
- `src/components/community/post-detail-actions.tsx` - 帖子操作
- `src/app/(public)/bbs/loading.tsx` - 首页加载态
- `src/app/(public)/bbs/[slug]/loading.tsx` - 详情加载态
- `src/app/(public)/bbs/category/[key]/loading.tsx` - 分类加载态
- `src/app/(public)/bbs/error.tsx` - 首页错误边界
- `src/app/(public)/bbs/[slug]/error.tsx` - 详情错误边界
- `src/app/(public)/bbs/category/[key]/error.tsx` - 分类错误边界
- `src/app/(public)/bbs/not-found.tsx` - 论坛 404

### 修改文件
- `src/app/(public)/bbs/[slug]/page.tsx` - 添加 V4 Shell、真实操作按钮、移除 Emoji
- `src/app/(public)/bbs/category/[key]/page.tsx` - 添加 V4 Shell、BreadcrumbBar、移除 Emoji
- `src/app/(public)/bbs/new/page.tsx` - 添加 V4 Shell、BreadcrumbBar、移除 Emoji

## 8. DATABASE_GAPS

无。Prisma 模型完整。

## 9. API_GAPS

无。API 路由完整。

## 10. SHARED_CHANGE_REQUESTS

无。所有修改在 Forum Agent 边界内。
