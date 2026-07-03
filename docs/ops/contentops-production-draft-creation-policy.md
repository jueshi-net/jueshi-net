# ContentOps Production Draft 创建开关策略

## 概述

Production draft 创建默认关闭，需要满足严格条件才允许启用。

**核心原则**:
- 默认关闭（`CONTENTOPS_DRAFT_ALLOW_PRODUCTION=false`）
- 需要显式启用
- 需要用户明确确认
- 命令中不允许 published
- 创建结果必须是 draft
- 返回后台审核链接
- audit log 记录 production=true

## 开关配置

### 环境变量

```bash
# .env.production
CONTENTOPS_DRAFT_ALLOW_PRODUCTION=false  # 默认关闭
```

### 启用条件

只有同时满足以下条件才允许启用：

1. ✅ 用户明确要求启用 production draft 创建
2. ✅ 用户理解风险并签署确认
3. ✅ 设置 `CONTENTOPS_DRAFT_ALLOW_PRODUCTION=true`
4. ✅ 配置 `CONTENTOPS_ALLOWED_CHAT_IDS` 限制允许的用户
5. ✅ 配置 audit log 监控和报警

## 安全特性

### 1. 默认关闭

```typescript
const CONFIG = {
  allowProduction: process.env.CONTENTOPS_DRAFT_ALLOW_PRODUCTION === 'true',
  // ...
};
```

### 2. 用户明确确认

创建 draft 时需要用户发送 `/confirm` 命令：

```typescript
// 第一次请求：返回 dry-run 摘要
if (commandName === 'create-draft' && !userConfirmed) {
  return {
    dryRun: true,
    message: `即将创建 draft：

类型: ${args.type}
Slug: ${args.payload?.slug}
标题: ${args.payload?.title}
Production: ${args.production ? '是' : '否（staging only）'}

请回复 /confirm 确认创建，或 /cancel 取消。
（确认有效期 10 分钟）`,
    pendingConfirmation: true
  };
}
```

### 3. 命令中不允许 Published

```typescript
// 检查 payload 中的 status
if (args.payload?.status === 'published') {
  throw new Error('Status "published" is not allowed. Only "draft" is allowed.');
}
```

### 4. 创建结果必须是 Draft

```typescript
// 强制设置 status=draft
args.payload.status = 'draft';
```

### 5. 返回后台审核链接

```typescript
return {
  draftId: result.draftId,
  slug: args.payload.slug,
  adminEditUrl: `https://jueshi.net/admin/content/${args.type}s/${result.draftId}/edit`,
  previewUrl: `https://jueshi.net/${args.type}s/${args.payload.slug}?preview=true`,
  message: `Draft 创建成功！

Draft ID: ${result.draftId}
Slug: ${args.payload.slug}
类型: ${args.type}

编辑链接: ${adminEditUrl}
Preview: ${previewUrl}

请登录后台审核内容并手动发布。`
};
```

### 6. Audit Log 记录 Production=true

```typescript
writeAuditLog({
  timestamp: new Date().toISOString(),
  chatIdHash,
  command: commandName,
  contentType: args.type,
  slug: args.payload?.slug,
  draftId: result.draftId,
  dryRun: args.dryRun || false,
  production: args.production || false,  // 记录是否为 production
  result: 'success',
  error: null,
  rateLimitStatus: 'ok'
});
```

## 使用流程

### 1. 启用 Production Draft 创建

```bash
# 在 production 服务器上
export CONTENTOPS_DRAFT_ALLOW_PRODUCTION=true
export CONTENTOPS_ALLOWED_CHAT_IDS=123456789  # 限制允许的用户
pm2 restart contentops-bot
```

### 2. 用户创建 Production Draft

**用户发送**:
```
/create-draft {"type":"checklist","payload":{"slug":"student-pre-departure-checklist","title":"留学行前准备清单","production":true,"metadataJson":{...}}}
```

**Bot 响应**:
```
即将创建 draft：

类型: checklist
Slug: student-pre-departure-checklist
标题: 留学行前准备清单
Production: 是

请回复 /confirm 确认创建，或 /cancel 取消。
（确认有效期 10 分钟）
```

**用户确认**:
```
/confirm
```

**Bot 响应**:
```
Draft 创建成功！

Draft ID: contentops-cli-e2e-test-001
Slug: student-pre-departure-checklist
类型: checklist

编辑链接: https://jueshi.net/admin/content/checklists/contentops-cli-e2e-test-001/edit
Preview: https://jueshi.net/checklists/student-pre-departure-checklist?preview=true

请登录后台审核内容并手动发布。
```

### 3. Audit Log 记录

```json
{
  "timestamp": "2026-06-16T10:30:00.000Z",
  "chatIdHash": "a1b2c3d4",
  "userDisplayName": "澈陈",
  "command": "create-draft",
  "contentType": "checklist",
  "slug": "student-pre-departure-checklist",
  "draftId": "contentops-cli-e2e-test-001",
  "dryRun": false,
  "production": true,
  "result": "success",
  "error": null,
  "rateLimitStatus": "ok"
}
```

## 安全审计

### 每日检查

- [ ] 检查 audit log 中 production=true 的记录
- [ ] 检查是否有异常创建
- [ ] 检查 rate limit 触发次数

### 每周检查

- [ ] 审查 production draft 创建频率
- [ ] 审查用户行为
- [ ] 审查错误率

### 每月检查

- [ ] 评估是否需要继续启用 production draft 创建
- [ ] 审查安全策略
- [ ] 更新白名单

## 故障恢复

### 立即禁用 Production Draft 创建

```bash
# 在 production 服务器上
export CONTENTOPS_DRAFT_ALLOW_PRODUCTION=false
pm2 restart contentops-bot
```

### 回滚操作

如果创建了错误的 production draft：

```bash
# 1. 找到 draft
scripts/list-contentops-drafts.ts --status=draft

# 2. 手动删除（需要 admin 权限）
psql $DATABASE_URL -c "DELETE FROM checklists WHERE slug='error-slug'"
psql $DATABASE_URL -c "DELETE FROM guides WHERE slug='error-slug'"
psql $DATABASE_URL -c "DELETE FROM topics WHERE slug='error-slug'"
```

**注意**: 删除操作必须由人工执行，bot 不得有删除权限。

## 总结

Production draft 创建策略：

- ✅ 默认关闭
- ✅ 需要显式启用
- ✅ 需要用户明确确认
- ✅ 命令中不允许 published
- ✅ 创建结果必须是 draft
- ✅ 返回后台审核链接
- ✅ audit log 记录 production=true
- ✅ 可以立即禁用
- ✅ 删除操作必须由人工执行
