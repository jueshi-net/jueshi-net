# 01 - 项目总体概览

**审计日期**: 2026-07-08  
**审计模式**: PROJECT_INVENTORY_AUDIT_READONLY  
**项目**: jueshi.net / xixiong-saas

---

## 1. 项目基本信息

| 项目 | 值 |
|------|-----|
| **项目名称** | 绝世百宝箱 (jueshi.net) |
| **定位** | 海外华人的实用工具箱 |
| **技术栈** | Next.js 16.2.4 + React 19 + TypeScript |
| **数据库** | PostgreSQL + Prisma 7.8 |
| **认证** | NextAuth v5 (JWT) |
| **部署** | VPS (Production: 104.250.109.99, Staging: 192.129.155.149) |
| **域名** | jueshi.net (Production), i.jueshi.net (Staging) |

---

## 2. 目录结构（一级、二级）

```
xixiong-saas/
├── .hermes/              # Hermes Agent 配置和 pipeline 状态
├── .next/                # Next.js 构建产物（gitignore）
├── .patch-backups/       # Patch 备份（不提交）
├── .vercel/              # Vercel 配置
├── content-drafts/       # 内容草稿
│   ├── checklists/
│   └── topic-packs/
├── data/                 # 数据文件
│   ├── drafts/
│   ├── postal-import-samples/
│   └── review-packs/
├── deploy/               # 部署脚本
├── docs/                 # 项目文档
│   ├── QA/
│   ├── audit-evidence/
│   ├── content-templates/
│   ├── contentops/
│   ├── ops/
│   ├── project-status/
│   ├── seo/
│   └── ui-references/
├── evidence/             # 审计证据（多版本）
├── logs/                 # 运行日志
├── node_modules/         # 依赖（gitignore）
├── prisma/               # 数据库 schema 和迁移
│   ├── migrations/
│   ├── seeds/
│   └── schema.prisma (1969 lines, 90 models)
├── public/               # 静态资源
│   ├── brand/
│   ├── icons/
│   ├── images/
│   └── og/
├── reports/              # 审计报告（多版本）
├── scripts/              # 自动化脚本
│   ├── advanced-crawler/
│   ├── contentops/
│   └── e2e/
├── screenshots/          # 截图证据
├── src/                  # 源代码
│   ├── app/              # Next.js App Router (221 pages)
│   ├── components/       # React 组件 (213 components)
│   ├── data/             # 数据层
│   ├── hooks/            # 自定义 hooks
│   ├── lib/              # 工具库
│   └── types/            # TypeScript 类型
├── test-results/         # 测试结果
├── tests/                # 测试文件
├── tmp/                  # 临时文件
└── tools/                # 工具脚本
    └── jueshi-audit/
```

---

## 3. App Router 结构

### 3.1 路由分组

| 分组 | 用途 | 页面数 | 文件数 |
|------|------|--------|--------|
| `(public)` | 公共页面（无需登录） | ~120 | 177 |
| `(admin)` | 管理后台 | ~60 | 85 |
| `(workspace)` | 用户工作区（需登录） | ~25 | 46 |
| `(dashboard)` | 用户仪表盘 | ~6 | - |
| 根路由 | 认证、订阅等 | ~10 | - |

### 3.2 主要公共页面分类

**核心功能页面**:
- `/` - 首页（V4 Shell）
- `/tools` - 工具中心（V4 Shell）
- `/resources` - 资源目录（V4 Shell）
- `/destinations` - 目的地（V4 Shell）
- `/guides` - 指南（V4 Shell）
- `/checklists` - 清单（V4 Shell）
- `/topics` - 专题
- `/search` - 搜索
- `/countries` - 国家信息
- `/cities` - 城市信息

**工具页面** (`/tools/*`):
- 运费计算器、汇率换算、邮编查询
- HS 编码查询、商业发票生成
- 文档工具（提单、装箱单、报关单）
- Template Studio（模板工作室）
- AI 工具（产品文案、翻译润色、文档摘要）

