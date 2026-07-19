# Forum V1.5 增长 RFC

> **状态**: DRAFT - 等待确认
> **日期**: 2026-07-19
> **作者**: Forum Agent
> **基线**: V1.4 commit `333bb49` / staging merge `fcbf8ed`
> **原则**: 先复用现有 Schema，不新增数据库迁移

---

## 一、V1.5 产品目标

### 核心目标

把论坛从「内容发布 + 审核 + 质量巡检」推进到「用户有成长感、内容有激励闭环、运营有数据抓手」的社区形态。

### 三条主线

| 主线 | 目标 | 衡量标准 |
|------|------|----------|
| 用户成长 | 用户在论坛的活动可积累为可视化的成长轨迹 | 等级、勋章、贡献值在个人页可见 |
| 内容激励 | 高质量内容产出者获得正反馈（荣誉、成长、徽章） | 精华帖/最佳答案/被点赞触发成长值 |
| 运营抓手 | 管理员可查看排行榜、新人任务进度、内容激励发放情况 | 管理页展示周/月榜、任务完成率 |

### 不做的事

- 不新增数据库表（除非确认后写入 SHARED_CHANGE_REQUESTS）
- 不构建用户画像或敏感属性推断
- 不接入第三方分析 SDK
- 不自动处罚用户（风险分仅供参考）
- 不开发商业化功能（仅设计预留）

---

## 二、现有基础设施审计（已完成）

### 2.1 已有且已接线的系统

| 系统 | 模型 | 当前状态 |
|------|------|----------|
| 成长值 | `User.growthValue` + `GrowthLog` + `UserLevel` | ✅ 帖子审核通过 +20，评论审核通过 +5 |
| 荣誉值 | `User.honorScore` + `HonorLog` | ✅ 帖子被点赞 +1，评论被点赞 +1，回答被采纳 +10 |
| 等级 | `User.levelKey` (lv1-lv5) + `UserLevel` 表 | ✅ 成长值变动时自动更新 |
| 勋章 | `User.badges` (String[]) + `UserBadge` + `UserBadgeAward` | ✅ 模型存在，但论坛相关勋章未定义 |
| 社区统计 | `CommunityStat` (postCount, commentCount, acceptedAnswerCount...) | ✅ 模型存在，部分已接入 |
| 最佳答案 | `ForumPost.isSolved` + `acceptedCommentId` + `ForumComment.isAccepted` | ✅ 采纳 API 已实现 |
| 精华帖 | `ForumPost.isFeatured` | ✅ 管理员可加精/取消 |
| 积分 | `User.points` + `PointLedger` + `DailyCheckIn` | ✅ 签到系统已实现 |
| 奖励规则 | `RewardRule` (trigger, rewardType) + `RewardGrant` | ✅ 邀请系统已接入，论坛未接入 |
| 事件日志 | `EventLog` (eventType, metadata, userId) | ✅ V1.3 已接入 forum_search, forum_feed_view |
| 个人资料 | `UserCommunityProfile` (displayName, bio, publicTitle) | ✅ 模型存在 |

### 2.2 已有但未接线的系统（V1.5 要接的）

| 能力 | 现有模型 | 缺口 |
|------|----------|------|
| 精华帖荣誉 | `HonorLog.sourceType` 已定义 `post_featured` | 管理员加精时未调用 `adjustHonor()` |
| 举报采纳荣誉 | `HonorLog.sourceType` 已定义 `report_accepted` | 举报处理时未给举报人发放荣誉 |
| 论坛勋章 | `UserBadge` (category 字段是 String) | 未定义论坛类别勋章（首帖/首答/精华作者/活跃作者） |
| 成长值联动 | `GrowthLog.type` 已定义 `topic` | 采纳回答/加精时未发放成长值 |
| CommunityStat 同步 | `CommunityStat` 模型 | 部分场景未调用 `incrementCommunityStat()` |
| 排行榜 | `CommunityStat` 可聚合计算 | 无排行榜页面和 API |
| 新人任务 | `UserTask` 模型（通用待办） | 无论坛新人引导任务 |

### 2.3 Schema 缺口（需要 migration，本版不执行）

