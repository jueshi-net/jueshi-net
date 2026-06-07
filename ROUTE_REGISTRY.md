# Route Registry — jueshi.net / xixiong-saas

> 主工作台体系统一为 `/workspace/*`，旧路由已 redirect。

## 工作台主路由（需登录）

| Route | Page | Status | Notes |
|---|---|---|---|
| `/workspace` | 我的工作台 | ✅ VERIFIED | Server-rendered: welcome, stats, favorites, doc history, quick links. Screenshot: 01-workspace.png |
| `/workspace/tasks` | 待办与任务 | ✅ VERIFIED | Growth tasks with category grouping, checkin, level progress. Screenshot: 02-tasks.png |
| `/workspace/member` | 会员与权益 | ✅ VERIFIED | Role, memberUntil, quota display, benefits comparison table. Screenshot: 03-member.png |
| `/workspace/documents` | 我的单据 | ✅ VERIFIED | Draft list with search, edit, delete, create. Screenshot: 04-documents.png |
| `/workspace/company-profiles` | 公司资料 | ✅ VERIFIED | Company profile CRUD with modal, logo upload gate. Screenshot: 05-company-profiles.png |
| `/workspace/favorites` | 我的收藏 | ✅ VERIFIED | Saved tools/resources with filter tabs. Screenshot: 06-favorites.png |
| `/workspace/settings` | 账号设置 | ✅ VERIFIED | Name, email, 6 theme colors, workspace title, logout. Screenshot: 07-settings.png |

## 旧路由兼容（Redirect）

| Old Route | Redirects To | Status |
|---|---|---|
| `/dashboard` | `/workspace` | ✅ 307 |
| `/dashboard/tasks` | `/workspace/tasks` | ✅ 307 |
| `/dashboard/documents` | `/workspace/documents` | ✅ 307 |
| `/settings` | `/workspace/settings` | ✅ 307 |
| `/favorites` | `/workspace/favorites` | ✅ 307 |
| `/workbench` | `/workspace` | ✅ 307 |

## 公共页面（无需登录）

| Route | Status | Notes |
|---|---|---|
| `/tools` | ✅ Active | 统一工具中心 |
| `/tools/documents` | ✅ Active | 旧版单据模板入口（SEO/landing） |
| `/tools/handover-note` | ✅ Active | 单据工具 |
| `/tools/debit-note` | ✅ Active | 单据工具 |
| `/login` | ✅ Active | 登录页 |
| `/` | ✅ Active | 首页 |

## 管理后台

| Route | Status | Notes |
|---|---|---|
| `/admin` | ✅ Active | 管理面板 |
| `/api/admin/analytics/home` | ✅ Active | 数据分析 API |
