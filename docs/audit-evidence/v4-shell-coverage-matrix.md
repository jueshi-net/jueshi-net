# V4 Shell 覆盖矩阵

**生成时间**: 2026-07-07 23:50 CST  
**当前分支**: ui/overnight-polish-phase1  
**当前 HEAD**: 15fe040

---

## 1. Shell 组件定义

### V4 Shell 组件
- `JueshiV4PublicShell` - 用于公共页面的 V4 外壳
- `JueshiV4HomeCandidateV4Shell` - 用于首页的 V4 外壳
- `JueshiV4Header` - V4 版本 Header
- `JueshiV4Footer` - V4 版本 Footer

### Legacy Shell 组件
- `Header` - 旧版 Header（来自 `@/components/layout/header`）
- `FooterNew` - 旧版 Footer（来自 `@/components/layout/footer-new`）

---

## 2. 公共页面覆盖状态

### 已使用 V4 Shell 的页面

| 路由 | Shell 组件 | 文件路径 | 状态 |
|------|-----------|---------|------|
| `/` | `JueshiV4HomeCandidateV4Shell` | `src/app/(public)/page.tsx` | ✅ V4 |
| `/resources` | `JueshiV4PublicShell` | `src/app/(public)/resources/page.tsx` | ✅ V4 |
| `/resources/site/[id]` | `JueshiV4PublicShell` | `src/app/(public)/resources/site/[id]/page.tsx` | ✅ V4 |

### 使用 Legacy Shell 的页面

以下页面通过 `public-layout-client.tsx` 使用 `Header` + `FooterNew`：

| 路由 | 文件路径 | 状态 | 优先级 |
|------|---------|------|--------|
| `/tools` | `src/app/(public)/tools/page.tsx` | ⚠️ Legacy | P1 |
| `/checklists` | `src/app/(public)/checklists/page.tsx` | ⚠️ Legacy | P2 |
| `/guides` | `src/app/(public)/guides/page.tsx` | ⚠️ Legacy | P2 |
| `/destinations` | `src/app/(public)/destinations/page.tsx` | ⚠️ Legacy | P1 |
| `/community` | `src/app/(public)/community/page.tsx` | ⚠️ Legacy | P3 |
| `/topics` | `src/app/(public)/topics/page.tsx` | ⚠️ Legacy | P2 |
| `/bbs` | `src/app/(public)/bbs/page.tsx` | ⚠️ Legacy | P3 |
| `/blog` | `src/app/(public)/blog/page.tsx` | ⚠️ Legacy | P3 |
| `/search` | `src/app/(public)/search/page.tsx` | ⚠️ Legacy | P2 |
| `/pricing` | `src/app/(public)/pricing/page.tsx` | ⚠️ Legacy | P3 |
| `/privacy` | `src/app/(public)/privacy/page.tsx` | ⚠️ Legacy | P4 |
| `/terms` | `src/app/(public)/terms/page.tsx` | ⚠️ Legacy | P4 |
| `/help` | `src/app/(public)/help/page.tsx` | ⚠️ Legacy | P3 |
| `/feedback` | `src/app/(public)/feedback/page.tsx` | ⚠️ Legacy | P3 |
| `/changelog` | `src/app/(public)/changelog/page.tsx` | ⚠️ Legacy | P4 |
| `/analytics` | `src/app/(public)/analytics/page.tsx` | ⚠️ Legacy | P4 |
| `/api-docs` | `src/app/(public)/api-docs/page.tsx` | ⚠️ Legacy | P4 |
| `/design-system` | `src/app/(public)/design-system/page.tsx` | ⚠️ Legacy | P4 |
| `/business` | `src/app/(public)/business/page.tsx` | ⚠️ Legacy | P3 |
| `/shipping` | `src/app/(public)/shipping/page.tsx` | ⚠️ Legacy | P3 |
| `/tracking` | `src/app/(public)/tracking/page.tsx` | ⚠️ Legacy | P3 |
| `/logistics` | `src/app/(public)/logistics/page.tsx` | ⚠️ Legacy | P3 |
| `/export` | `src/app/(public)/export/page.tsx` | ⚠️ Legacy | P4 |
| `/starter` | `src/app/(public)/starter/page.tsx` | ⚠️ Legacy | P3 |
| `/rankings` | `src/app/(public)/rankings/page.tsx` | ⚠️ Legacy | P3 |
| `/nav` | `src/app/(public)/nav/page.tsx` | ⚠️ Legacy | P4 |
| `/ai-tools` | `src/app/(public)/ai-tools/page.tsx` | ⚠️ Legacy | P3 |
| `/ai-learning` | `src/app/(public)/ai-learning/page.tsx` | ⚠️ Legacy | P3 |

### 特殊页面

| 路由 | 文件路径 | 说明 | 状态 |
|------|---------|------|------|
| `/countries` | `src/app/(public)/countries/page.tsx` | 重定向到 `/destinations` | 🔄 Redirect |
| `/favorites` | `src/app/(public)/favorites/page.tsx` | 重定向到 `/workspace/favorites` | 🔄 Redirect |
| `/profile` | `src/app/(public)/profile/page.tsx` | 用户页面，可能需要独立 Shell | ⚠️ Legacy |