| 缺口 | 说明 | V1.5 处理方式 |
|------|------|--------------|
| `ForumActivity` 模型 | 社区活动/campaign（新人任务、主题活动） | 延期，或复用 `UserTask` + `EventLog` |
| `ForumExpertVerification` | 专家认证审核记录 | 延期，或复用 `UserBadge` + 管理员手动 |
| `ForumLeaderboardSnapshot` | 排行榜快照缓存 | 不需要，实时聚合 `CommunityStat` |
| `ForumPost.postType` | 帖子类型（问答/讨论/分享） | 延期，或复用 `tags` + `ForumCategory.key` |
| `RewardRule.trigger` 扩展 | 论坛事件触发奖励 | 写入 SHARED_CHANGE_REQUESTS |

---

## 三、用户成长体系

### 3.1 设计

```
                    ┌──────────────┐
                    │  UserLevel   │  lv1-lv5 (已存在)
                    │  minGrowth   │
                    └──────┬───────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌─────▼──────┐ ┌──────▼──────┐
    │ growthValue │ │ honorScore │ │   badges    │
    │ (可消费❌)  │ │ (不可消费) │ │  (String[]) │
    │ 成长值      │ │ 荣誉值     │ │  勋章标识    │
    └──────┬──────┘ └─────┬──────┘ └──────┬──────┘
           │               │               │
    ┌──────▼──────┐ ┌─────▼──────┐ ┌──────▼──────┐
    │  GrowthLog  │ │  HonorLog  │ │UserBadgeAward│
    │ type/value │ │sourceType  │ │ badgeId     │
    └─────────────┘ └────────────┘ └─────────────┘
```

### 3.2 等级（复用现有）

| 等级 | Key | 成长值范围 | 名称 |
|------|-----|-----------|------|
| Lv.1 | lv1 | 0-99 | 新手 |
| Lv.2 | lv2 | 100-499 | 初级 |
| Lv.3 | lv3 | 500-1499 | 中级 |
| Lv.4 | lv4 | 1500-4999 | 高级 |
| Lv.5 | lv5 | 5000+ | 专家 |

- **复用**：`User.levelKey` + `UserLevel` 表，无 Schema 变更
- **展示**：`UserTrustCard` 组件已显示等级

### 3.3 经验值/成长值（复用现有）

| 行为 | 成长值 | 现有状态 |
|------|--------|----------|
| 帖子审核通过 | +20 | ✅ 已接入 `grantPostReward()` |
| 评论审核通过 | +5 | ✅ 已接入 `grantCommentReward()` |
| 回答被采纳 | +10 | ❌ 未接入（V1.5 补） |
| 帖子被加精 | +30 | ❌ 未接入（V1.5 补） |
| 每日签到 | +2 | ✅ 已有签到系统 |

- **复用**：`User.growthValue` + `GrowthLog` + `addGrowthValue()`
- **新增**：在加精和采纳回答时调用 `addGrowthValue()`

### 3.4 荣誉值（复用现有）

| 行为 | 荣誉值 | sourceType | 现有状态 |
|------|--------|------------|----------|
| 帖子被点赞 | +1 | post_liked | ✅ 已接入 |
| 评论被点赞 | +1 | comment_liked | ✅ 已接入 |
| 回答被采纳 | +10 | answer_accepted | ✅ 已接入 |
| 帖子被加精 | +20 | post_featured | ❌ 未接入（V1.5 补） |
| 举报被采纳 | +5 | report_accepted | ❌ 未接入（V1.5 补） |
| 违规 | -10~ | violation | ❌ 未接入（V1.5 补） |

- **复用**：`User.honorScore` + `HonorLog` + `adjustHonor()`
- **每日上限**：50（已内置）
- **防重复**：同一 sourceId 不可重复（已内置）

### 3.5 勋章（复用现有）

| 勋章 Key | 名称 | 条件 | category |
|----------|------|------|----------|
| forum_first_post | 初露锋芒 | 发布首篇审核通过的帖子 | forum |
| forum_first_answer | 初次解答 | 回答首次被采纳 | forum |
| forum_featured_author | 精华作者 | 帖子首次被加精 | forum |
| forum_active_30 | 活跃达人 | 30 天内发布 10+ 帖子 | forum |
| forum_helpful_50 | 热心助人 | 累计 50 个点赞 | forum |

