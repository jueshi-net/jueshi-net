# ContentOps Publishing SOP (Standard Operating Procedure)

**版本**: v1.20.42.18.6.16.6.84.2  
**日期**: 2026-07-03  
**状态**: FROZEN

---

## 概述

本文档定义了 ContentOps Telegram Bot 的发布标准操作流程（SOP）。所有操作必须严格遵循本 SOP，不得违反。

---

## Telegram Bot 真实 E2E 状态

**重要更新 (v1.20.42.18.6.16.6.84.2)**:

- ❌ **Telegram bot 真实 E2E 仍 blocked，不能作为正式内容运营入口**
- ❌ 本地数据库不可用（127.0.0.1:5555 拒绝连接）
- ❌ Bot 无法连接 production 数据库
- ❌ Hermes Agent 不支持 SSH 终端后端
- ❌ Production 服务器缺少 draft 创建脚本

**已完成的验证**:
- ✅ 三类内容通过 **CLI** 实际创建（v1.20.42.18.6.16.6.76/76.1）
- ✅ CLI E2E 验证通过
- ❌ **Telegram bot E2E 未验证**（v1.20.42.18.6.16.6.84.2 尝试修复失败）

**根本性环境限制**:
1. 本地数据库不可用
2. Bot 终端配置为 `backend: local`，无法直接通过 SSH 在 production 执行
3. Hermes Agent 不支持 SSH 终端后端
4. Production 服务器缺少 draft 创建脚本

**解决方案（需额外工作）**:
- 方案 A: 在 production 部署 bot（需要部署脚本和配置）
- 方案 B: 修改 Hermes Agent 支持 SSH 终端（需要修改核心代码）
- 方案 C: 接受 CLI E2E 作为替代（推荐，简单但非真实 Telegram flow）

**操作建议**:
- ⚠️ 在 Telegram bot 真实 E2E 验证通过之前，不建议将 bot 作为正式内容运营入口
- ✅ 可以使用 CLI 创建 draft，然后在后台审核和发布
- ⚠️ 如需实现真实 Telegram flow E2E，需要先解决上述环境限制

---

## 核心原则

### 1. ContentOps Bot 默认只 Dry-Run

- ✅ Bot 默认只执行 dry-run，不实际创建 draft
- ✅ 需要用户明确批准才临时开启 production draft 创建
- ✅ 创建后立即关闭 production draft 开关

### 2. Production Draft 默认关闭

- ✅ `CONTENTOPS_DRAFT_ALLOW_PRODUCTION=false`
- ✅ 需要用户明确批准才临时开启
- ✅ 每次最多创建指定数量 draft（默认 1 篇）
- ✅ 创建后立即关闭 production draft 开关

### 3. 所有内容先进入 Draft

- ✅ 所有内容必须先进入 draft 状态
- ✅ 用户必须后台审核
- ✅ 公开发布只能人工执行

### 4. 不允许 Bot 自动发布

- ❌ Bot 不得自动发布内容
- ❌ Bot 不得自动提交搜索引擎
- ❌ Bot 不得执行开发/部署命令

### 5. Dev Hermes 与 ContentOps Hermes 分离

- ✅ 开发 Hermes 使用一个 Telegram bot
- ✅ ContentOps Hermes 使用另一个 Telegram bot
- ✅ 两个 bot 的 token 不同
- ✅ 两个 bot 的 allowed chat ids 不同

---

## 发布流程

### Phase 1: 选题与 Dry-Run

1. **用户发送自然语言选题**
   ```
   帮我创建一篇关于"新加坡留学生租房注意事项清单"的清单。
   目标用户：准留学生和留学生家长。
   目标国家：新加坡。
   受众阶段：准备出国阶段。
   ```

2. **Bot 识别类型并生成 payload**
   - 识别 type=checklist/guide/topic
   - 生成 title
   - 生成 slug
   - 生成 SEO/GEO/keywords
   - 生成 FAQ
   - 生成 internalLinks
   - 生成 videoPack
   - 生成 structuredData
   - 生成 qualityScore

