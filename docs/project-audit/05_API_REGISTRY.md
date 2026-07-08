# 05 - API 注册表

**审计日期**: 2026-07-08  
**总 API 路由数**: 234

---

## API 分类统计

| 分类 | 数量 | 说明 |
|------|------|------|
| Admin API | 87 | 管理后台 API |
| Public API | 110 | 公共 API |
| User API (/me/*) | 19 | 用户个人 API |
| Workspace API | 11 | 工作区 API |
| Workbench API | 7 | 工作台 API |

---

## 核心 API 列表

### 认证 API (5)

| 路由 | 用途 | 状态 |
|------|------|------|
| `/api/auth/[...nextauth]` | NextAuth 认证 | ✅ 生产使用 |
| `/api/auth/register` | 用户注册 | ✅ 生产使用 |
| `/api/auth/me` | 当前用户信息 | ✅ 生产使用 |
| `/api/auth/forgot-password` | 忘记密码 | ✅ 生产使用 |
| `/api/auth/reset-password` | 重置密码 | ✅ 生产使用 |

### 用户 API (15)

| 路由 | 用途 | 状态 |
|------|------|------|
| `/api/me` | 用户信息 | ✅ 生产使用 |
| `/api/me/change-password` | 修改密码 | ✅ 生产使用 |
| `/api/me/notifications` | 通知列表 | ✅ 生产使用 |
| `/api/me/notifications/[id]` | 通知详情 | ✅ 生产使用 |
| `/api/me/notifications/mark-all-read` | 标记已读 | ✅ 生产使用 |
| `/api/me/notifications/unread-count` | 未读数量 | ✅ 生产使用 |
| `/api/me/permissions` | 权限列表 | ✅ 生产使用 |
| `/api/me/membership` | 会员信息 | ✅ 生产使用 |
| `/api/me/growth-logs` | 成长日志 | ✅ 生产使用 |
| `/api/me/task-chains` | 任务链 | ✅ 生产使用 |
| `/api/me/task-chains/[id]` | 任务链详情 | ✅ 生产使用 |
| `/api/me/company-profiles` | 公司档案 | ✅ 生产使用 |
| `/api/me/company-profiles/[id]` | 公司档案详情 | ✅ 生产使用 |
| `/api/me/tool-documents` | 工具文档 | ✅ 生产使用 |
| `/api/me/tool-documents/[id]` | 工具文档详情 | ✅ 生产使用 |

### 内容 API (10)

| 路由 | 用途 | 状态 |
|------|------|------|
| `/api/articles` | 文章列表 | ✅ 生产使用 |
| `/api/articles/[slug]` | 文章详情 | ✅ 生产使用 |
| `/api/checklists` | 清单列表 | ✅ 生产使用 |
| `/api/resources` | 资源列表 | ✅ 生产使用 |
| `/api/resources/[id]` | 资源详情 | ✅ 生产使用 |
| `/api/resources/featured` | 推荐资源 | ✅ 生产使用 |
| `/api/topics` | 专题列表 | ✅ 生产使用 |
| `/api/categories` | 分类列表 | ✅ 生产使用 |
| `/api/tags` | 标签列表 | ✅ 生产使用 |
| `/api/search` | 搜索 | ✅ 生产使用 |

### 工具 API (8)

| 路由 | 用途 | 状态 |
|------|------|------|
| `/api/tools/hs-code` | HS 编码查询 | ✅ 生产使用 |
| `/api/tools/rankings` | 工具排名 | ✅ 生产使用 |
| `/api/tools/reviews` | 工具评价 | ✅ 生产使用 |
| `/api/tools/reviews/[id]` | 评价详情 | ✅ 生产使用 |
| `/api/postal-codes` | 邮编查询 | ✅ 生产使用 |
| `/api/postal-codes/advanced` | 高级邮编查询 | ✅ 生产使用 |
| `/api/exchange-rate` | 汇率查询 | ✅ 生产使用 |
| `/api/calculations` | 计算工具 | ✅ 生产使用 |

### 社区 API (12)

| 路由 | 用途 | 状态 |
|------|------|------|
| `/api/forum/posts` | 帖子列表 | ✅ 生产使用 |
| `/api/forum/posts/[slug]` | 帖子详情 | ✅ 生产使用 |
| `/api/forum/comments` | 评论列表 | ✅ 生产使用 |
| `/api/forum/comments/[id]/like` | 点赞评论 | ✅ 生产使用 |
| `/api/forum/categories` | 分类列表 | ✅ 生产使用 |
| `/api/forum/stats` | 论坛统计 | ✅ 生产使用 |
| `/api/forum/notifications` | 论坛通知 | ✅ 生产使用 |
| `/api/forum/related` | 相关帖子 | ✅ 生产使用 |
| `/api/forum/related-discussions` | 相关讨论 | ✅ 生产使用 |
| `/api/community/user` | 社区用户 | ✅ 生产使用 |
| `/api/community/user/[id]` | 用户详情 | ✅ 生产使用 |

### 工作区 API (10)

| 路由 | 用途 | 状态 |
|------|------|------|
| `/api/workspace/memos` | 备忘录 | ✅ 生产使用 |
| `/api/workspace/memos/[id]` | 备忘录详情 | ✅ 生产使用 |
| `/api/workspace/products` | 产品列表 | ✅ 生产使用 |
| `/api/workspace/products/[id]` | 产品详情 | ✅ 生产使用 |
| `/api/workspace/products/import` | 产品导入 | ✅ 生产使用 |
| `/api/workspace/document-drafts` | 文档草稿 | ✅ 生产使用 |
| `/api/workspace/document-drafts/[id]` | 草稿详情 | ✅ 生产使用 |
| `/api/workspace/invites` | 邀请管理 | ✅ 生产使用 |
| `/api/workspace/ad-entitlements` | 广告权益 | ✅ 生产使用 |

### 工作台 API (6)

| 路由 | 用途 | 状态 |
|------|------|------|
| `/api/workbench/summary` | 工作台概览 | ✅ 生产使用 |
| `/api/workbench/profile` | 用户资料 | ✅ 生产使用 |
| `/api/workbench/favorites` | 收藏列表 | ✅ 生产使用 |
| `/api/workbench/favorites/[toolKey]` | 收藏详情 | ✅ 生产使用 |
| `/api/workbench/links` | 链接列表 | ✅ 生产使用 |
| `/api/workbench/links/[id]` | 链接详情 | ✅ 生产使用 |
| `/api/workbench/recent-tools` | 最近工具 | ✅ 生产使用 |

### 任务链 API (3)

| 路由 | 用途 | 状态 |
|------|------|------|
| `/api/task-chains` | 任务链列表 | ✅ 生产使用 |
| `/api/task-chains/[id]` | 任务链详情 | ✅ 生产使用 |
| `/api/tasks` | 任务列表 | ✅ 生产使用 |
| `/api/tasks/[id]` | 任务详情 | ✅ 生产使用 |

### 奖励 API (6)

| 路由 | 用途 | 状态 |
|------|------|------|
| `/api/rewards` | 奖励列表 | ✅ 生产使用 |
| `/api/rewards/items` | 奖励物品 | ✅ 生产使用 |
| `/api/rewards/my` | 我的奖励 | ✅ 生产使用 |
| `/api/rewards/redeem` | 兑换奖励 | ✅ 生产使用 |
| `/api/rewards/history` | 兑换历史 | ✅ 生产使用 |
| `/api/points` | 积分列表 | ✅ 生产使用 |
| `/api/points/logs` | 积分日志 | ✅ 生产使用 |

### 广告 API (6)

| 路由 | 用途 | 状态 |
|------|------|------|
| `/api/ads` | 广告列表 | ✅ 生产使用 |
| `/api/ads/[id]` | 广告详情 | ✅ 生产使用 |
| `/api/ads/[id]/click` | 广告点击 | ✅ 生产使用 |
| `/api/ads/dispatch` | 广告分发 | ✅ 生产使用 |
| `/api/ads/events` | 广告事件 | ✅ 生产使用 |
| `/api/ads/resolve` | 广告解析 | ✅ 生产使用 |

### 其他 API (15+)

| 路由 | 用途 | 状态 |
|------|------|------|
| `/api/health` | 健康检查 | ✅ 生产使用 |
| `/api/stats` | 统计数据 | ✅ 生产使用 |
| `/api/events` | 事件日志 | ✅ 生产使用 |
| `/api/feedback` | 反馈提交 | ✅ 生产使用 |
| `/api/newsletter/subscribe` | 订阅邮件 | ✅ 生产使用 |
| `/api/notifications` | 通知列表 | ✅ 生产使用 |
| `/api/favorites` | 收藏列表 | ✅ 生产使用 |
| `/api/links` | 链接管理 | ✅ 生产使用 |
| `/api/memos` | 备忘录 | ✅ 生产使用 |
| `/api/invoices` | 发票管理 | ✅ 生产使用 |
| `/api/coupons` | 优惠券 | ✅ 生产使用 |
| `/api/plans` | 套餐计划 | ✅ 生产使用 |
| `/api/subscription` | 订阅管理 | ✅ 生产使用 |
| `/api/checkout` | 结账 | ✅ 生产使用 |
| `/api/export` | 数据导出 | ✅ 生产使用 |
| `/api/share` | 分享 | ✅ 生产使用 |
| `/api/tracking` | 追踪 | ✅ 生产使用 |
| `/api/sse` | Server-Sent Events | ✅ 生产使用 |

---

## Admin API 统计

Admin API 共 87 个路由，覆盖：

- 用户管理 (users, community/users)
- 内容管理 (guides, checklists, topics, destinations, resources)
- 奖励管理 (rewards, reward-items, reward-grants, reward-rules)
- 广告管理 (ads, ad-creatives, ad-placements, ad-entitlements)
- 数据分析 (analytics, stats)
- 系统管理 (settings, audit, backup, health)
- 邀请管理 (invites, invites/rewards)
- 通知管理 (notifications, newsletter)
- 社区管理 (community/posts, community/comments, community/badges)

**状态**: ✅ 完整覆盖

---

## API 健康度

| 类别 | 数量 | 健康度 |
|------|------|--------|
| 认证 API | 5 | ✅ 稳定 |
| 用户 API | 15 | ✅ 稳定 |
| 内容 API | 10 | ✅ 稳定 |
| 工具 API | 8 | ✅ 稳定 |
| 社区 API | 12 | ✅ 稳定 |
| 工作区 API | 10 | ✅ 稳定 |
| 工作台 API | 7 | ✅ 稳定 |
| 任务链 API | 4 | ✅ 稳定 |
| 奖励 API | 7 | ✅ 稳定 |
| 广告 API | 6 | ✅ 稳定 |
| Admin API | 87 | ✅ 稳定 |
| 其他 API | 15+ | ✅ 稳定 |

---

**文档状态**: API_REGISTRY_COMPLETED  
**生成时间**: 2026-07-08 23:35 CST
