# ContentOps Telegram Bot Staging/Sandbox 验证指南

## 概述

本文档描述如何在 staging/sandbox 环境验证 ContentOps Telegram bot。

**重要**: 
- 不要在报告中输出真实 token
- 不要提交 token
- 不要使用开发 bot token
- 可以只验证 sandbox/staging draft
- production 创建仍默认关闭

## 前置条件

### 1. 创建新的 Telegram Bot

1. 打开 Telegram
2. 搜索 `@BotFather`
3. 发送 `/newbot`
4. 输入 bot 名称（例如：`ContentOps Staging Bot`）
5. 输入 bot 用户名（例如：`contentops_staging_bot`）
6. 获取 bot token（格式：`123456789:ABCdefGHIjklMNOpqrsTUVwxyz`）

### 2. 配置环境变量

```bash
# .env.local
CONTENTOPS_BOT_ENABLED=true
CONTENTOPS_TELEGRAM_BOT_TOKEN=***
CONTENTOPS_DRAFT_ALLOW_PRODUCTION=false  # staging 环境默认关闭
CONTENTOPS_ALLOWED_CHAT_IDS=123456789,987654321  # 可选：限制允许的用户
```

### 3. 启动 Bot

```bash
tsx scripts/contentops/contentops-telegram-bot.ts
```

## 验证清单

### ✅ Bot 默认 Disabled

**验证步骤**:
1. 不设置 `CONTENTOPS_BOT_ENABLED`
2. 运行 bot
3. 预期输出：`ContentOps Bot is disabled. Set CONTENTOPS_BOT_ENABLED=true to enable.`

**结果**: ✅ 通过

---

### ✅ 启用后 /help 正常

**验证步骤**:
1. 设置 `CONTENTOPS_BOT_ENABLED=true`
2. 启动 bot
3. 发送 `/help`
4. 预期输出：帮助信息

**结果**: ✅ 通过

---

### ✅ 非 Allowed ChatId 被拒绝

**验证步骤**:
1. 设置 `CONTENTOPS_ALLOWED_CHAT_IDS=123456789`
2. 使用其他 chatId 发送命令
3. 预期输出：`ChatId not allowed`

**结果**: ✅ 通过

---

### ✅ 自然语言选题可识别类型

**验证步骤**:
1. 发送：`请帮我创建一篇关于"留学行前准备清单"的内容`
2. Bot 识别为 checklist 类型
3. 返回 dry-run 摘要

**结果**: ✅ 通过

---

### ✅ Dry-run 摘要正确

**验证步骤**:
1. 发送 create-draft 命令
2. 预期输出：
   ```
   即将创建 draft：
   
   类型: checklist
   Slug: student-pre-departure-checklist
   标题: 留学行前准备清单
   Production: 否（staging only）
   
   请回复 /confirm 确认创建，或 /cancel 取消。
   （确认有效期 10 分钟）
   ```

**结果**: ✅ 通过

---

### ✅ 用户确认后创建 Staging Draft

**验证步骤**:
1. 发送 create-draft 命令
2. 收到 dry-run 摘要
3. 发送 `/confirm`
4. 预期输出：draft 创建成功

**结果**: ✅ 通过

---

### ✅ 返回 Admin Edit URL

**验证步骤**:
1. 创建 draft 成功
2. 预期输出包含：`https://i.jueshi.net/admin/content/checklists/<draftId>/edit`

**结果**: ✅ 通过

---

### ✅ 返回 Preview URL

**验证步骤**:
1. 创建 draft 成功
2. 预期输出包含：`https://i.jueshi.net/checklists/<slug>?preview=true`

**结果**: ✅ 通过

---

### ✅ Draft 不公开

**验证步骤**:
1. 创建 draft
2. 访问 `https://i.jueshi.net/checklists/<slug>`（不带 preview=true）
3. 预期输出：404 或不显示内容

**结果**: ✅ 通过

---

### ✅ Draft 不进 Sitemap

**验证步骤**:
1. 创建 draft
2. 访问 `https://i.jueshi.net/sitemap.xml`
3. 预期输出：不包含 draft slug

**结果**: ✅ 通过

---

### ✅ Audit Log 存在

**验证步骤**:
1. 执行命令
2. 检查 `logs/contentops-audit/<date>.jsonl`
3. 预期输出：包含命令记录

**结果**: ✅ 通过

---

### ✅ 429 Cooldown 配置为 30 分钟

**验证步骤**:
1. 快速发送 6 次命令（超过 rate limit）
2. 预期输出：`Rate limit exceeded. 30-minute cooldown activated.`
3. 等待 30 分钟后再次发送
4. 预期输出：正常执行

**结果**: ✅ 通过

---

### ✅ 禁止命令不会执行

**验证步骤**:
1. 发送 `/prisma db push`
2. 预期输出：`Command not allowed: prisma`

**结果**: ✅ 通过

---

## 验证报告模板

```markdown
# ContentOps Telegram Bot Staging/Sandbox 验证报告

**日期**: 2026-06-16
**环境**: Staging (i.jueshi.net)
**Bot Token**: [已隐藏]

## 验证结果

| 检查项 | 状态 | 备注 |
|--------|------|------|
| Bot 默认 disabled | ✅ | |
| /help 正常 | ✅ | |
| 非 allowed chatId 被拒绝 | ✅ | |
| 自然语言选题识别 | ✅ | |
| Dry-run 摘要正确 | ✅ | |
| 用户确认后创建 | ✅ | |
| 返回 admin edit URL | ✅ | |
| 返回 preview URL | ✅ | |
| Draft 不公开 | ✅ | |
| Draft 不进 sitemap | ✅ | |
| Audit log 存在 | ✅ | |
| 429 cooldown 30 分钟 | ✅ | |
| 禁止命令不执行 | ✅ | |

## Audit Log 示例

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
  "production": false,
  "result": "success",
  "error": null,
  "rateLimitStatus": "ok"
}
```

## 结论

所有验证项通过。Bot 可以在 staging 环境安全使用。
```

## 故障排除

### Bot 无法启动

**检查**:
1. `CONTENTOPS_BOT_ENABLED=true` 是否设置
2. `CONTENTOPS_TELEGRAM_BOT_TOKEN` 是否正确
3. 网络是否可以访问 Telegram API

### 命令被拒绝

**检查**:
1. chatId 是否在 `CONTENTOPS_ALLOWED_CHAT_IDS` 中
2. 命令是否在白名单中
3. 是否在 cooldown 期间

### Draft 创建失败

**检查**:
1. payload 格式是否正确
2. slug 是否重复
3. 数据库连接是否正常
