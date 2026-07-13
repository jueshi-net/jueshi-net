# 11 - 页面关系图

**审计日期**: 2026-07-08

---

## 核心页面流转

### 首页入口流

```
首页 (/)
│
├──→ 工具中心 (/tools)
│    ├──→ 工具详情 (/tools/[tool-name])
│    │    ├──→ 收藏 (/favorites)
│    │    └──→ 工作区 (/workspace)
│    └──→ Template Studio (/tools/template-studio)
│         └──→ Canvas 编辑器 (/tools/template-studio/canvas/[id]/edit)
│
├──→ 资源目录 (/resources)
│    └──→ 资源详情 (/resources/site/[id])
│         └──→ 外部链接
│
├──→ 目的地 (/destinations)
│    └──→ 国家详情 (/destinations/[slug])
│         ├──→ 城市信息 (/cities/[city])
│         └──→ 相关指南 (/guides/[slug])
│
├──→ 指南 (/guides)
│    └──→ 指南详情 (/guides/[slug])
│         ├──→ 相关工具 (/tools/[tool-name])
│         └──→ 相关清单 (/checklists/[slug])
│
├──→ 清单 (/checklists)
│    └──→ 清单详情 (/checklists/[slug])
│         └──→ 相关工具 (/tools/[tool-name])
│
├──→ 社区 (/community)
│    ├──→ 帖子详情 (/community/[slug])
│    │    └──→ 用户主页 (/u/[id])
│    └──→ 发帖 (/community/new)
│
└──→ 搜索 (/search)
     └──→ 结果页面
```

---

### 用户工作区流

```
登录 (/login)
│
├──→ 工作区首页 (/workspace)
│    ├──→ 收藏 (/workspace/favorites)
│    │    └──→ 工具详情 (/tools/[tool-name])
│    │
│    ├──→ 备忘录 (/workspace/memos)
│    │
│    ├──→ 文档 (/workspace/documents)
│    │    └──→ 文档工具 (/tools/documents/[type])
│    │
│    ├──→ 产品 (/workspace/products)
│    │
│    ├──→ 公司档案 (/workspace/company-profiles)
│    │
│    ├──→ 任务链 (/workspace/task-chains)
│    │    ├──→ 新建 (/workspace/task-chains/shipping/new)
│    │    └──→ 详情 (/workspace/task-chains/shipping/[id])
│    │
│    ├──→ 模板 (/workspace/templates)
│    │
│    ├──→ 邀请 (/workspace/invites)
│    │
│    ├──→ 通知 (/workspace/notifications)
│    │
│    ├──→ 设置 (/workspace/settings)
│    │
│    └──→ 会员 (/workspace/member)
│         └──→ 定价 (/pricing)
│
└──→ 仪表盘 (/dashboard)
     ├──→ 任务 (/dashboard/tasks)
     ├──→ 文档 (/dashboard/documents)
     ├──→ 通知 (/dashboard/notifications)
     ├──→ 积分 (/dashboard/points)
     └──→ 统计 (/dashboard/stats)
```

---

### 工具使用流

```
工具中心 (/tools)
│
├── 物流工具流
│   ├──→ 运费计算器 (/tools/shipping-calculator)
│   │    └──→ 保存结果 (/workspace)
│   │
│   ├──→ 运费估算器 (/tools/shipping-estimator)
│   │
│   └──→ 集装箱计算 (/tools/container)
│
├── 文档工具流
│   ├──→ 商业发票 (/tools/commercial-invoice)
│   │    ├──→ 保存草稿 (/workspace/documents)
│   │    └──→ 导出 PDF
│   │
│   ├──→ 装箱单 (/tools/packing-list)
│   │
│   ├──→ 报关单 (/tools/customs-generator)
│   │
│   └──→ 提单 (/tools/shipping-label)
│
├── 查询工具流
│   ├──→ 邮编查询 (/tools/postal-code)
│   │    └──→ 相关指南 (/guides)
│   │
│   ├──→ HS 编码 (/tools/hs-code)
│   │    └──→ 相关指南 (/guides/hs-code-basics)
│   │
│   └──→ 汇率换算 (/tools/exchange-rate)
│        └──→ 运费计算 (/tools/shipping-calculator)
│
└── AI 工具流
    ├──→ 产品文案 (/ai-tools/product-copy)
    │
    ├──→ 翻译润色 (/ai-tools/translate-polish)
    │
    └──→ 文档摘要 (/ai-tools/document-summary)
```

---

### 内容浏览流