- **复用**：`UserBadge` 表 + `UserBadgeAward` + `User.badges` 数组
- **实现**：在对应行为后检查条件，满足则自动授予

### 3.6 贡献值

「贡献值」不新增字段，由 `CommunityStat` 聚合计算：
- `postCount + commentCount + acceptedAnswerCount * 3 + featuredPostCount * 5`
- 只读展示，不可消费

### 3.7 专家认证

- **V1.5 方案（无 Schema 变更）**：管理员通过 `UserBadge` 授予 `forum_expert` 勋章，`UserCommunityProfile.publicTitle` 设为认证头衔
- **V1.6+ 方案（需 Schema）**：`ForumExpertVerification` 模型，记录认证申请、审核、有效期

---

## 四、内容生态

### 4.1 精华帖机制（已存在，补全激励）

```
管理员加精 ──► isFeatured=true
           ├──► adjustHonor(author, +20, "post_featured")
           ├──► addGrowthValue(author, +30, "forum_post_featured")
           ├──► ForumNotification("您的帖子被加精")
           ├──► incrementCommunityStat(featuredPostCount)
           └──► 检查勋章条件
```

- **复用**：`ForumPost.isFeatured` + 管理员 moderate API
- **新增**：在 `feature` action 中补全荣誉值 + 成长值 + 通知

### 4.2 最佳答案（已存在，补全成长值）

```
作者/管理员采纳 ──► isSolved=true, acceptedCommentId=...
                ├──► adjustHonor(commentAuthor, +10, "answer_accepted")  ✅已有
                ├──► addGrowthValue(commentAuthor, +10, "forum_answer_accepted")  ❌新增
                ├──► ForumNotification  ✅已有
                └──► 检查勋章条件  ❌新增
```

### 4.3 问答模式（复用现有字段，不新增 Schema）

- `ForumPost.isSolved` + `acceptedCommentId` 已存在
- `ForumComment.isAccepted` + `floorNumber` 已存在
- **帖子类型区分**：通过 `ForumCategory.key` 区分问答区和讨论区，不新增 `postType` 字段
- **UI 展示**：问答区帖子详情页显示「采纳回答」按钮，已解决帖子显示绿色标记

### 4.4 内容激励汇总

| 触发事件 | 成长值 | 荣誉值 | 通知 | 勋章检查 |
|----------|--------|--------|------|----------|
| 帖子审核通过 | +20 ✅ | - | ✅ | 首帖 |
| 评论审核通过 | +5 ✅ | - | - | - |
| 帖子被点赞 | - | +1 ✅ | ✅ | - |
| 评论被点赞 | - | +1 ✅ | - | - |
| 回答被采纳 | +10 ❌ | +10 ✅ | ✅ | 首答 |
| 帖子被加精 | +30 ❌ | +20 ❌ | ❌ | 精华作者 |
| 举报被采纳 | - | +5 ❌ | ❌ | - |

### 4.5 作者成长

- 作者成长数据已由 V1.3 analytics API 提供（`/api/forum/admin/analytics/authors`）
- V1.5 补充：在用户个人页（`/u/[id]`）展示成长轨迹卡片（等级、荣誉、勋章、社区统计）

---

## 五、社区运营

### 5.1 新人任务

**方案 A（推荐，无 Schema 变更）**：复用 `UserTask` 模型

- 系统在新用户首次访问论坛时自动创建 5 个引导任务：
  1. 完善社区资料（`UserCommunityProfile` 存在且 bio 非空）
  2. 发布首篇帖子
  3. 首次评论
  4. 首次点赞
  5. 浏览社区规则页

- 任务状态通过行为事件自动标记完成
- 完成全部任务授予 `forum_onboarding` 勋章

**方案 B（需 Schema）**：新建 `ForumOnboardingTask` 模型 → 延期

### 5.2 社区活动

**V1.5 不开发**，仅预留设计：

- 社区活动需要活动模型（活动时间、参与条件、奖励规则）
- 若需实现，需新增 `ForumActivity` 表 → 写入 SHARED_CHANGE_REQUESTS
- V1.5 可用 `EventLog` 记录活动期间的参与行为，但不提供活动管理 UI