3. **Bot 返回 dry-run 摘要**
   ```
   即将创建 draft：
   
   类型: checklist
   Slug: singapore-rental-guide-checklist
   标题: 新加坡留学生租房注意事项清单
   Production: 否（staging only）
   
   请回复 /confirm 确认创建，或 /cancel 取消。
   （确认有效期 10 分钟）
   ```

4. **用户确认或取消**
   - 发送 `/confirm` 确认创建
   - 发送 `/cancel` 取消创建

### Phase 2: 临时开启 Production Draft（如需要）

1. **用户明确批准**
   ```
   用户：请临时开启 production draft 创建，创建 1 篇 draft。
   ```

2. **Hermes 临时开启 production draft**
   ```bash
   CONTENTOPS_DRAFT_ALLOW_PRODUCTION=true
   ```

3. **记录 audit log**
   ```json
   {
     "timestamp": "2026-07-03T13:10:16.687885",
     "action": "production_draft_switch_changed",
     "from": false,
     "to": true,
     "reason": "v1.20.42.18.6.16.6.84 first controlled production draft creation",
     "operator": "hermes_agent"
   }
   ```

### Phase 3: 创建 Draft

1. **Bot 创建 draft**
   - status=draft
   - robots=noindex,nofollow
   - publishedAt=null

2. **Bot 返回 draft 信息**
   ```
   Draft 创建成功！
   
   Draft ID: xxx
   Slug: singapore-rental-guide-checklist
   类型: checklist
   
   编辑链接: https://jueshi.net/admin/content/checklists/xxx/edit
   Preview: https://jueshi.net/checklists/singapore-rental-guide-checklist?preview=true
   
   请登录后台审核内容并手动发布。
   ```

3. **记录 audit log**
   ```json
   {
     "timestamp": "2026-07-03T13:15:00.000000",
     "action": "draft_created",
     "draftId": "xxx",
     "slug": "singapore-rental-guide-checklist",
     "type": "checklist",
     "status": "draft",
     "operator": "hermes_agent"
   }
   ```

### Phase 4: 立即关闭 Production Draft

1. **Hermes 立即关闭 production draft**
   ```bash
   CONTENTOPS_DRAFT_ALLOW_PRODUCTION=false
   ```

2. **记录 audit log**
   ```json
   {
     "timestamp": "2026-07-03T13:17:33.727648",
     "action": "production_draft_switch_changed",
     "from": true,
     "to": false,
     "reason": "v1.20.42.18.6.16.6.84 first controlled production draft creation completed",
     "operator": "hermes_agent"
   }
   ```

### Phase 5: 用户后台审核

1. **用户登录后台**
   - 访问 https://jueshi.net/admin
   - 登录 admin 账号

2. **找到 draft**
   - 进入 checklists/guides/topics 列表
   - 找到新创建的 draft

3. **审核内容**
   - 检查标题、摘要、步骤
   - 检查 SEO/GEO 字段
   - 检查 FAQ
   - 检查 internalLinks
   - 检查 videoPack
   - 检查 structuredData

4. **修改内容（如需要）**
   - 编辑标题、摘要、步骤
   - 修改 SEO/GEO 字段
   - 添加/修改 FAQ
   - 添加/修改 internalLinks

### Phase 6: 手动发布

1. **用户手动发布**
   - 点击"发布"按钮
   - 设置 publishedAt
   - 设置 robots=index,follow

2. **验证发布**
   - 访问 public URL
   - 检查 sitemap 是否包含
   - 检查列表页是否包含

3. **执行 SEO check**
   - 检查 meta tags
   - 检查 structured data
   - 检查 canonical URL
   - 检查 robots meta

### Phase 7: 发布后验证

1. **验证 public URL**
   - 访问 https://jueshi.net/checklists/singapore-rental-guide-checklist
   - 确认内容正常显示

2. **验证 sitemap**
   - 访问 https://jueshi.net/sitemap.xml
   - 确认包含新发布的 checklist

3. **验证列表页**
   - 访问 https://jueshi.net/checklists
   - 确认包含新发布的 checklist