**内容页面**:
- `/blog` - 博客
- `/bbs` - 论坛
- `/community` - 社区
- `/starter` - 新手指南

**商务页面**:
- `/pricing` - 定价
- `/packages` - 套餐
- `/payment` - 支付
- `/subscribe` - 订阅

### 3.3 管理后台页面 (`/admin/*`)

**内容管理**:
- `/admin/content/guides` - 指南管理
- `/admin/content/checklists` - 清单管理
- `/admin/content/topics` - 专题管理
- `/admin/destinations` - 目的地管理
- `/admin/resources` - 资源管理

**用户管理**:
- `/admin/users` - 用户列表
- `/admin/community/users` - 社区用户
- `/admin/invites` - 邀请码管理
- `/admin/rewards` - 奖励管理

**运营管理**:
- `/admin/analytics` - 数据分析
- `/admin/ads` - 广告管理
- `/admin/notifications` - 通知管理
- `/admin/newsletter` - 邮件订阅

**系统管理**:
- `/admin/settings` - 系统设置
- `/admin/audit` - 审计日志
- `/admin/backup` - 备份管理
- `/admin/health` - 健康检查

### 3.4 工作区页面 (`/workspace/*`)

**个人空间**:
- `/workspace` - 工作区首页
- `/workspace/favorites` - 收藏
- `/workspace/memos` - 备忘录
- `/workspace/documents` - 文档
- `/workspace/templates` - 模板

**业务工具**:
- `/workspace/task-chains` - 任务链
- `/workspace/products` - 产品管理
- `/workspace/company-profiles` - 公司档案
- `/workspace/invites` - 邀请管理

**设置**:
- `/workspace/settings` - 设置
- `/workspace/notifications` - 通知
- `/workspace/member` - 会员信息

---

## 4. 技术栈详情

### 4.1 核心依赖

| 类别 | 技术 | 版本 |
|------|------|------|
| **框架** | Next.js | 16.2.4 |
| **UI** | React | 19.2.4 |
| **语言** | TypeScript | 5.x |
| **样式** | Tailwind CSS | 4.x |
| **数据库** | PostgreSQL | 8.20.0 (pg) |
| **ORM** | Prisma | 7.8.0 |
| **认证** | NextAuth | 5.0.0-beta.31 |
| **支付** | Stripe | 22.1.1 |
| **邮件** | Resend | 6.12.3 |

### 4.2 UI 组件库

| 库 | 用途 |
|----|------|
| `lucide-react` | 图标库 |
| `cmdk` | 命令面板 |
| `recharts` | 图表 |
| `class-variance-authority` | 组件变体 |
| `clsx` + `tailwind-merge` | 样式合并 |

### 4.3 文档处理

| 库 | 用途 |
|----|------|
| `@react-pdf/renderer` | PDF 生成 |
| `jspdf` + `jspdf-autotable` | PDF 导出 |
| `html-to-image` + `html2canvas` | HTML 转图片 |
| `jszip` | ZIP 压缩 |

### 4.4 数据处理

| 库 | 用途 |
|----|------|
| `axios` | HTTP 客户端 |
| `cheerio` | HTML 解析 |
| `gray-matter` | Markdown 前置元数据 |
| `marked` | Markdown 渲染 |
| `pinyin-match` | 拼音匹配 |

### 4.5 开发工具

| 工具 | 用途 |
|------|------|
| `@playwright/test` | E2E 测试 |
| `eslint` + `eslint-config-next` | 代码检查 |
| `tsx` | TypeScript 执行 |
| `dotenv` | 环境变量 |

---

## 5. 主要模块

### 5.1 核心业务模块