### 5.3 周榜/月榜

**方案（无 Schema 变更）**：实时聚合 `CommunityStat` + `GrowthLog` + `HonorLog`

| 榜单 | 数据源 | 排序 | 周期 |
|------|--------|------|------|
| 活跃作者榜 | `CommunityStat` (postCount + commentCount) | 降序 | 本周/本月 |
| 贡献榜 | `HonorLog` 聚合 delta 之和 | 降序 | 本周/本月 |
| 成长榜 | `GrowthLog` 聚合 value 之和 | 降序 | 本周/本月 |
| 热心解答榜 | `CommunityStat.acceptedAnswerCount` | 降序 | 累计 |

- **API**：`GET /api/forum/leaderboard?period=week|month&type=active|honor|growth`
- **页面**：`/bbs/leaderboard`（公开，SEO 友好）
- **缓存**：API 层 Cache-Control 1 小时，不建数据库快照表

### 5.4 热门作者

- V1.3 analytics authors API 已提供数据
- V1.5 补充：论坛首页侧边栏显示「本周热门作者」Top 5
- 数据来源：7 天内 `CommunityStat.lastActiveAt` + 发帖/评论数

---

## 六、商业化预留（仅设计，不开发）

### 6.1 专家服务

- 预留：`UserBadge` key = `forum_expert` + `UserCommunityProfile.publicTitle`
- 未来：专家可开通付费咨询服务，帖子可标记为「专家解答」
- **V1.5 不开发**，仅确保专家勋章可被管理员手动授予

### 6.2 资源推荐

- 预留：`ForumPost.relatedTool` 字段已存在（关联工具 slug）
- 未来：帖子底部展示关联工具推荐位
- **V1.5 不开发**

### 6.3 商业合作

- 预留：`AdCampaign` + `AdPlacement` 已存在
- 未来：论坛侧边栏/帖子间插入原生广告
- **V1.5 不开发**

### 6.4 内容权益

- 预留：`User.isPremium` + `User.membershipTier` 已存在
- 未来：精华内容/专家解答可设为会员可见
- **V1.5 不开发**，仅确保不加付费墙

---

## 七、用户流程

### 7.1 新用户成长流程

```
注册 ──► 首次访问 /bbs
  │
  ├── 看到新人引导（CommunityOnboarding，已存在）
  ├── 系统创建 5 个新人任务
  │
  ├── 完善资料 ──► UserCommunityProfile 创建 ──► 任务1完成
  ├── 发布帖子 ──► 审核通过 ──► +20 成长值 ──► 任务2完成 ──► 检查首帖勋章
  ├── 发表评论 ──► 审核通过 ──► +5 成长值 ──► 任务3完成
  ├── 点赞帖子 ──► 任务4完成
  └── 浏览规则 ──► 任务5完成
                    └──► 全部完成 ──► 授予 forum_onboarding 勋章
```

### 7.2 内容创作者激励流程

```
发布帖子 ──► 审核通过 ──► +20 成长值
                         │
    ┌────────────────────┤
    │                    │
  被点赞               被加精
  +1 荣誉值            +20 荣誉值 +30 成长值
  +1 通知              +1 通知
                       │
                  检查精华作者勋章
                  CommunityStat.featuredPostCount++
```

### 7.3 问答解答者流程

```
看到问题帖 ──► 发表评论（回答）
               │
         审核通过 ──► +5 成长值
               │
         帖子作者采纳
               │
         +10 荣誉值 +10 成长值
         +1 通知
         CommunityStat.acceptedAnswerCount++
         检查首答勋章
```

### 7.4 管理员运营流程

```
/bbs/operations
  │
  ├── 内容质量巡检（V1.4，已存在）
  ├── 排行榜查看 ──► /bbs/leaderboard
  ├── 激励发放审计 ──► 查看荣誉/成长值变动日志
  └── 勋章管理 ──► 手动授予/撤销勋章
```

---

## 八、页面规划

