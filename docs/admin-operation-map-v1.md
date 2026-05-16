# 后台运营映射 v1 — xixiong-saas 海外百宝箱

> 版本：1.0  
> 创建日期：2026-05-16  
> 状态：待实施  

---

## 目标

让运营人员进入后台后，清楚知道：
- 每个模块的数据来自哪里
- 在哪里编辑内容
- 编辑后在哪里展示
- 当前模块的完成度和后续计划

---

## 后台首页 Dashboard

### 模块总览卡片

每个模块卡片必须包含：

```
┌─────────────────────────────────┐
│ [图标] 模块名称                 │
│                                 │
│ 简要描述                        │
│                                 │
│ 数据来源: DB table / 代码路径   │
│ 前台展示: /path                 │
│                                 │
│ [状态标签] 已上线 / 待完善 / 未实现│
└─────────────────────────────────┘
```

### 快速统计面板

| 指标 | 数值 | 来源 |
|------|------|------|
| 用户总数 | COUNT(*) FROM users | DB |
| 今日活跃用户 | COUNT(DISTINCT userId) FROM sessions | DB |
| 文章总数 | COUNT(*) FROM articles | DB |
| 资源总数 | COUNT(*) FROM resources | DB |
| 广告位 | COUNT(*) FROM ad_slots | DB |
| 待审核短评 | COUNT(*) FROM tool_reviews WHERE status='pending' | DB |
| 单据模板数 | 8（代码固定） | 代码 |
| AI 调用次数 | COUNT(*) FROM ai_usage_logs | DB |

---

## 模块详细映射

### 1. 用户管理

| 项目 | 值 |
|------|-----|
| 后台路径 | `/admin/users` |
| API | `/api/admin/users` |
| 数据来源 | `users` 表 |
| 前台展示 | N/A（后台专用） |
| 可操作 | 查看列表、编辑角色、调整积分、查看会员状态 |
| 关联数据 | `memberships`、`point_ledgers`、`daily_check_ins` |
| 状态 | 已上线 |

---

### 2. 短评审核

| 项目 | 值 |
|------|-----|
| 后台路径 | `/admin/tool-reviews` |
| API | `/api/admin/tool-reviews` |
| 数据来源 | `tool_reviews` 表 |
| 前台展示 | 各工具页面底部（审核通过后展示） |
| 可操作 | 审核（通过/拒绝）、编辑、删除 |
| 状态 | 已上线 |

---

### 3. 文章管理

| 项目 | 值 |
|------|-----|
| 后台路径 | `/admin/cms` |
| API | GET `/api/articles`（公开/分页），POST/PUT/DELETE（requireAdmin） |
| 数据来源 | `articles` 表 |
| 前台展示 | `/guides`（列表）、`/guides/[slug]`（详情） |
| 可操作 | 新建、编辑、删除、发布/草稿切换 |
| 关联表 | `article_tags` |
| 状态 | 已上线 |
| 后续优化 | Markdown 编辑器升级、封面图上传、SEO 字段管理 |

---

### 4. 广告管理

| 项目 | 值 |
|------|-----|
| 后台路径 | `/admin/ads` |
| API | GET `/api/ads`（公开），POST/PUT/PATCH/DELETE（requireAdmin） |
| 数据来源 | `ad_slots` 表 |
| 前台展示 | 首页、文章页、工具页的广告位 |
| 广告类型 | 图片广告、文字广告、HTML/JS 代码广告 |
| 可操作 | 创建、编辑、启用/禁用、删除 |
| 默认广告位 | home-after-tools、home-before-footer、tool-bottom、sidebar、article-bottom |
| 状态 | 已上线 |

---

### 5. 资源库管理

| 项目 | 值 |
|------|-----|
| 后台路径 | `/admin/resources` |
| API | GET `/api/resources`（公开），POST/PATCH/DELETE（requireAdmin） |
| 数据来源 | `resources` 表 |
| 前台展示 | `/resources`（分类索引）、`/resources/[slug]`（分类详情） |
| 可操作 | 新增、编辑、删除、批量导入/导出、分类筛选 |
| 状态 | 已上线/待完善 |
| 后续优化 | 分类管理独立、资源状态管理、审核机制 |

---

### 6. 链接管理

| 项目 | 值 |
|------|-----|
| 后台路径 | `/admin/links` |
| 数据来源 | `links`、`link_categories`、`link_tags` 表 |
| 前台展示 | `/nav` 或集成到首页 |
| 可操作 | 新增、编辑、删除、分类管理 |
| 状态 | 已上线 |

---

### 7. 分类/标签管理

| 项目 | 值 |
|------|-----|
| 后台路径 | `/admin/categories`、`/admin/tags` |
| 数据来源 | `link_categories`、`link_tags` 表 |
| 可操作 | 新增、编辑、删除 |
| 状态 | 已上线 |

---

### 8. 系统设置

| 项目 | 值 |
|------|-----|
| 后台路径 | `/admin/settings` |
| API | `/api/admin/settings` |
| 数据来源 | `site_settings` 表（或环境变量） |
| 可操作 | 网站名称、SEO 设置、功能开关 |
| 状态 | 已上线 |

---

### 9. 数据备份

| 项目 | 值 |
|------|-----|
| 后台路径 | `/admin/backup` |
| 数据来源 | pg_dump 脚本 |
| 可操作 | 手动备份、查看备份列表 |
| 状态 | 已上线 |

---

### 10. 权限/安全

| 项目 | 值 |
|------|-----|
| 后台路径 | `/admin/audit` |
| 数据来源 | `audit_logs` 表 |
| 可操作 | 查看审计日志 |
| 状态 | 已上线 |

---

### 11. 单据/唛头模板

| 项目 | 值 |
|------|-----|
| 后台路径 | 无（代码级管理） |
| 数据来源 | `src/lib/documents/`、`src/lib/labels/` |
| 前台展示 | `/tools/label-maker` |
| 可操作 | 修改代码 |
| 状态 | 代码级管理 |
| 后续优化 | v1.20.4 商务化升级，v1.21 CMS 化 |

---

### 12. 网盘分享

| 项目 | 值 |
|------|-----|
| 后台路径 | 无 |
| 数据来源 | 无 |
| 状态 | 未实现 |
| 计划 | v1.20 或 v1.21 |

---

## 数据流总览

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  后台编辑    │────▶│  数据库表    │────▶│  前台展示    │
│  /admin/cms  │     │  articles    │     │  /guides     │
│  /admin/ads  │     │  ad_slots    │     │  首页/文章页 │
│  /admin/res. │     │  resources   │     │  /resources  │
│  /admin/users│     │  users       │     │  N/A         │
└──────────────┘     └──────────────┘     └──────────────┘
                              │
                              ▼
                     ┌──────────────┐
                     │  代码管理    │
                     │  templates   │
                     │  /tools/label│
                     └──────────────┘
```

---

## 后台运营检查清单

- [ ] 每个模块卡片显示数据来源
- [ ] 每个模块卡片显示前台展示路径
- [ ] Dashboard 显示实时统计
- [ ] 广告管理支持 3 种广告类型
- [ ] 文章管理支持发布/草稿
- [ ] 资源管理支持导入/导出
- [ ] 待审核内容有明显提示