| 模块 | 描述 | 状态 |
|------|------|------|
| **工具中心** | 20+ 实用工具 | ✅ 生产可用 |
| **资源目录** | 海外生活资源导航 | ✅ 生产可用 |
| **目的地指南** | 国家/城市信息 | ✅ 生产可用 |
| **文档工具** | 外贸单据生成 | ✅ 生产可用 |
| **任务链** | 业务流程自动化 | ✅ 生产可用 |
| **社区论坛** | 用户交流 | ✅ 生产可用 |
| **会员系统** | 积分、奖励、订阅 | ✅ 生产可用 |
| **广告系统** | 广告位管理 | ✅ 生产可用 |

### 5.2 支撑模块

| 模块 | 描述 | 状态 |
|------|------|------|
| **认证系统** | NextAuth + JWT | ✅ 稳定 |
| **通知系统** | 站内通知 + 邮件 | ✅ 稳定 |
| **搜索系统** | 全文搜索 | ✅ 稳定 |
| **分析系统** | 用户行为追踪 | ✅ 稳定 |
| **审计系统** | 操作日志 | ✅ 稳定 |
| **备份系统** | 数据备份导出 | ✅ 稳定 |

### 5.3 UI 系统

| 系统 | 描述 | 状态 |
|------|------|------|
| **V4 Shell** | 统一页面外壳 | 🟡 部分完成（22/221 页面） |
| **Design System V1** | 14 个基础组件 | 🟡 已建立，未全面应用 |
| **UI Lab** | 45 个实验组件 | 🟡 实验阶段 |
| **Legacy UI** | 旧版组件 | 🔴 需要迁移 |

---

## 6. 关键指标

| 指标 | 数值 |
|------|------|
| **总页面数** | 221 |
| **总组件数** | 213 |
| **API 路由数** | 234 |
| **Prisma Model 数** | 90 |
| **Schema 行数** | 1969 |
| **UI Lab 组件** | 45 |
| **Design System 组件** | 14 |
| **V4 Shell 覆盖** | 22 页面 |
| **Design System 覆盖** | 0 页面 |

---

## 7. 项目健康度评估

### 7.1 优点

✅ **技术栈现代** — Next.js 16 + React 19 + TypeScript  
✅ **架构清晰** — App Router 分组合理  
✅ **功能完整** — 核心业务模块齐全  
✅ **API 丰富** — 234 个路由覆盖全面  
✅ **数据模型完善** — 90 个 Model 支撑业务  

### 7.2 问题

⚠️ **UI 碎片化** — V4 Shell 覆盖率仅 10%  
⚠️ **Design System 未应用** — 14 个组件已建立但 0 页面使用  
⚠️ **重复代码** — 多个版本的 Hero、Shell、Header  
⚠️ **UI Lab 膨胀** — 45 个实验组件，部分已废弃  
⚠️ **页面数量庞大** — 221 页面，维护成本高  

### 7.3 风险

🔴 **Production 未更新** — 所有改动仅在 staging  
🔴 **用户验收未完成** — `/guides` `/checklists` 待验收  
🟡 **Night Pipeline 稳定性** — V3 需要更多实战验证  
🟡 **回滚能力** — 需要确认 production 回滚机制  

---

## 8. 下一步建议

### 8.1 短期（1-2 周）

1. **完成 V4 Shell 统一** — 优先 `/topics` `/search`
2. **用户验收** — `/guides` `/checklists` 页面
3. **Design System 试点** — 从 `/about` `/contact` 开始

### 8.2 中期（1-2 月）

1. **Design System 全面应用** — 替换旧组件
2. **清理 UI Lab** — 删除废弃实验组件
3. **Production 部署** — 通过 audit 后上线

### 8.3 长期（3-6 月）

1. **性能优化** — Lighthouse 评分提升
2. **自动化测试** — E2E 测试覆盖
3. **文档完善** — 组件使用指南、API 文档

---

**文档状态**: PROJECT_OVERVIEW_COMPLETED  
**生成时间**: 2026-07-08 23:15 CST
