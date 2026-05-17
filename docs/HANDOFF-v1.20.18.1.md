# HANDOFF — v1.20.18.1 Topics Admin Editor Fix

> 生成日期：2026-05-17
> 生产域名：**https://jueshi.net**
> 当前稳定 tag：**v1.20.18.1-topics-admin-editor-fix**

---

## 1. 项目概述

海外百宝箱（jueshi.net）— 面向海外华人、留学生和出海商家的工具/资源平台。
定位：实用工具 + 资源导航 + 内容 CMS，**不是翻墙/代理/VPN 站点**。

## 2. 已实现模块总览

| 模块 | 路径 | 状态 |
|---|---|---|
| 前台首页 | `/` | ✅ 已上线 |
| 工具中心 | `/tools` | ✅ 已上线 |
| AI 工具（体验版/Mock） | `/ai-tools/*` | ✅ 已上线，标注"体验版/仅供参考" |
| 单据生成 | `/tools/documents` | ✅ 已上线 |
| 唛头标签 | `/tools/label-maker` | ✅ 已上线 |
| 邮编查询 | `/tools/postal-code` | ✅ 已上线 |
| 资源库 | `/resources` | ✅ 已上线 |
| 指南/文章 | `/guides` | ✅ 已上线 |
| 专题 CMS | `/topics`, `/topics/[slug]` | ✅ v1.20.18 从 DB 驱动 |
| 新手场景包 | `/starter` | ✅ 已上线 |
| 工具排行榜 | `/rankings` | ✅ 已上线 |
| 用户登录 | `/login` | ✅ JWT session |
| 工作台 | `/dashboard` | ✅ 已上线 |
| 积分展示 | `/dashboard/points` | ✅ 展示"待开放" |
| 会员展示 | 定价页 | ✅ 展示"未开放" |
| 后台 CMS | `/admin/cms` | ✅ 文章 CRUD |
| 用户管理 | `/admin/users` | ✅ 查看/编辑用户 |
| 广告管理 | `/admin/ads` | ✅ 广告位 CRUD |
| 点评审核 | `/admin/tool-reviews` | ✅ 审核工具短评 |
| 专题管理 | `/admin/topics`, `/admin/topics/[id]/edit` | ✅ v1.20.18.1 完整编辑器 |
| SEO | `robots.ts`, `sitemap.xml`, `src/lib/seo.ts` | ✅ 动态 |
| 移动端适配 | 全局 | ✅ 375px 无横向溢出 |

## 3. 数据库核心表

| 表 | 用途 |
|---|---|
| `users` | 用户（email, password, role, points, memberUntil） |
| `point_ledgers` | 积分流水 |
| `daily_check_ins` | 签到记录 |
| `articles` | 指南/文章 |
| `article_tags` | 文章标签 |
| `resources` | 资源库 |
| `ad_slots` | 广告位 |
| `tool_reviews` | 工具短评 |
| `topics` | 专题（slug, title, status, youtubeUrl, youtubeVideoId, seoTitle...） |
| `topic_items` | 专题条目（APP 评级清单） |
| `topic_sections` | 专题分区（开篇/避坑/FAQ 等） |
| `links` | 链接收藏 |
| `categories` | 链接分类 |
| `tags` | 标签 |
| `memos` | 便签 |
| `workspaces` | 工作区 |
| `short_links` | 短链 |
| `postal_codes` | 邮编数据（GeoNames 导入） |
| `export_logs` | Word 导出日志 |
| `audit_logs` | 操作审计 |
| `feedback` | 用户反馈 |
| `subscriptions` / `user_subscriptions` | 订阅（预留） |
| `subscriptions_plans` | 订阅计划（预留） |
| `user_tasks` / `user_rewards` | 任务/奖励（预留） |
| `webhooks` | Webhook（预留） |
| `email_subscriptions` | 邮件订阅 |
| `newsletter_broadcasts` | 邮件广播 |

## 4. 仍未完成/半成品模块

| 模块 | 说明 |
|---|---|
| 会员购买 | 支付集成未完成，定价页展示"未开放" |
| 等级勋章 | DB 表预留，无 UI |
| 点评闭环 | 前端可提交短评，后台审核通过。但前台展示未完成 |
| 简易论坛 | 未开始 |
| DIY 小工具沙盒 | 未开始 |
| AI 真实模型接入 | 当前全部 Mock，返回模拟结果 |
| 专题模板批量生成 | 未开始，当前需手动逐条录入 APP |
| 积分兑换 | 展示"待开放" |
| 邮件通知系统 | 表已建，无发送逻辑 |

## 5. 当前生产已知风险和注意事项

### 5.1 Auth Cookie 在 API 路由中不可靠
- **问题**：Client Component 的 `fetch()` 调用 API 路由时，NextAuth session 的 `user.id` 可能丢失，导致 `requireAdmin()` 返回 403
- **已修复**：`getCurrentUserRole()` 增加 JWT token role 快速路径（v1.20.18.1）
- **建议**：后台受保护数据优先使用 Server Component 直查 DB