4. **验证 SEO**
   - 检查 meta tags
   - 检查 structured data
   - 检查 canonical URL

---

## 禁止事项

### 绝对禁止

- ❌ Bot 自动发布内容
- ❌ Bot 自动提交搜索引擎
- ❌ Bot 执行开发/部署命令（git pull, npm build, pm2 restart, prisma migrate）
- ❌ Bot 执行 destructive SQL（DELETE, DROP, TRUNCATE）
- ❌ 测试 draft SQL 删除（只能保留或归档）
- ❌ 批量创建内容
- ❌ 创建超过指定数量的 draft

### 严格限制

- ⚠️ Production draft 创建需要用户明确批准
- ⚠️ 每次最多创建指定数量 draft（默认 1 篇）
- ⚠️ 创建后立即关闭 production draft 开关
- ⚠️ 所有内容必须先进入 draft
- ⚠️ 用户必须后台审核
- ⚠️ 公开发布只能人工执行

---

## 安全要求

### Bot 安全

- ✅ Secret redaction=true
- ✅ Allow all users=false
- ✅ Allowed chat ids 白名单
- ✅ Production draft 默认关闭
- ✅ 30 分钟 429 cooldown
- ✅ 命令白名单
- ✅ Audit log

### Token 保护

- ✅ 使用 CONTENTOPS_TELEGRAM_BOT_TOKEN（专用变量名）
- ✅ 禁止输出真实 token
- ✅ Token 泄露后必须 rotate

### 日志保护

- ✅ 所有日志经过脱敏处理
- ✅ 不记录 token、cookie、session、DATABASE_URL、SSH key
- ✅ 定期审查日志

---

## 故障恢复

### 如果 Bot 创建了错误的 Draft

1. **不要删除**
   - 测试 draft 不得 SQL 删除
   - 只能保留或归档

2. **归档处理**
   - 设置 status=archived
   - 添加归档原因

3. **记录 audit log**
   ```json
   {
     "timestamp": "2026-07-03T13:20:00.000000",
     "action": "draft_archived",
     "draftId": "xxx",
     "reason": "错误内容，需要重新创建",
     "operator": "admin_user"
   }
   ```

### 如果 Token 泄露

1. **立即停止 gateway**
2. **在 BotFather 中 revoke token**
3. **获取新 token**
4. **更新 .env 文件**
5. **清理日志中的敏感信息**
6. **重启 gateway**

### 如果非授权用户访问

1. **检查 TELEGRAM_ALLOWED_USERS 配置**
2. **检查 CONTENTOPS_TELEGRAM_ALLOWED_CHAT_IDS 配置**
3. **检查 config.yaml 中的 allowed_users 配置**
4. **重启 gateway**

---

## 审计与合规

### 每日检查

- [ ] 检查 audit log
- [ ] 检查是否有异常操作
- [ ] 检查 rate limit 触发次数

### 每周检查

- [ ] 审查日志文件大小
- [ ] 审查日志访问权限
- [ ] 审查异常操作

### 每月检查

- [ ] 轮转旧日志
- [ ] 审查环境变量
- [ ] 审查命令白名单
- [ ] 审查安全策略
- [ ] 审查 SOP 是否需要更新

---

## 总结

ContentOps Publishing SOP 核心要求：

- ✅ ContentOps bot 默认只 dry-run
- ✅ Production draft 默认关闭
- ✅ 需要用户明确批准才临时开启
- ✅ 每次最多创建指定数量 draft
- ✅ 创建后立即关闭 production draft
- ✅ 所有内容先进入 draft
- ✅ 用户必须后台审核
- ✅ 公开发布只能人工执行
- ✅ 发布后执行 SEO check
- ✅ 不允许 bot 自动提交搜索引擎
- ✅ 不允许 bot 自动发布
- ✅ 不允许 bot 执行开发/部署命令
- ✅ 测试 draft 不得 SQL 删除，只能保留或归档
- ✅ Dev Hermes 与 ContentOps Hermes 分离

**状态**: FROZEN  
**最后更新**: 2026-07-03
