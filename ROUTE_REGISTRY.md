# Route Registry — jueshi.net / xixiong-saas

> 主工作台体系统一为 `/workspace/*`，旧路由已 redirect。

## 工作台主路由（需登录）

| Route | Page | Status | Notes |
|---|---|---|---|
| `/workspace` | 我的工作台 | ✅ Active | Server-rendered: welcome, stats, favorites, doc history, quick links |
| `/workspace/tasks` | 待办与任务 | ✅ Active | Growth tasks with category grouping, checkin, level progress |
| `/workspace/member` | 会员与权益 | ✅ Active | Role, memberUntil, quota display, benefits comparison table |
| `/workspace/documents` | 我的单据 | ✅ Active | Draft list with search, edit, delete, create |
| `/workspace/company-profiles` | 公司资料 | ✅ Active | Company profile CRUD with modal, logo upload gate |
| `/workspace/favorites` | 我的收藏 | ✅ Active | Saved tools/resources with filter tabs |
| `/workspace/settings` | 账号设置 | ✅ Active | Name, email, 6 theme colors, workspace title, logout |

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
