# ContentOps Audit Log 规范

## 日志格式

### 标准字段

每次 ContentOps 操作必须记录以下字段：

```json
{
  "timestamp": "ISO 8601 格式",
  "chatIdHash": "SHA-256 前 8 位",
  "userDisplayName": "用户显示名称（如可用）",
  "command": "命令名称",
  "contentType": "checklist | guide | topic",
  "slug": "内容 slug",
  "draftId": "draft ID",
  "dryRun": true | false,
  "production": true | false,
  "result": "success | error | dry-run",
  "error": "错误信息（脱敏后）或 null",
  "rateLimitStatus": "ok | limited | cooldown"
}
```

### 禁止记录的字段

- ❌ `token` — Telegram bot token
- ❌ `cookie` — 任何 cookie
- ❌ `session` — session ID 或 token
- ❌ `DATABASE_URL` — 数据库连接字符串
- ❌ `sshKey` — SSH 私钥或密码
- ❌ `password` — 任何密码
- ❌ `apiKey` — API 密钥
- ❌ `creditCard` — 支付信息

### 脱敏规则

如果错误信息中包含敏感信息，必须脱敏：

```javascript
function sanitizeError(errorMessage) {
  return errorMessage
    .replace(/DATABASE_URL=[^\s]+/g, 'DATABASE_URL=***')
    .replace(/token=[^\s]+/g, 'token=***')
    .replace(/cookie=[^\s]+/g, 'cookie=***')
    .replace(/session=[^\s]+/g, 'session=***')
    .replace(/ssh.*password/gi, '***')
    .replace(/password=[^\s]+/g, 'password=***');
}
```

## 日志文件命名

### 按日期轮转

```
logs/contentops-audit/
├── 2026-06-16.jsonl
├── 2026-06-17.jsonl
└── 2026-06-18.jsonl
```

### 按小时轮转（高流量场景）

```
logs/contentops-audit/
├── 2026-06-16-10.jsonl
├── 2026-06-16-11.jsonl
└── 2026-06-16-12.jsonl
```

## 日志写入示例

### TypeScript

```typescript
import { appendFileSync } from 'fs';
import { createHash } from 'crypto';

interface AuditLogEntry {
  timestamp: string;
  chatIdHash: string;
  userDisplayName?: string;
  command: string;
  contentType: 'checklist' | 'guide' | 'topic';
  slug: string;
  draftId: string;
  dryRun: boolean;
  production: boolean;
  result: 'success' | 'error' | 'dry-run';
  error?: string | null;
  rateLimitStatus: 'ok' | 'limited' | 'cooldown';
}

function hashChatId(chatId: string): string {
  return createHash('sha256').update(chatId).digest('hex').slice(0, 8);
}

function writeAuditLog(entry: AuditLogEntry): void {
  const logPath = `logs/contentops-audit/${new Date().toISOString().split('T')[0]}.jsonl`;
  appendFileSync(logPath, JSON.stringify(entry) + '\n');
}

// 使用示例
writeAuditLog({
  timestamp: new Date().toISOString(),
  chatIdHash: hashChatId('123456789'),
  userDisplayName: '澈陈',
  command: 'create-draft',
  contentType: 'checklist',
  slug: 'student-pre-departure-checklist',
  draftId: 'contentops-cli-e2e-test-001',
  dryRun: false,
  production: true,
  result: 'success',
  error: null,
  rateLimitStatus: 'ok'
});
```

## 日志查询示例

### 查找最近 10 条 draft 创建记录

```bash
tail -n 10 logs/contentops-audit/$(date +%Y-%m-%d).jsonl | jq 'select(.command == "create-draft")'
```

### 查找所有错误

```bash
grep '"result":"error"' logs/contentops-audit/*.jsonl | jq .
```

### 统计每日 draft 创建数量

```bash
grep '"command":"create-draft"' logs/contentops-audit/*.jsonl | \
  jq -r '.timestamp' | \
  cut -d'T' -f1 | \
  sort | uniq -c
```

## 安全审计

### 每日检查

```bash
# 检查是否包含敏感信息
grep -iE 'DATABASE_URL|token=|cookie=|session=|password=' logs/contentops-audit/*.jsonl
```

### 每周审查

- 审查日志文件大小
- 审查日志访问权限
- 审查是否有异常操作

### 每月轮转

```bash
# 压缩旧日志
find logs/contentops-audit/ -name "*.jsonl" -mtime +30 -exec gzip {} \;
```
