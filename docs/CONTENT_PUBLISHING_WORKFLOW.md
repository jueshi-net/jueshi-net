# Content Publishing Workflow — v1.20.42.18.6.6.5

## 适用内容
文章、专题、清单、FAQ、官方资源、国家页模块、社区置顶、广告位、工具说明文案

## 发布流程

```
1. 用户选题
2. Hermes Dev 生成草稿 (staging)
3. 草稿进入 i.jueshi.net 预览
4. 用户确认
5. Hermes Ops 或后台发布到 production
6. 发布后 smoke test
7. 记录发布报告
```

## 内容状态

| 状态 | 说明 |
|------|------|
| draft | Hermes Dev 生成中 |
| review | 草稿已提交 staging 预览 |
| scheduled | 用户确认，等待发布 |
| published | 已发布到 production |
| archived | 已下线 |

## 规则
- 内容发布优先走后台数据，不应频繁改代码
- 未确认内容不得直接进 production
- staging 内容不得自动同步到 production
- 需要由用户确认具体发布动作
- Hermes 可以提出标题、SEO、结构优化建议，但不能擅自发布正式内容
