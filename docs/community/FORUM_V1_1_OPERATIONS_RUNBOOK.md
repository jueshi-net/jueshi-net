# Forum V1.1 Operations Runbook

> **Version:** V1.1
> **Last Updated:** 2026-07-16
> **Branch:** `feature/forum-v1-1-operations-hardening`

---

## 1. 日常审核流程

### 1.1 审核入口

- 管理员工作台：`/bbs/admin`
- 审核 API：`GET /api/forum/admin/pending`
- 支持筛选：status、category、author、date range、keyword

### 1.2 审核步骤

1. 登录管理员账号
2. 访问 `/bbs/admin` → 进入审核队列
3. 逐条审核 pending 帖子：
   - 检查标题合规性
   - 检查内容是否包含违规信息
   - 检查外链安全性（最多 5 个）
   - 检查是否有重复内容
4. 执行审核动作：
   - **通过** (`accept`)：帖子状态变为 `published`，进入公开列表
   - **驳回** (`reject`)：填写驳回原因，用户可在"我的帖子"查看原因并修改
5. 审核操作自动写入 `ModerationLog`

### 1.3 审核标准

| 内容类型 | 处理方式 |
|---------|---------|
| 正常讨论 | 通过 |
| 标题党/夸张 | 驳回，要求修改标题 |
| 纯广告 | 驳回 |
| 色情/暴力 | 驳回 + 标记违规 |
| 外链过多 (>5) | 驳回，提示减少外链 |
| 超长连续字符 | 驳回，提示修改格式 |
| 重复发帖 | 驳回最新帖，保留最早帖 |

### 1.4 审核判断参考

参见管理面板中的「内容治理帮助」模块，包含：
- 审核判断参考
- 举报处理建议
- 外链风险提示
- 常见违规示例
- 操作不可逆提醒

---

## 2. 举报处理流程

### 2.1 举报入口

- 用户举报：帖子详情页或评论区的"举报"按钮
- 管理员处理：`/bbs/admin` → 举报管理
- 举报 API：`GET /api/forum/admin/reports`

### 2.2 处理步骤

1. 查看举报详情（原因、描述、举报人）
2. 查看被举报内容（帖子或评论）
3. 判断举报是否成立：
   - **成立** (`action_taken`)：对内容执行隐藏/删除，举报人收到处理结果通知
   - **不成立** (`no_action`)：关闭举报，内容保持可见
4. 处理后自动发送 `report_resolved` 通知给举报人
5. 举报处理写入 `ModerationLog`

### 2.3 举报频率限制

- 同一用户对同一帖子/评论只能举报一次（`@@unique([reporterId, postId])`）
- 举报人不能举报自己的内容
- 已处理的举报不能重复处理

---

## 3. 异常用户处理

### 3.1 当前能力（无 Schema 变更）

目前无法实现 ban/mute 功能（需要 `ForumUserRestriction` 模型，见 RFC）。

当前可用的替代措施：
- **隐藏帖子**：`hide` 操作使帖子对公众不可见
- **删除评论**：将评论状态设为 `deleted`
- **通过 HonorLog 扣分**：`sourceType: 'violation'`，delta 为负数
- **提高 violationCount**：`CommunityStat.violationCount + 1`

### 3.2 RFC 批准后的能力

Schema 升级后（参见 `FORUM_V1_SCHEMA_UPGRADE_RFC.md`）：
- 临时禁言（mute）：阻止发帖和评论，到期自动解除
- 永久封禁（ban）：阻止所有互动
- 完整审计链：谁在何时为何封禁/解除

### 3.3 紧急处理

紧急情况下：
1. 隐藏该用户所有违规帖子
2. 删除违规评论
3. 在 `CommunityStat` 中增加 `violationCount`
4. 记录 `HonorLog` 违规扣分
5. 通知 default Hermes 手动处理用户状态

---

## 4. 内容冷启动

### 4.1 种子内容策略

新社区需要种子内容来吸引用户参与：

1. **创建示例帖子**：管理员以官方账号发帖
   - 每个分类至少 3-5 个种子帖子
   - 覆盖常见问题、使用指南、经验分享
2. **设置精华帖子**：将高质量种子帖设为 `isFeatured`
3. **置顶重要帖子**：将引导性帖子设为 `isPinned`
4. **创建常见标签**：如 `shipping`、`customs`、`life` 等

### 4.2 冷启动数据来源

- 官方 FAQ 和帮助文档
- 常见物流问题
- 海外生活经验
- 工具使用教程

### 4.3 冷启动指标监控

- 分类帖子数量（通过 `/api/forum/admin/category-health`）
- 空分类数量
- 无回复帖子数量
- 草稿转提交比例

