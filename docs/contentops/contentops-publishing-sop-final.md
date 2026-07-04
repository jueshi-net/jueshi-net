# ContentOps Publishing SOP (Standard Operating Procedure)

**版本**: v1.20.42.18.6.16.6.84.4.0  
**日期**: 2026-07-04  
**状态**: V2-MVP_READY — 长文本/改写/质量门槛已上线

---

## 概述

本文档定义了 ContentOps Telegram Bot 的发布标准操作流程（SOP）。所有操作必须严格遵循本 SOP，不得违反。

---

## Telegram Bot 真实 E2E 状态

**重要更新 (v1.20.42.18.6.16.6.84.3.2)**:

- ✅ **Token 安全 provisioning 完成**（无需用户手动复制）
- ✅ **@fabuxia_bot 已部署在 production server**
- ✅ **PM2 jueshi-contentops-bot 独立运行** (PID 252515)
- ✅ **Telegram 连接成功**
- ✅ **安全配置正确**（allow all users=false, redaction=true, publication disabled）
- ⚠️ **真实 Telegram E2E 测试需要用户配合发送消息**

**已完成的验证**:
- ✅ 三类内容通过 **CLI** 实际创建（v1.20.42.18.6.16.6.76/76.1）
- ✅ CLI E2E 验证通过
- ✅ Token 安全传输到 production（未输出、未进入 git、未进入日志）
- ✅ Production bot runtime 部署完成
- ⚠️ **Telegram bot 真实 E2E 待用户测试**

**安全特性**:
- ✅ Token 通过安全方式配置（.env.contentops, 权限 600）
- ✅ Token 未输出到任何日志或报告
- ✅ Token 未进入 git
- ✅ Secret redaction=true
- ✅ Allow all users=false
- ✅ Publication disabled

**操作建议**:
- ✅ 用户从 Telegram 发送测试消息验证 draft 创建流程
- ✅ 验证完成后可以开启 UI 重构新对话

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

**状态**: V1_READY  
**最后更新**: 2026-07-04

---

## v1.20.42.18.6.16.6.84.3.21 — ContentOps Auto Draft Workflow V1 完成

### 三类 Draft 创建状态

| 类型 | Draft ID | Slug | Admin Edit | Admin Preview | Public URL | Sitemap |
|------|----------|------|-----------|---------------|-----------|---------|
| Checklist | cmr528thk0000lb2p9b39oqbb | checklist-18779a15 | ✅ 200 | ✅ 需登录 | ✅ 隐藏 | ✅ 排除 |
| Guide | cmr4zk2720001e32poismdx7n | guide-501deffc | ✅ 200 | ✅ 需登录 | ✅ 隐藏 | ✅ 排除 |
| Topic | cmr4zlxl30002e32plkv89ntq | topic-22996ad5 | ✅ 200 | ✅ 需登录 | ✅ 隐藏 | ✅ 排除 |

### 路由真实路径

- **Checklist Admin Edit**: `/admin/content/checklists/[id]/edit`
- **Guide Admin Edit**: `/admin/content/guides/[id]/edit`
- **Topic Admin Edit**: `/admin/content/topics/[id]/edit` (v1.20.42.18.6.16.6.84.3.21 新增)
- **Public Preview**: `/[type]/[slug]?preview=true` (需 admin 登录)

### 关键修复

1. **Topic 页面 500 修复**: 移除 `generateStaticParams()`，改为 `export const dynamic = "force-dynamic"`，解决 static-to-dynamic 冲突 500 错误
2. **Topic Admin Edit 页面**: 新增 `src/app/(admin)/admin/content/topics/[id]/edit/` 页面
3. **Topic 空 items 预览**: 添加 empty-items preview fallback，当 rating_list 模板无 items 时显示 metadataJson 内容
4. **Preview Auth 统一**: 三类页面统一使用 `isAdmin()` helper，支持 "管理员"/"ADMIN"/"admin" 多种 role 格式

### 自动发布定义

"自动发布"在当前阶段定义为"自动创建 production draft"，不是自动公开发布。

### 运营基线

- ✅ Checklist/Guide/Topic 三类自然语言创建 draft 均通过
- ✅ Admin edit 和 admin preview 均通过
- ✅ Draft 不公开、不进 sitemap、不进列表
- ✅ 发布必须人工后台审核
- ✅ 用户不需要 JSON
- ✅ 仅自然语言入口为主
- ✅ `CONTENTOPS_DRAFT_ALLOW_PRODUCTION=false` (当前冻结)
- ✅ `CONTENTOPS_PUBLICATION_ALLOWED=false`

### 后续待办

- ⏳ Monitor 探针后续只在原有基础上完善，不重复造轮子
- ⏳ ContentOps v2 后续再做（质量门槛、长文本/文件处理、洗稿安全规则）
- ⏳ UI 重构可开新对话

---

## v1.20.42.18.6.16.6.84.4.0 — ContentOps V2-MVP 升级

### V2-MVP 已支持的能力

- ✅ 长文本粘贴输入 (>500 字)
- ✅ 竞品/参考资料粘贴改写
- ✅ 混乱笔记提炼归纳
- ✅ 内容类型自动判断 (checklist/guide/topic)
- ✅ 标题/目标用户/国家/阶段自动提炼
- ✅ 原创改写和结构重组 (不逐句照搬)
- ✅ SEO/GEO 增强 (metaKeywords, primaryKeyword, searchIntent 等)
- ✅ FAQ/pitfalls/internalLinks/relatedTools 自动生成
- ✅ 质量门槛校验 (qualityGate)
- ✅ Dry-run v2 完整摘要
- ✅ 用户确认后创建 production draft
- ✅ Admin edit + admin preview 链接

### V2-MVP 不做

- ⏳ 文件上传解析 (V2.1)
- ⏳ 外部 URL 抓取 (V2.1)
- ⏳ 自动发布 (禁止)
- ⏳ 监控探针 (后续待办)
- ⏳ UI 重构 (可开新对话)

### 质量门槛

| 类型 | 最低要求 |
|------|---------|
| Checklist | intro>=150字, groups>=4, items>=12, FAQ>=5, pitfalls>=5, links>=5, tools>=3, score>=75 |
| Guide | body>=1500字, sections>=6, FAQ>=5, pitfalls>=5, links>=5, tools>=3, score>=75 |
| Topic | intro>=100字, FAQ>=5, pitfalls>=5, links>=5, tools>=3, score>=75 |

质量不达标时不创建 draft，返回缺失项列表。

### 用户操作方式

用户可以直接粘贴长文本或竞品资料，bot 会自动：
1. 识别输入模式和类型
2. 提炼关键信息
3. 生成完整内容 (不逐句照搬)
4. 校验质量门槛
5. 返回 dry-run v2 摘要
6. 等待用户确认后创建 draft
