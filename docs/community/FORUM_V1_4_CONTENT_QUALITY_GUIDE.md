# Forum V1.4 - 内容质量与运营指南

> 生成时间：V1.4 Content Quality & Operations
> 基线分支：feature/forum-v1-4-content-quality
> 最后更新：2026-07-19

## 概述

V1.4 为论坛管理员提供内容质量巡检能力，帮助识别需要关注和维护的内容。所有检查均为只读，不自动修改任何帖子或分类。

## 质量检查类型

| 类型 | 严重度 | 说明 |
|------|--------|------|
| `broken_link` | warning/info | 帖子中的外链返回 4xx/5xx |
| `expired_content` | warning/info | 超过 180 天的时效性帖子 |
| `duplicate_topic` | warning | 标题相似的重复帖子 |
| `no_reply` | warning/info | 超过 7 天无评论的帖子 |
| `stale_pinned` | info | 超过 30 天无活动的置顶帖 |
| `edit_suggestion` | info | 缺少摘要/标签或内容过短 |
| `feature_candidate` | opportunity | 高互动但未加精的帖子 |

## 检查口径

### 过期内容检测
- **范围**：已发布帖子，创建时间超过 180 天
- **条件**：内容包含时效性信号（年份、"最新"、"截止"等）或超过 365 天
- **数据来源**：`ForumPost.createdAt`, `ForumPost.updatedAt`, `ForumPost.content`
- **限制**：无法判断内容是否实际过时，仅提示可能需要检查

### 重复主题识别
- **范围**：全部已发布帖子（最多 500 篇）
- **方法**：标题分词后计算 Jaccard 相似度
- **阈值**：相似度 ≥ 0.6 视为重复
- **分词规则**：
  - 中文：按 2-gram（二元组）切分
  - 英文：按空格分词，去除停用词
  - 标点：全部去除
- **限制**：不检查正文内容相似度，仅标题级别

### 无回复内容
- **范围**：已发布帖子，评论数为 0
- **条件**：创建时间超过 7 天且未锁定
- **严重度**：超过 30 天为 warning，否则为 info

### 精华候选建议
- **条件**：评论 ≥ 3 且浏览 ≥ 20 且未加精且未置顶
- **排序**：评论数降序，浏览数降序
- **限制**：仅建议，不自动加精

### 编辑建议
- **检查项**：
  - 内容长度 < 50 字符
  - 缺少摘要（excerpt）
  - 无标签
  - 外链超过 5 个

### 失效链接检查
- **范围**：包含 "http" 的已发布帖子（最多 50 篇）
- **方法**：对每个外链发送 HEAD 请求，5 秒超时
- **报告**：返回 4xx/5xx 的链接
- **限制**：
  - 默认不执行（需 `brokenLinks=1` 参数）
  - 每帖最多检查 5 个链接
  - 网络错误不报告为失效（可能是临时问题）

## API 端点

### 内容质量报告

```
GET /api/forum/admin/content-quality
```

**参数**：
- `brokenLinks=1` - 启用失效链接检查（默认关闭）
- `maxBrokenChecks=50` - 失效链接检查最大帖数
- `expiredDays=180` - 过期内容天数阈值
- `noReplyDays=7` - 无回复天数阈值
- `dupThreshold=0.6` - 重复标题相似度阈值

**响应**：
```json
{
  "success": true,
  "report": {
    "generatedAt": "2026-07-19T...",
    "summary": {
      "totalIssues": 15,
      "byType": {
        "expired_content": 3,
        "broken_link": 2,
        "duplicate_topic": 1,
        "no_reply": 5,
        "feature_candidate": 2,
        "edit_suggestion": 1,
        "stale_pinned": 1
      },
      "bySeverity": {
        "critical": 0,
        "warning": 8,
        "info": 5,
        "opportunity": 2
      },
      "postsInspected": 100
    },
    "issues": [...]
  }
}
```

### 维护队列

```
GET /api/forum/admin/content-quality/queue
```

返回按优先级排序的维护队列。

**优先级排序**：
1. `broken_link`（最高优先级）
2. `expired_content`
3. `duplicate_topic`
4. `no_reply`
5. `stale_pinned`
6. `edit_suggestion`
7. `feature_candidate`（最低优先级）

同类型内按严重度排序：critical > warning > info > opportunity

## 隐私规则

- 不记录用户邮箱、密码、Token、Cookie
- 不记录 IP 地址（不选择 `ipHash` 字段）
- 不记录帖子正文内容到 metadata
- 失效链接检查使用 HEAD 请求，不下载页面内容
- 所有操作为只读，不写入 ModerationLog

## 不应如何使用

1. **不要自动修改帖子**：质量报告仅供参考，不自动删除、隐藏或编辑帖子
2. **不要自动取消置顶**：stale_pinned 提示置顶帖无活动，但取消置顶需管理员手动操作
3. **不要将质量报告用于处罚**：质量报告不是用户违规的证据
4. **不要将重复检测视为抄袭**：标题相似可能是正常讨论，需人工判断
5. **不要将失效链接视为内容删除**：链接可能临时不可用，需二次确认

## 数据限制

- 过期内容检测无法判断内容是否实际过时
- 重复主题检测仅基于标题，不检查正文
- 失效链接检查受网络条件影响
- 编辑建议为启发式规则，可能有误报
- 维护队列不持久化，每次请求重新计算
