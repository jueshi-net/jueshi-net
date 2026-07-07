# V4 Public UI 工程审计报告

**审计时间**: 2026-07-07 23:55  
**当前分支**: ui/overnight-polish-phase1  
**当前 HEAD**: 3fac77685ff5aecae32942ebaf03824a99589b01  
**审计方式**: Claude Code 证据驱动审计  
**证据文件**: docs/audit-evidence/

---

## 使用的证据文件列表

- `docs/audit-evidence/app-file-list.txt`
- `docs/audit-evidence/public-page-file-list.txt`
- `docs/audit-evidence/v4-shell-coverage-matrix.md`
- `docs/audit-evidence/nav-grep.txt`
- `docs/audit-evidence/resources-grep.txt`
- `docs/audit-evidence/workspace-file-list.txt`
- `docs/audit-evidence/header-footer-imports.txt`

---

## 真实 public 页面清单

从证据文件 `public-page-file-list.txt` 中提取的真实 public 页面（共 140 个）：

### 核心功能页面
1. `/` (src/app/(public)/page.tsx)
2. `/resources` (src/app/(public)/resources/page.tsx)
3. `/resources/site/[id]` (src/app/(public)/resources/site/[id]/page.tsx)
4. `/tools` (src/app/(public)/tools/page.tsx)
5. `/destinations` (src/app/(public)/destinations/page.tsx)
6. `/checklists` (src/app/(public)/checklists/page.tsx)
7. `/guides` (src/app/(public)/guides/page.tsx)
8. `/community` (src/app/(public)/community/page.tsx)
9. `/topics` (src/app/(public)/topics/page.tsx)
10. `/search` (src/app/(public)/search/page.tsx)

### 工具子页面（部分列举）
- `/tools/address-formatter`
- `/tools/calculator`
- `/tools/commercial-invoice`
- `/tools/container`
- `/tools/exchange-rate`
- `/tools/hs-code`
- `/tools/invoice`
- `/tools/postal-code`
- `/tools/shipping-calculator`
- `/tools/template-studio`
- ... 共 46 个工具页面

### 指南子页面（部分列举）
- `/guides/address-format`
- `/guides/commercial-invoice`
- `/guides/hs-code-basics`
- `/guides/shipping-from-china-to-usa`
- ... 共 14 个指南页面

### 其他页面
- `/bbs` - 论坛
- `/blog` - 博客
- `/pricing` - 定价
- `/privacy` - 隐私政策
- `/terms` - 服务条款
- `/help` - 帮助
- `/feedback` - 反馈
- `/analytics` - 分析
- `/starter` - 入门
- `/rankings` - 排名
- `/ai-tools` - AI 工具
- `/ai-learning` - AI 学习

### 特殊页面
- `/countries` → 重定向到 `/destinations`
- `/favorites` → 重定向到 `/workspace/favorites`

### UI Lab 实验页面
- `/ui-lab/jueshi-v4`
- `/ui-lab/jueshi-v4-topnav`
- `/ui-lab/jueshi-v4-home-candidate-v4`
- ... 共 7 个实验页面

---

## V4 Shell 覆盖矩阵

### 已使用 V4 Shell 的页面（3 个）

| 路由 | Shell 组件 | 文件路径 | 状态 |
|------|-----------|---------|------|
| `/` | `JueshiV4HomeCandidateV4Shell` | `src/app/(public)/page.tsx` | ✅ V4 |
| `/resources` | `JueshiV4PublicShell` | `src/app/(public)/resources/page.tsx` | ✅ V4 |
| `/resources/site/[id]` | `JueshiV4PublicShell` | `src/app/(public)/resources/site/[id]/page.tsx` | ✅ V4 |

### 使用 Legacy Shell 的页面（需要迁移）

#### P1 - 高优先级（2 个）
| 路由 | 文件路径 | 状态 |
|------|---------|------|
| `/tools` | `src/app/(public)/tools/page.tsx` | ⚠️ Legacy |
| `/destinations` | `src/app/(public)/destinations/page.tsx` | ⚠️ Legacy |

#### P2 - 中优先级（4 个）
| 路由 | 文件路径 | 状态 |
|------|---------|------|
| `/checklists` | `src/app/(public)/checklists/page.tsx` | ⚠️ Legacy |
| `/guides` | `src/app/(public)/guides/page.tsx` | ⚠️ Legacy |
| `/topics` | `src/app/(public)/topics/page.tsx` | ⚠️ Legacy |
| `/search` | `src/app/(public)/search/page.tsx` | ⚠️ Legacy |