| 页面 | 路由 | 类型 | MVP? | 说明 |
|------|------|------|------|------|
| 排行榜 | `/bbs/leaderboard` | 公开 | ✅ | 周/月榜，活跃/贡献/成长 |
| 用户成长卡 | `/u/[id]` 增强 | 公开 | ✅ | 等级+荣誉+勋章+社区统计 |
| 新人任务 | `/bbs/my-posts` 内嵌 | 登录 | ✅ | 任务进度条 |
| 勋章展示 | `/bbs/my-posts` 内嵌 | 登录 | ✅ | 已获勋章列表 |
| 激励日志 | `/bbs/admin` 增强 | 管理员 | ✅ | 荣誉/成长值变动审计 |
| 勋章管理 | `/bbs/admin/badges` | 管理员 | 延期 | 手动授予/撤销 |
| 社区活动 | `/bbs/activities` | 公开 | 延期 | 需 Schema |
| 专家认证 | `/bbs/experts` | 公开 | 延期 | 需 Schema |

---

## 九、API 规划

### 9.1 MVP API（新增）

| API | 方法 | 权限 | 说明 |
|-----|------|------|------|
| `/api/forum/leaderboard` | GET | 公开 | 排行榜（period, type 参数） |
| `/api/forum/my-badges` | GET | 登录 | 当前用户已获勋章列表 |
| `/api/forum/onboarding-tasks` | GET | 登录 | 新人任务进度 |
| `/api/forum/admin/growth-audit` | GET | 管理员 | 成长值/荣誉值变动日志 |

### 9.2 修改的现有 API

| API | 修改内容 |
|-----|----------|
| `POST /api/forum/admin/moderate` (action=feature) | 补全荣誉值+成长值+通知 |
| `POST /api/forum/posts/[slug]/accept` | 补全成长值+勋章检查 |
| `POST /api/forum/admin/reports` (action=resolve) | 补全举报人荣誉值 |
| `GET /api/community/user/[id]` | 返回勋章+社区统计+成长轨迹 |

### 9.3 延期 API

| API | 说明 |
|-----|------|
| `/api/forum/admin/badges` | 勋章管理（授予/撤销） |
| `/api/forum/activities` | 社区活动 |
| `/api/forum/experts` | 专家认证 |

---

## 十、Schema 影响

### 10.1 不需要 Schema 变更的部分

| 能力 | 复用方式 |
|------|----------|
| 等级 | `User.levelKey` + `UserLevel` 表 |
| 成长值 | `User.growthValue` + `GrowthLog` |
| 荣誉值 | `User.honorScore` + `HonorLog` |
| 勋章 | `UserBadge` + `UserBadgeAward` + `User.badges` |
| 社区统计 | `CommunityStat` |
| 新人任务 | `UserTask` |
| 排行榜 | 实时聚合，无新表 |
| 精华帖 | `ForumPost.isFeatured` |
| 最佳答案 | `ForumPost.isSolved` + `acceptedCommentId` |
| 专家认证 | `UserBadge` (key=forum_expert) + `UserCommunityProfile.publicTitle` |

### 10.2 需要 Schema 变更（本版不执行，写入 SHARED_CHANGE_REQUESTS）

| 变更 | 原因 | 优先级 |
|------|------|--------|
| `ForumActivity` 模型 | 社区活动/主题活动 | P2 |
| `ForumExpertVerification` | 专家认证审核流程 | P3 |
| `ForumPost.postType` | 帖子类型区分（问答/讨论/分享） | P3 |
| `RewardRule.trigger` 扩展 | 论坛事件触发自动奖励 | P2 |

### 10.3 DATABASE_GAPS

```
# 论坛 V1.5 Schema 缺口
- ForumActivity 模型（社区活动）→ 延期
- ForumExpertVerification 模型（专家认证）→ 延期
- ForumPost.postType 字段（帖子类型）→ 延期，暂用 ForumCategory.key 区分
- RewardRule.trigger 论坛事件扩展 → 延期，暂用代码内 if-else
```

---

## 十一、MVP 优先级

### Phase 1: 激励闭环（MVP 核心）

