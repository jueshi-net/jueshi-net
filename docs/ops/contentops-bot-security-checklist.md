# ContentOps Bot 安全清单

## 最小权限原则

### ✅ 允许的权限

- **读取**: 读取 draft 内容、SEO/GEO 字段
- **创建**: 创建 draft（status=draft）
- **更新**: 更新 draft 的 metadataJson
- **日志**: 写入 audit log

### ❌ 禁止的权限

- **发布**: 不得将 draft 改为 published
- **删除**: 不得删除任何内容
- **SSH**: 不得 SSH 到 production
- **数据库**: 不得直接访问数据库
- **部署**: 不得执行部署操作
- **Git**: 不得执行 git push/pull/merge
- **NPM**: 不得执行 npm install/build
- **PM2**: 不得执行 pm2 restart
- **Prisma**: 不得执行 prisma db push/migrate
- **SQL**: 不得执行 raw SQL（特别是 DELETE/DROP/TRUNCATE）

## 命令白名单

### 允许的命令

```bash
# Draft 创建
scripts/create-contentops-draft.ts --type=checklist --payload=...
scripts/create-contentops-draft.ts --type=guide --payload=...
scripts/create-contentops-draft.ts --type=topic --payload=...

# Draft 验证
scripts/validate-contentops-draft.ts --draftId=...

# Draft 列表
scripts/list-contentops-drafts.ts --status=draft

# Audit log 查询
scripts/query-contentops-audit.ts --date=2026-06-16
```

### 禁止的命令

```bash
# 数据库操作
prisma db push
prisma migrate deploy
prisma migrate reset
psql -c "DELETE FROM ..."
psql -c "DROP TABLE ..."
psql -c "TRUNCATE ..."

# Git 操作
git push
git pull
git merge
git reset --hard

# NPM 操作
npm install
npm ci
npm run build
npm run deploy

# PM2 操作
pm2 restart
pm2 stop
pm2 delete

# SSH 操作
ssh production
ssh jueshi-new

# 发布操作
UPDATE checklists SET status='published'
UPDATE guides SET status='published'
UPDATE topics SET status='published'
```

## 环境变量保护

### 必须保护的环境变量

```bash
# Telegram Bot Token
TELEGRAM_BOT_TOKEN=***  # 不得记录到日志
TELEGRAM_BOT_USERNAME=***  # 不得记录到日志

# 数据库连接
DATABASE_URL=***  # 不得记录到日志

# SSH 密钥
SSH_PRIVATE_KEY=***  # 不得记录到日志

# API 密钥
API_KEY=***  # 不得记录到日志
```

### 环境变量访问规则

- ✅ 只允许 ContentOps bot 进程访问
- ✅ 使用 `.env.local` 存储
- ✅ 不得提交到 git
- ✅ 不得记录到日志
- ❌ 不得在代码中硬编码
- ❌ 不得在错误消息中输出

## Rate Limit

### 限制规则

```typescript
const RATE_LIMIT_CONFIG = {
  // 每个 chatId 每分钟最多 5 次操作
  perChatPerMinute: 5,
  
  // 每个 chatId 每小时最多 50 次操作
  perChatPerHour: 50,
  
  // 全局每分钟最多 100 次操作
  globalPerMinute: 100,
  
  // 全局每小时最多 1000 次操作
  globalPerHour: 1000
};
```

### 超限处理

```typescript
if (rateLimitExceeded) {
  // 返回 429 Too Many Requests
  response.status(429).json({
    error: 'Rate limit exceeded',
    retryAfter: 60  // 秒
  });
  
  // 记录到 audit log
  writeAuditLog({
    result: 'error',
    error: 'Rate limit exceeded',
    rateLimitStatus: 'limited'
  });
}
```

## 429 Cooldown

### Cooldown 规则

```typescript
const COOLDOWN_CONFIG = {
  // 触发 rate limit 后，冷却 60 秒
  cooldownSeconds: 60,
  
  // 冷却期间拒绝所有请求
  rejectDuringCooldown: true,
  
  // 冷却结束后重置计数器
  resetAfterCooldown: true
};
```

### Cooldown 实现