```
内容入口
│
├── 指南流
│   ├──→ 指南列表 (/guides)
│   │    ├──→ 指南详情 (/guides/[slug])
│   │    │    ├──→ 相关工具 (/tools/[tool-name])
│   │    │    ├──→ 相关清单 (/checklists/[slug])
│   │    │    └──→ 相关资源 (/resources/site/[id])
│   │    └──→ 分类筛选
│   │
│   └──→ 专题指南
│        ├── 国际运输文件 (/guides/international-shipping-documents)
│        ├── HS 编码基础 (/guides/hs-code-basics)
│        ├── 商业发票指南 (/guides/commercial-invoice)
│        └── 各国运输指南
│             ├── 中国到美国 (/guides/shipping-from-china-to-usa)
│             ├── 中国到德国 (/guides/shipping-from-china-to-germany)
│             └── 中国到加拿大 (/guides/shipping-from-china-to-canada)
│
├── 清单流
│   ├──→ 清单列表 (/checklists)
│   │    ├──→ 清单详情 (/checklists/[slug])
│   │    └──→ 分类筛选
│   │
│   └──→ 专题清单
│        ├── 跨境运输清单 (/checklists/cross-border-shipping-checklist)
│        └── 出口文件清单 (/checklists/export-documents-checklist)
│
└── 社区流
    ├──→ 社区首页 (/community)
    │    ├──→ 帖子详情 (/community/[slug])
    │    │    ├──→ 评论
    │    │    ├──→ 点赞
    │    │    ├──→ 收藏
    │    │    └──→ 用户主页 (/u/[id])
    │    │
    │    ├──→ 发帖 (/community/new)
    │    │
    │    └──→ 分类浏览
    │         └──→ 分类详情 (/community/c/[slug])
    │
    └──→ BBS (/bbs)
         ├──→ 帖子详情 (/bbs/[slug])
         └──→ 分类 (/bbs/category/[key])
```

---

### 管理后台流

```
管理后台 (/admin)
│
├── 内容管理
│   ├──→ 指南管理 (/admin/content/guides)
│   │    ├──→ 新建 (/admin/content/guides/new)
│   │    └──→ 编辑 (/admin/content/guides/[id]/edit)
│   │
│   ├──→ 清单管理 (/admin/content/checklists)
│   │    ├──→ 新建 (/admin/content/checklists/new)
│   │    └──→ 编辑 (/admin/content/checklists/[id]/edit)
│   │
│   ├──→ 专题管理 (/admin/content/topics)
│   │    └──→ 编辑 (/admin/content/topics/[id]/edit)
│   │
│   ├──→ 目的地管理 (/admin/destinations)
│   │    └──→ 编辑 (/admin/destinations/[slug]/edit)
│   │
│   └──→ 资源管理 (/admin/resources)
│        └──→ 导入 (/admin/resources/import)
│
├── 用户管理
│   ├──→ 用户列表 (/admin/users)
│   │    └──→ 用户详情 (/admin/users/[id])
│   │
│   ├──→ 社区用户 (/admin/community/users)
│   │
│   └──→ 邀请管理 (/admin/invites)
│        └──→ 奖励 (/admin/invites/rewards)
│
├── 运营管理
│   ├──→ 数据分析 (/admin/analytics)
│   │    ├──→ 仪表盘 (/admin/analytics/dashboard)
│   │    └──→ 任务链 (/admin/analytics/task-chains)
│   │
│   ├──→ 广告管理 (/admin/ads)
│   │    ├──→ 创意 (/admin/ad-creatives)
│   │    └──→ 投放 (/admin/ad-placements)
│   │
│   └──→ 通知管理 (/admin/notifications)
│        └──→ 广播 (/admin/notifications/broadcast)
│
└── 系统管理
     ├──→ 设置 (/admin/settings)
     ├──→ 审计日志 (/admin/audit)
     ├──→ 备份 (/admin/backup)
     └──→ 健康检查 (/admin/health)
```

---

## 页面关系统计

| 关系类型 | 数量 |
|----------|------|
| 首页出发 | 7 条主路径 |
| 工具相关 | 20+ 工具页面 |
| 内容相关 | 30+ 内容页面 |
| 工作区相关 | 24 个工作区页面 |
| 管理后台 | 58 个管理页面 |

---

## 关键路径

### 用户核心路径

1. **工具使用路径**: 首页 → 工具中心 → 工具详情 → 收藏/工作区
2. **内容浏览路径**: 首页 → 指南/清单 → 详情 → 相关工具
3. **社区互动路径**: 首页 → 社区 → 帖子 → 评论/点赞
4. **工作区路径**: 登录 → 工作区 → 各功能模块

### 转化路径

1. **免费 → 付费**: 工具使用 → 定价 → 支付 → 工作区
2. **访客 → 用户**: 浏览 → 注册 → 工作区 → 收藏/文档
3. **用户 → 贡献**: 社区 → 发帖 → 获得奖励

---

**文档状态**: PAGE_RELATION_GRAPH_COMPLETED  
**生成时间**: 2026-07-09 00:05 CST