---

## 5. 分类运营

### 5.1 分类健康度检查

通过 `/api/forum/admin/category-health` API 获取：

| 指标 | 说明 |
|------|------|
| `postCount` | 已发布帖子数 |
| `pendingCount` | 待审核帖子数 |
| `totalViews` | 总浏览量 |
| `totalComments` | 总评论数 |
| `avgViewsPerPost` | 平均每帖浏览量 |
| `latestPostAt` | 最近发帖时间 |
| `isEmpty` | 是否为空分类 |
| `isStale` | 是否长期无更新 (>30天) |
| `isActive` | 是否活跃 (7天内有新帖) |
| `suggestion` | 冷启动建议 |
| `hotPost` | 该分类最热帖子 |

### 5.2 运营策略

| 状态 | 策略 |
|------|------|
| 空分类 | 创建种子内容，邀请活跃用户发首帖 |
| 长期无更新 | 推送相关话题或置顶优质旧帖 |
| 互动不足 | 优化标题或添加标签提升可发现性 |
| 健康运营 | 保持监控 |

---

## 6. 数据观察

### 6.1 社区健康度指标

通过 `/api/forum/admin/health` API 获取：

| 指标 | 统计口径 |
|------|---------|
| 审核通过率 | 近30天审核操作日志 |
| 驳回率 | 近30天审核操作日志 |
| 举报处理率 | 近30天举报处理数/总数 |
| 平均审核等待时间 | 近7天帖子创建到审核的时间差 |
| 今日活跃作者 | 24h内发帖或评论的唯一用户 |
| 无回复帖子 | 已发布3天+评论数=0 |
| 长期未处理举报 | 7天+仍pending |
| 草稿转提交比例 | 近30天提交/(草稿+提交) |

### 6.2 推荐效果监控

通过 `/api/forum/trending` API 获取：
- 今日热门（24h）
- 本周热门（7d）
- 最多回复
- 精华内容
- 待回答
- 贡献者榜单

推荐评分公式：
```
score = (views*1 + comments*5 + likes*3 + bookmarks*4 + featured*30 + pinned*50) * timeDecay
```

时间衰减公式：
```
decay = 1 / (1 + max(0, ageDays - 3) / 7)
```

---

## 7. SEO 监控

### 7.1 结构化数据

仅 `published` 状态的帖子输出 JSON-LD：
- `DiscussionForumPosting`
- `BreadcrumbList`
- `ProfilePage`

draft/pending/rejected/hidden/private preview 不输出公开结构化数据。

### 7.2 Sitemap 规则

- `published` 帖子纳入 sitemap
- `draft`/`pending`/`rejected`/`hidden` 不纳入 sitemap
- 被锁定帖子仍在 sitemap 中（内容可见）
- 版本历史页面不纳入 sitemap（noindex）

### 7.3 检查项

- [ ] Google Search Console 无错误
- [ ] 结构化数据验证通过
- [ ] Sitemap 可正常访问
- [ ] robots.txt 正确阻止非公开页面
- [ ] canonical URL 正确

---

## 8. 日志排障

### 8.1 日志格式

统一 API 错误日志格式：
```
[Forum API Error] requestId=req_xxx prismaCode=P2002 message=...
```

### 8.2 常见问题排查

| 问题 | 排查方向 |
|------|---------|
| 帖子加载缓慢 | 检查 N+1 查询、大 offset 分页 |
| 搜索超时 | 检查查询长度限制、索引状态 |
| 通知不显示 | 检查 ForumNotification 表、通知 API |
| 审核失败 | 检查 ModerationLog、权限验证 |
| 举报无法提交 | 检查 unique 约束、自我举报限制 |

### 8.3 错误分类

| 错误码 | HTTP | 含义 |
|--------|------|------|
| BAD_REQUEST | 400 | 参数错误 |
| UNAUTHORIZED | 401 | 未登录 |
| FORBIDDEN | 403 | 权限不足 |
| NOT_FOUND | 404 | 内容不存在 |
| CONFLICT | 409 | 重复操作 |
| RATE_LIMITED | 429 | 操作过频 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |
| DATABASE_ERROR | 500 | 数据库错误（不伪装为 404） |
| TIMEOUT | 504 | 请求超时 |

---

## 9. 紧急隐藏内容

### 9.1 紧急隐藏帖子

```bash
# 通过 API 隐藏帖子（需要管理员 token）
curl -X POST https://i.jueshi.net/api/forum/admin/moderate \
  -H "Content-Type: application/json" \
  -d '{"postId": "<post-id>", "action": "hide", "reason": "紧急隐藏：违规内容"}'
```

### 9.2 紧急隐藏评论