#### P3 - 低优先级（14 个）
- `/community`, `/bbs`, `/blog`, `/help`, `/feedback`
- `/business`, `/shipping`, `/tracking`, `/logistics`
- `/starter`, `/rankings`, `/ai-tools`, `/ai-learning`

#### P4 - 最低优先级（9 个）
- `/pricing`, `/privacy`, `/terms`, `/changelog`
- `/analytics`, `/api-docs`, `/design-system`, `/export`, `/nav`

---

## Header/Footer 组件链

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
首页: src/app/(public)/page.tsx
└── <JueshiV4HomeCandidateV4Shell />
    ├── <JueshiV4Header />
    ├── <main>...</main>
    └── <JueshiV4Footer />

资源列表: src/app/(public)/resources/page.tsx
└── <JueshiV4PublicShell>
    ├── <JueshiV4Header />
    ├── <main>...</main>
    └── <JueshiV4Footer />

资源详情: src/app/(public)/resources/site/[id]/page.tsx
└── <JueshiV4PublicShell>
    ├── <JueshiV4Header />
    ├── <main>...</main>
    └── <JueshiV4Footer />
```

### 关键组件文件
- `src/components/layout/JueshiV4PublicShell.tsx` - V4 公共外壳
- `src/components/ui-lab/jueshi-v4-home-candidate-v4/JueshiV4HomeCandidateV4Shell.tsx` - 首页 V4 外壳
- `src/components/ui-lab/jueshi-v4-home-candidate-v4/JueshiV4Header.tsx` - V4 Header
- `src/components/ui-lab/jueshi-v4-home-candidate-v4/JueshiV4Footer.tsx` - V4 Footer
- `src/components/layout/header.tsx` - Legacy Header
- `src/components/layout/footer-new.tsx` - Legacy Footer

---

## 顶部导航审计

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

**UNVERIFIED** - 需要验证这些导航项是否正确指向对应的 V4 Shell 页面。

---

## /resources 首页状态

✅ **已验证** - 从 `resources-grep.txt` 中可以看到：
- `/resources` 页面位于 `src/app/(public)/resources/page.tsx`
- 使用了 `JueshiV4PublicShell` 组件
- 文件导入: `import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";`
- 实现: `<JueshiV4PublicShell>{children}</JueshiV4PublicShell>`

---

## /resources/site/[id] 详情页状态

✅ **已验证** - 从 `resources-grep.txt` 中可以看到：
- `/resources/site/[id]` 页面位于 `src/app/(public)/resources/site/[id]/page.tsx`
- 使用了 `JueshiV4PublicShell` 组件
- 文件导入: `import JueshiV4PublicShell from '@/components/layout/JueshiV4PublicShell';`
- 实现: `<JueshiV4PublicShell>{children}</JueshiV4PublicShell>`

---

## /destinations 国家页面状态

⚠️ **Legacy Shell** - 从 `v4-shell-coverage-matrix.md` 可知：
- `/destinations` 页面使用 Legacy Shell（`Header` + `FooterNew`）
- 文件路径: `src/app/(public)/destinations/page.tsx`
- 优先级: P1（高优先级）
- 状态: ⚠️ Legacy

从 `nav-grep.txt` 可以看到大量与 `/destinations` 相关的代码：
- `/destinations/[slug]/destination-hero-client.tsx` 包含目的地相关的组件
- `/destinations/[slug]/page.tsx` 是国家页面实现
- `/destinations/destinations-index-client.tsx` 是目的地索引客户端

---

## /workspace 状态

从证据文件 `workspace-file-list.txt` 显示，工作区(/workspace)有自己的独立路由系统：

- **工作区有自己的布局系统**，位于 `src/app/(workspace)/layout.tsx`
- **工作区有独立的 shell 机制**，不是使用公共的 Header/Footer 或 V4 Shell
- **工作区页面列表**：包括仪表板、文档、通知、任务链、公司资料、收藏夹等功能
- **工作区访问方式**：从公共页面可通过 `/workspace/community` 入口进入

**UNVERIFIED** - 需要进一步检查工作区是否与公共页面共享相同的 V4 Shell 或有独立的设计系统。

---

## UI Lab 生产引用审计