### 5.2 SSG 构建期 DB 失败 → 空页面缓存
- **问题**：`npm run build` 期间 DB 连接可能失败，导致 Server Component 查询返回空数组，页面被预渲染为空状态并长期缓存
- **已修复**：依赖 DB 的公开页面添加 `export const dynamic = "force-dynamic"`
- **受影响页面**：`/topics`（已加）、`/sitemap.xml`（已加）

### 5.3 数据库连接
- **类型**：VPS 本地 PostgreSQL（非 Neon）
- **连接串**：`DATABASE_URL` 含 `pgbouncer=true&channel_binding=require`
- **psql CLI**：必须剥离查询参数（`sed 's/[?&].*//'`）才能连接
- **备份脚本**：`scripts/ops/backup-postgres.sh`
- **VPS IP**：`142.171.184.179`
- **SSH**：`deploy@142.171.184.179`

### 5.4 部署注意
- **PM2 exec cwd**：`/home/deploy/xixiong-saas`（**不是** `/var/www/xixiong-saas`）
- **必须**：`rm -rf .next && npm run build`（旧 .next 会服务过期代码）
- **端口 3000**：ufw 仅开放 22/80/443，外部无法直接访问
- **git**：VPS 也是完整 git repo，保持与本地同步

### 5.5 历史域名
- **禁止**：代码中不得出现 `kjbxb.com`
- **禁止**：不得出现 `href="/register"`（无注册页）

### 5.6 生产测试账号
```
email: test-admin@local.test
password: TestAdmin2026!
role: admin
```

## 6. 最近 10 个关键 Tag

| Tag | 日期 | 说明 |
|---|---|---|
| `v1.20.18.1-topics-admin-editor-fix` | 2026-05-17 | 专题 CMS 可用性修复（403/统计失败/SSG缓存/YouTube不显示） |
| `v1.20.18-topics-cms-mvp` | 2026-05-17 | 专题 CMS 后台化 MVP（DB 表/seed/Admin API/前台动态路由） |
| `v1.20.17-topic-card-upgrade` | 2026-05-17 | 专题视觉升级（APP 图标/评级 badge/先装清单） |
| `v1.20.16-topic-entry-closed` | 2026-05-17 | 专题入口与收录闭环（Header/Footer/Sitemap/专题页内容） |
| `v1.20.15-topic-system-mvp` | 2026-05-17 | 专题页系统 MVP（/topics + /topics/overseas-essential-apps） |
| `v1.20.14-tool-center` | 2026-05-17 | 工具中心重写 + 新手路径补强 |
| `v1.20.13-production-reality` | 2026-05-17 | 生产真实性 Gate（待开放标签/AI 免责声明） |
| `v1.20.12-mobile-overflow` | 2026-05-17 | 移动端横向溢出修复 |
| `v1.20.11.1-seo-metadata` | 2026-05-17 | SEO 体系（robots/sitemap/metadata） |
| `v1.20.11-seo-foundation` | 2026-05-17 | SEO 基础 |

## 7. 部署流程

### 7.1 标准部署

```bash
# 本地
cd /Users/chq/projects/xixiong-saas
npx tsc --noEmit
npm run build
git add -A && git commit -m "..."
git tag v1.xx.x-description

# 同步 VPS
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.env*' \
  --exclude '.git' \
  --exclude '.vscode' \
  ./ deploy@142.171.184.179:/home/deploy/xixiong-saas/

# VPS 构建 + 重启
ssh deploy@142.171.184.179
cd /home/deploy/xixiong-saas
rm -rf .next
npm run build
pm2 restart xixiong-saas --update-env
sleep 5
pm2 status xixiong-saas

# VPS git 同步
git add -A
git commit -m "..."
git tag -f v1.xx.x-description
```

### 7.2 健康检查

```bash
ssh deploy@142.171.184.179
cd /home/deploy/xixiong-saas

# 核心页面
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/tools
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/topics
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/topics/overseas-essential-apps
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin/topics  # 应 307

# 邮编 API
curl -s 'http://localhost:3000/api/postal-codes?country=CA&q=V6B0A1'

# Sitemap
curl -s http://localhost:3000/sitemap.xml | grep "/topics/"

# PM2
pm2 status xixiong-saas
```

### 7.3 回滚

```bash
# VPS 回滚到上一个 tag
ssh deploy@142.171.184.179
cd /home/deploy/xixiong-saas
git checkout <previous-tag>
rm -rf .next
npm run build
pm2 restart xixiong-saas --update-env
```

### 7.4 DB 备份

```bash
ssh deploy@142.171.184.179
DB_URL=$(grep '^DATABASE_URL=' /home/deploy/xixiong-saas/.env.production | sed 's/^DATABASE_URL=//' | sed "s/^'//" | sed "s/'$//" | sed 's/[?&].*//')
pg_dump "$DB_URL" | gzip > /home/deploy/backups/xixiong-saas-pre-$(date +%Y%m%d).sql.gz
```