---

## 3. Header/Footer 组件链

### 当前架构

```
src/app/(public)/layout.tsx
├── 导入 Header (legacy)
├── 导入 FooterNew (legacy)
└── 渲染 PublicLayoutClient

src/app/(public)/public-layout-client.tsx
├── 检查 pathname
├── 如果匹配 V4 页面（/, /resources, /resources/site/*）
│   └── 返回 <>{children}</>（跳过 Header/Footer）
└── 否则
    ├── <Header />
    ├── <main>{children}</main>
    └── <FooterNew />
```

### V4 页面架构

```
src/app/(public)/page.tsx (首页)
└── <JueshiV4HomeCandidateV4Shell />
    ├── <JueshiV4Header />
    ├── <main>...</main>
    └── <JueshiV4Footer />

src/app/(public)/resources/page.tsx
└── <JueshiV4PublicShell>
    ├── <JueshiV4Header />
    ├── <main>...</main>
    └── <JueshiV4Footer />

src/app/(public)/resources/site/[id]/page.tsx
└── <JueshiV4PublicShell>
    ├── <JueshiV4Header />
    ├── <main>...</main>
    └── <JueshiV4Footer />
```

---

## 4. 顶部导航配置

### 当前导航项（来自 homepageConfig.ts）

| Key | Label | Href | Priority | 状态 |
|-----|-------|------|----------|------|
| nav_home | 首页 | / | core | ✅ |
| nav_tools | 工具 | /tools | core | ✅ |
| nav_checklist | 清单 | /checklists | core | ✅ |
| nav_guides | 指南 | /guides | core | ✅ |
| nav_resources | 资源 | /resources | core | ✅ |
| nav_country | 国家 | /destinations | core | ✅ |
| nav_topics | 专题 | /topics | extended | ✅ |
| nav_community | 社区 | /community | extended | ✅ |

---

## 5. 待改页面优先级

### P0 - 核心页面（已完成）
- ✅ `/` - 首页
- ✅ `/resources` - 资源列表
- ✅ `/resources/site/[id]` - 资源详情

### P1 - 高优先级
- ⚠️ `/tools` - 工具中心（核心功能页面）
- ⚠️ `/destinations` - 目的地导航（核心功能页面）

### P2 - 中优先级
- ⚠️ `/checklists` - 清单页面
- ⚠️ `/guides` - 指南页面
- ⚠️ `/topics` - 专题页面
- ⚠️ `/search` - 搜索页面

### P3 - 低优先级
- ⚠️ `/community` - 社区页面
- ⚠️ `/bbs` - 论坛页面
- ⚠️ `/blog` - 博客页面
- ⚠️ `/help` - 帮助页面
- ⚠️ `/feedback` - 反馈页面
- ⚠️ `/business` - 商业页面
- ⚠️ `/shipping` - 物流页面
- ⚠️ `/tracking` - 追踪页面
- ⚠️ `/logistics` - 物流页面
- ⚠️ `/starter` - 入门页面
- ⚠️ `/rankings` - 排名页面
- ⚠️ `/ai-tools` - AI 工具页面
- ⚠️ `/ai-learning` - AI 学习页面

### P4 - 最低优先级
- ⚠️ `/pricing` - 定价页面
- ⚠️ `/privacy` - 隐私政策
- ⚠️ `/terms` - 服务条款
- ⚠️ `/changelog` - 更新日志
- ⚠️ `/analytics` - 分析页面
- ⚠️ `/api-docs` - API 文档
- ⚠️ `/design-system` - 设计系统
- ⚠️ `/export` - 导出页面
- ⚠️ `/nav` - 导航页面

---

## 6. 风险评估

### 低风险页面（适合优先改造）
1. `/tools` - 独立页面，无复杂依赖
2. `/destinations` - 独立页面，无复杂依赖
3. `/checklists` - 独立页面，无复杂依赖
4. `/guides` - 独立页面，无复杂依赖

### 中风险页面
1. `/community` - 可能有复杂的交互逻辑
2. `/bbs` - 论坛页面，可能有复杂的表单和交互
3. `/blog` - 博客页面，可能有评论系统

### 高风险页面（暂不改造）
1. `/profile` - 用户页面，可能涉及认证和权限
2. `/workspace/*` - 工作空间页面，有独立的 Shell 系统

---

## 7. 改造策略

### 第一阶段（本轮目标）
1. 改造 `/tools` 页面使用 `JueshiV4PublicShell`
2. 改造 `/destinations` 页面使用 `JueshiV4PublicShell`
3. 验证 Header/Footer 一致性
4. 验证导航链接正确性

### 第二阶段
1. 改造 `/checklists` 页面
2. 改造 `/guides` 页面
3. 改造 `/topics` 页面

### 第三阶段
1. 改造 `/community` 页面
2. 改造 `/search` 页面
3. 改造其他 P3 页面

---

**END OF MATRIX**