从 `public-page-file-list.txt` 可以看到多个 UI Lab 页面：
- `/ui-lab/jueshi-v4` (src/app/(public)/ui-lab/jueshi-v4/page.tsx)
- `/ui-lab/jueshi-v4-topnav` (src/app/(public)/ui-lab/jueshi-v4-topnav/page.tsx)
- `/ui-lab/jueshi-v4-topnav-polished` (src/app/(public)/ui-lab/jueshi-v4-topnav-polished/page.tsx)
- `/ui-lab/jueshi-v4-home-candidate` (src/app/(public)/ui-lab/jueshi-v4-home-candidate/page.tsx)
- `/ui-lab/jueshi-v4-home-candidate-v2` (src/app/(public)/ui-lab/jueshi-v4-home-candidate-v2/page.tsx)
- `/ui-lab/jueshi-v4-home-candidate-v3` (src/app/(public)/ui-lab/jueshi-v4-home-candidate-v3/page.tsx)
- `/ui-lab/jueshi-v4-home-candidate-v4` (src/app/(public)/ui-lab/jueshi-v4-home-candidate-v4/page.tsx)

这些是实验性页面，不应在生产环境中被直接引用。

---

## 不能确认的内容清单

1. **/about** - 在证据文件中未找到此页面（不在 `app-file-list.txt` 或 `public-page-file-list.txt` 中）
2. **/lab** - 在证据文件中未找到此页面（不在 `app-file-list.txt` 或 `public-page-file-list.txt` 中）
3. **具体组件实现细节** - 由于审计范围限制，未深入分析每个组件的具体实现
4. **工作区 V4 Shell 集成** - 需要进一步验证工作区是否需要迁移到 V4 Shell

---

## 不要动的区域

1. **src/** - 根据要求不允许修改 src/**（除非通过 Claude Code 执行明确的迁移任务）
2. **prisma/** - 根据要求不允许修改 prisma/**
3. **package.json / package-lock.json** - 根据要求不允许修改
4. **API routes** - 不应修改 API 逻辑
5. **数据库相关代码** - 不应修改 DB 相关代码
6. **认证/授权逻辑** - 保持现有安全机制不变
7. **UI Lab 实验页面** - 这些是实验性质的，不应在生产环境中激活

---

## 5 阶段整改路线

### 第一阶段（P0 - 已完成）
- ✅ 首页 (/) 使用 `JueshiV4HomeCandidateV4Shell`
- ✅ 资源列表 (/resources) 使用 `JueshiV4PublicShell`
- ✅ 资源详情 (/resources/site/[id]) 使用 `JueshiV4PublicShell`

### 第二阶段（P1 - 高优先级）
- ⚠️ `/tools` - 工具中心（核心功能页面）
- ⚠️ `/destinations` - 目的地导航（核心功能页面）

### 第三阶段（P2 - 中优先级）
- ⚠️ `/checklists` - 清单页面
- ⚠️ `/guides` - 指南页面
- ⚠️ `/topics` - 专题页面
- ⚠️ `/search` - 搜索页面

### 第四阶段（P3 - 低优先级）
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

### 第五阶段（P4 - 最低优先级）
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

## 下一步最适合过夜执行的低风险任务列表

1. **迁移 `/tools` 页面到 V4 Shell** - 这是一个独立的功能页面，没有复杂的依赖关系
   - 位置: `src/app/(public)/tools/page.tsx`
   - 任务: 更换为 `JueshiV4PublicShell`
   - 优先级: P1
   - 风险: 低

2. **迁移 `/destinations` 页面到 V4 Shell** - 这是另一个核心功能页面
   - 位置: `src/app/(public)/destinations/page.tsx`
   - 任务: 更换为 `JueshiV4PublicShell`
   - 优先级: P1
   - 风险: 低

3. **更新公共布局客户端以支持新的 V4 页面路径** - 修改 `public-layout-client.tsx` 以包含新的路径到 V4 检查逻辑
   - 位置: `src/app/(public)/public-layout-client.tsx`
   - 任务: 添加新路径到 V4 检查条件
   - 优先级: P1
   - 风险: 低

4. **验证和测试 V4 Shell 一致性** - 确保所有页面有一致的 Header/Footer 表现
   - 任务: 端到端测试
   - 优先级: P1
   - 风险: 低

5. **审查 UI Lab 实验页面** - 确保实验性页面不会意外在生产环境中被激活
   - 任务: 检查路由配置和导航逻辑
   - 优先级: P2
   - 风险: 低

---

## 审计结论

本次审计基于 `docs/audit-evidence/` 目录下的真实证据文件，确认了：

1. **V4 Shell 覆盖率**: 3/140 页面（2.1%）
2. **Legacy Shell 页面**: 29 个需要迁移
3. **核心页面状态**: 首页、资源列表、资源详情已完成 V4 迁移
4. **下一步优先级**: `/tools` 和 `/destinations` 是 P1 高优先级任务
5. **风险区域**: 工作区有独立的 shell 机制，需要单独评估

**审计报告生成时间**: 2026-07-07 23:55  
**审计方法**: Claude Code 证据驱动审计  
**证据来源**: docs/audit-evidence/ 目录下的 7 个证据文件