```bash
# 通过 API 隐藏评论
curl -X POST https://i.jueshi.net/api/forum/admin/moderate \
  -H "Content-Type: application/json" \
  -d '{"commentId": "<comment-id>", "action": "hide_comment", "reason": "违规评论"}'
```

### 9.3 批量隐藏

通过 `/bbs/admin` 页面的批量操作功能。

### 9.4 恢复隐藏内容

```bash
# 恢复帖子
curl -X POST https://i.jueshi.net/api/forum/admin/moderate \
  -H "Content-Type: application/json" \
  -d '{"postId": "<post-id>", "action": "restore", "reason": "审核后恢复"}'
```

---

## 10. 上线回滚说明

### 10.1 回滚前提

- 论坛功能是增量式的，回滚不影响其他系统
- 数据库变更（未执行 migration）无需回滚
- 仅需回退应用代码

### 10.2 回滚步骤

1. **代码回退**：
   ```bash
   # 在服务器上
   cd /home/deploy/xixiong-saas-staging  # 或 production path
   git log --oneline -10  # 找到上一个稳定版本
   git reset --hard <stable-commit>
   pnpm build
   pm2 restart xixiong-staging  # 或 xixiong-saas
   ```

2. **验证**：
   - 访问 `/bbs` 确认页面加载
   - 访问 `/api/forum/posts` 确认 API 响应
   - 检查管理页面是否正常

3. **数据库回滚**（仅 Schema 升级后需要）：
   ```bash
   # 执行回滚 SQL（见 docs/community/rollback_draft.sql）
   # 仅在已执行 migration 的情况下需要
   ```

### 10.3 回滚检查清单

- [ ] 论坛首页可正常访问
- [ ] 帖子列表和详情页正常
- [ ] 发帖和评论功能正常
- [ ] 管理员页面可访问
- [ ] 无 JavaScript 控制台错误
- [ ] PM2 进程正常运行
- [ ] 数据库连接正常

### 10.4 紧急联系人

- Forum Agent：通过 Hermes 平台
- Default Hermes：负责 staging/production 部署
- 数据库：Default Hermes 处理

---

## 11. 性能基线

### 11.1 已知性能特征

| 操作 | 预期响应时间 | 备注 |
|------|------------|------|
| 首页加载 | < 2s | 含分类和帖子列表 |
| 帖子详情 | < 1.5s | 含评论和结构化数据 |
| 搜索 | < 2s | 含相关性排序 |
| 通知列表 | < 1s | 分页 20 条 |
| 管理审核队列 | < 2s | 含关联查询 |
| 趋势 API | < 1.5s | 含评分计算 |

### 11.2 性能优化要点

- 避免 N+1：使用 `include` 一次性加载关联
- 大分页优化：限制 `pageSize` 最大值
- 搜索安全：限制查询长度（100字符）
- 索引利用：确保 `status`、`categoryId`、`createdAt` 索引被使用
- 不新增缓存依赖：除非先提交必要性说明

---

## 附录 A: API 端点清单

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/forum/posts` | GET, POST | 帖子列表和创建 |
| `/api/forum/posts/[slug]` | GET, PUT | 帖子详情和编辑 |
| `/api/forum/posts/[slug]/comments` | GET, POST | 评论列表和创建 |
| `/api/forum/posts/[slug]/like` | POST | 点赞/取消 |
| `/api/forum/posts/[slug]/bookmark` | POST | 收藏/取消 |
| `/api/forum/posts/[slug]/report` | POST | 举报 |
| `/api/forum/posts/[slug]/accept` | POST | 采纳评论 |
| `/api/forum/trending` | GET | 推荐和榜单 |
| `/api/forum/search` | GET | 增强搜索 |
| `/api/forum/categories` | GET | 分类列表 |
| `/api/forum/notifications` | GET, POST | 通知 |
| `/api/forum/admin/pending` | GET | 待审核列表 |
| `/api/forum/admin/filtered` | GET | 筛选列表 |
| `/api/forum/admin/reports` | GET | 举报列表 |
| `/api/forum/admin/moderate` | POST | 管理操作 |
| `/api/forum/admin/health` | GET | 健康度 |
| `/api/forum/admin/category-health` | GET | 分类运营 |
| `/api/forum/admin/export` | GET | CSV 导出 |
| `/api/forum/admin/operations-todo` | GET | 运营待办 |

## 附录 B: 已知限制

- ban/mute 需要 Schema 升级（RFC 已完成）
- 楼中楼需要 Schema 升级（RFC 已完成）
- 完整版本历史需要新模型（RFC 已完成）
- 当前评论为扁平结构
- 风险评分不自动处罚
- 无第三方搜索服务（使用 Prisma 查询）
