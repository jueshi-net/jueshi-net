# ContentOps Telegram Bot Security Lockdown

**版本**: v1.20.42.18.6.16.6.83.3  
**日期**: 2026-07-03  
**状态**: SECURE

---

## 安全配置要求

### 1. 禁止 GATEWAY_ALLOW_ALL_USERS=true

**必须**:
- ✅ `GATEWAY_ALLOW_ALL_USERS=false`
- ✅ 配置 `TELEGRAM_ALLOWED_USERS=<chatId>`
- ✅ 配置 `CONTENTOPS_TELEGRAM_ALLOWED_CHAT_IDS=<chatId>`

**禁止**:
- ❌ `GATEWAY_ALLOW_ALL_USERS=true`
- ❌ 不配置用户白名单

### 2. 禁止 secret redaction=false

**必须**:
- ✅ `security.redact_secrets=true`
- ✅ 所有日志和输出都经过脱敏处理

**禁止**:
- ❌ `security.redact_secrets=false`
- ❌ 在日志中输出真实 token

### 3. 启动前必须配置 allowed chat ids

**必须**:
- ✅ 在 `.env` 中配置 `TELEGRAM_ALLOWED_USERS=<chatId>`
- ✅ 在 `.env` 中配置 `CONTENTOPS_TELEGRAM_ALLOWED_CHAT_IDS=<chatId>`
- ✅ 在 `config.yaml` 中配置 `gateway.allowed_users: [<chatId>]`
- ✅ 在 `config.yaml` 中配置 `gateway.platforms.telegram.allowed_chat_ids: [<chatId>]`

**禁止**:
- ❌ 不配置 allowed chat ids
- ❌ 使用空数组 `[]`

### 4. Token 泄露后必须 rotate

**如果发生以下情况，必须立即 rotate token**:
- Token 出现在日志中
- Token 出现在代码提交中
- Token 出现在公开文档中
- Token 被分享给未授权用户

**Rotate 步骤**:
1. 在 Telegram 中搜索 `@BotFather`
2. 发送 `/revoke`
3. 选择对应的 bot
4. 获取新 token
5. 更新 `.env` 文件
6. 重启 gateway

### 5. Production draft 默认关闭

**必须**:
- ✅ `CONTENTOPS_DRAFT_ALLOW_PRODUCTION=false`
- ✅ 需要用户明确确认才能创建 production draft
- ✅ 创建结果必须是 `status=draft`
- ✅ 返回后台审核链接

**禁止**:
- ❌ `CONTENTOPS_DRAFT_ALLOW_PRODUCTION=true`（除非用户明确批准）
- ❌ 自动发布内容
- ❌ 创建 `status=published` 的 draft

### 6. 新 bot 先 dry-run 一周再考虑 production draft

**建议**:
- 新创建的 bot 先使用 dry-run 模式运行一周
- 观察日志，确认没有安全问题
- 确认用户行为符合预期
- 一周后再考虑是否开启 production draft

### 7. 开发 Hermes 和 ContentOps Hermes 不共用 token

**必须**:
- ✅ 开发 Hermes 使用一个 Telegram bot
- ✅ ContentOps Hermes 使用另一个 Telegram bot
- ✅ 两个 bot 的 token 不同
- ✅ 两个 bot 的 allowed chat ids 不同

**禁止**:
- ❌ 共用同一个 Telegram bot token
- ❌ 共用同一个 allowed chat ids

### 8. ContentOps bot 不接开发命令

**必须**:
- ✅ ContentOps bot 只接受白名单命令
- ✅ 白名单命令：`create-draft`, `validate-draft`, `list-drafts`, `query-audit`
- ✅ 所有其他命令都被拒绝

**禁止**:
- ❌ 接受 `git pull`, `npm build`, `pm2 restart`, `prisma migrate`
- ❌ 接受 `DELETE`, `DROP`, `TRUNCATE` SQL 命令
- ❌ 接受任何开发/部署命令

---

## 安全检查清单

### 启动前检查

- [ ] `GATEWAY_ALLOW_ALL_USERS=false`
- [ ] `TELEGRAM_ALLOWED_USERS` 已配置
- [ ] `CONTENTOPS_TELEGRAM_ALLOWED_CHAT_IDS` 已配置
- [ ] `security.redact_secrets=true`
- [ ] `CONTENTOPS_DRAFT_ALLOW_PRODUCTION=false`
- [ ] Token 未出现在日志中
- [ ] Token 未出现在代码提交中
- [ ] Allowed chat ids 已配置

### 运行中检查

- [ ] 日志中没有 token 泄露
- [ ] 日志中没有敏感信息
- [ ] 非白名单用户被拒绝
- [ ] 禁止命令被拒绝
- [ ] Audit log 正常记录

### 定期审查

- [ ] 每周检查日志
- [ ] 每月审查 allowed chat ids
- [ ] 每月审查禁止命令列表
- [ ] 每季度 rotate token（可选）

---

## 故障恢复

### 如果 token 泄露

1. 立即停止 gateway
2. 在 BotFather 中 revoke token
3. 获取新 token
4. 更新 `.env` 文件
5. 清理日志中的敏感信息
6. 重启 gateway

### 如果非授权用户访问

1. 检查 `TELEGRAM_ALLOWED_USERS` 配置
2. 检查 `CONTENTOPS_TELEGRAM_ALLOWED_CHAT_IDS` 配置
3. 检查 `config.yaml` 中的 `allowed_users` 配置
4. 重启 gateway

### 如果禁止命令被执行

1. 立即停止 gateway
2. 检查命令白名单配置
3. 检查 audit log
4. 修复配置后重启 gateway

---

## 总结

ContentOps Telegram Bot 安全锁定要求：

- ✅ 禁止 GATEWAY_ALLOW_ALL_USERS=true
- ✅ 禁止 secret redaction=false
- ✅ 启动前必须配置 allowed chat ids
- ✅ Token 泄露后必须 rotate
- ✅ Production draft 默认关闭
- ✅ 新 bot 先 dry-run 一周再考虑 production draft
- ✅ 开发 Hermes 和 ContentOps Hermes 不共用 token
- ✅ ContentOps bot 不接开发命令