```typescript
class CooldownManager {
  private cooldowns = new Map<string, number>();
  
  isOnCooldown(chatId: string): boolean {
    const cooldownEnd = this.cooldowns.get(chatId);
    if (!cooldownEnd) return false;
    
    if (Date.now() < cooldownEnd) {
      return true;
    }
    
    // Cooldown 结束，移除
    this.cooldowns.delete(chatId);
    return false;
  }
  
  startCooldown(chatId: string): void {
    const cooldownEnd = Date.now() + 60 * 1000;
    this.cooldowns.set(chatId, cooldownEnd);
  }
}
```

## Audit Log

### 必须记录的操作

- ✅ Draft 创建（成功/失败）
- ✅ Draft 验证（成功/失败）
- ✅ Rate limit 触发
- ✅ Cooldown 触发
- ✅ 命令拒绝（不在白名单）
- ✅ 错误发生

### 不得记录的内容

- ❌ Token
- ❌ Cookie
- ❌ Session
- ❌ DATABASE_URL
- ❌ SSH key
- ❌ 密码

### 日志存储

```
logs/contentops-audit/
├── 2026-06-16.jsonl
├── 2026-06-17.jsonl
└── 2026-06-18.jsonl
```

## Rollback / Disable Bot

### 立即禁用 Bot

```bash
# 方法 1: 设置环境变量
export CONTENTOPS_BOT_ENABLED=false

# 方法 2: 停止 PM2 进程
pm2 stop contentops-bot

# 方法 3: 删除 PM2 进程
pm2 delete contentops-bot
```

### 回滚操作

如果 bot 创建了错误的 draft：

```bash
# 1. 找到 draft
scripts/list-contentops-drafts.ts --status=draft

# 2. 手动删除（需要 admin 权限）
psql $DATABASE_URL -c "DELETE FROM checklists WHERE slug='error-slug'"
psql $DATABASE_URL -c "DELETE FROM guides WHERE slug='error-slug'"
psql $DATABASE_URL -c "DELETE FROM topics WHERE slug='error-slug'"
```

**注意**: 删除操作必须由人工执行，bot 不得有删除权限。

## 异常报警

### 报警触发条件

- ❌ Rate limit 触发超过 10 次/小时
- ❌ Cooldown 触发超过 5 次/小时
- ❌ 命令拒绝超过 20 次/小时
- ❌ 错误率超过 5%
- ❌ 尝试执行禁止命令
- ❌ 尝试访问敏感环境变量

### 报警方式

```typescript
// Telegram 报警
async function sendAlert(message: string) {
  await bot.sendMessage(ALERT_CHAT_ID, `🚨 ContentOps Bot Alert:\n${message}`);
}

// 示例
sendAlert('Rate limit triggered 15 times in the last hour');
sendAlert('User attempted to execute forbidden command: prisma db push');
```

### 报警日志

```json
{
  "timestamp": "2026-06-16T10:30:00.000Z",
  "alertType": "rate_limit",
  "severity": "warning",
  "message": "Rate limit triggered 15 times in the last hour",
  "chatIdHash": "a1b2c3d4"
}
```

## 安全审计检查清单

### 每日检查

- [ ] 检查 audit log 是否包含敏感信息
- [ ] 检查 rate limit 触发次数
- [ ] 检查错误率

### 每周检查

- [ ] 审查日志文件大小
- [ ] 审查日志访问权限
- [ ] 审查异常操作

### 每月检查

- [ ] 轮转旧日志
- [ ] 审查环境变量
- [ ] 审查命令白名单
- [ ] 审查安全策略

## 故障恢复

### Bot 崩溃

```bash
# 检查 PM2 状态
pm2 status

# 查看错误日志
pm2 logs contentops-bot --lines 100

# 重启 bot
pm2 restart contentops-bot
```

### 数据库连接失败

```bash
# 检查 DATABASE_URL
echo $DATABASE_URL

# 测试连接
psql $DATABASE_URL -c "SELECT 1"

# 如果失败，检查 .env.local
cat .env.local | grep DATABASE_URL
```

### Telegram API 失败

```bash
# 检查 bot token
echo $TELEGRAM_BOT_TOKEN

# 测试 API
curl https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe
```

## 总结

ContentOps bot 必须遵循最小权限原则：

- ✅ 只能创建 draft
- ✅ 只能调用白名单命令
- ✅ 必须记录 audit log
- ✅ 必须有 rate limit
- ✅ 必须有 cooldown
- ✅ 必须保护敏感信息
- ❌ 不能发布内容
- ❌ 不能删除内容
- ❌ 不能执行数据库操作
- ❌ 不能执行部署操作
- ❌ 不能 SSH 到 production