| 序号 | 任务 | 依赖 | 工作量 |
|------|------|------|--------|
| 1 | 加精时补全荣誉值+成长值+通知 | 修改 moderate API | 小 |
| 2 | 采纳回答时补全成长值+勋章检查 | 修改 accept API | 小 |
| 3 | 举报处理时补全举报人荣誉值 | 修改 reports API | 小 |
| 4 | CommunityStat 同步补全 | 检查所有写入点 | 中 |
| 5 | 论坛勋章定义+自动授予逻辑 | 新增 lib + seed 数据 | 中 |

### Phase 2: 用户可见层

| 序号 | 任务 | 依赖 | 工作量 |
|------|------|------|--------|
| 6 | 用户个人页成长轨迹卡片 | 复用 UserTrustCard | 中 |
| 7 | 排行榜页面+API | 新增页面+API | 中 |
| 8 | 新人任务系统 | 复用 UserTask | 中 |
| 9 | 勋章展示页 | 新增组件 | 小 |

### Phase 3: 运营增强

| 序号 | 任务 | 依赖 | 工作量 |
|------|------|------|--------|
| 10 | 激励发放审计日志页 | 复用 GrowthLog/HonorLog | 小 |
| 11 | 论坛首页热门作者侧边栏 | 复用 analytics authors | 小 |

---

## 十二、延期清单

| 功能 | 延期原因 | 预计版本 |
|------|----------|----------|
| 社区活动系统 | 需要 `ForumActivity` 模型 | V1.6 |
| 专家认证流程 | 需要 `ForumExpertVerification` 模型 | V1.6 |
| 帖子类型字段 | 需要 `ForumPost.postType` migration | V1.6 |
| 奖励规则联动 | 需要 `RewardRule.trigger` 扩展 | V1.6 |
| 勋章管理后台 | 需要管理员手动授予 UI | V1.5 Phase 3 |
| 商业化功能 | 仅设计预留 | V2.0+ |

---

## 十三、测试规划

| 测试类型 | 覆盖范围 |
|----------|----------|
| 激励闭环 | 加精→荣誉+成长+通知+勋章 |
| 采纳回答 | 采纳→成长值+荣誉值+勋章检查 |
| 举报处理 | 举报采纳→举报人荣誉值 |
| 排行榜 | 周榜/月榜排序正确性 |
| 新人任务 | 任务创建+自动完成+勋章授予 |
| 勋章自动授予 | 首帖/首答/精华作者/活跃达人 |
| 权限校验 | 管理员 API 三层校验 (401/403/200) |
| 幂等性 | 同一来源不可重复发放 |
| 隐私 | 排行榜不泄露邮箱/IP |

---

## 十四、验收标准

- [ ] 激励闭环：加精/采纳/举报处理触发成长值+荣誉值+通知
- [ ] 勋章系统：5 个论坛勋章可自动授予
- [ ] 排行榜：周/月榜可正确排序
- [ ] 新人任务：5 个任务可创建+自动完成
- [ ] 用户成长卡：等级+荣誉+勋章+统计在个人页可见
- [ ] 管理员审计：荣誉/成长值变动可追溯
- [ ] 全量测试 passed，0 failed
- [ ] build exit=0
- [ ] staging 页面截图
- [ ] 权限三层验证

---

## 十五、禁止事项

- ❌ 不修改 prisma/schema.prisma
- ❌ 不执行 migration / db push / seed
- ❌ 不修改 Workspace / ContentOps / Hermes Gateway
- ❌ 不触碰 production
- ❌ 不自动处罚用户
- ❌ 不记录正文/IP/Cookie/Token
- ❌ 不接入第三方分析 SDK
- ❌ 不新增 npm 依赖

---

## 确认请求

请确认以下内容后开始开发：

1. **MVP 范围**：Phase 1 (激励闭环) + Phase 2 (用户可见层) 是否合适？
2. **勋章定义**：5 个论坛勋章（首帖/首答/精华作者/活跃达人/热心助人）是否需要调整？
3. **排行榜**：实时聚合方案（无 Schema 变更）是否可接受？
4. **新人任务**：复用 `UserTask` 模型方案是否可接受？
5. **延期项**：社区活动/专家认证/帖子类型/奖励规则联动 延期至 V1.6 是否可接受？

等待确认后开始 Phase 1 开发。
