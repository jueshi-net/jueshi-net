# Data Flow — 数据流文档

> 绝世百宝箱数据流架构  
> 最后更新: 2026-07-09

---

## 1. 通用数据流

### 1.1 Server Component 数据流（默认）

```
┌──────────┐     ┌──────────┐     ┌──────────────────┐
│ Browser  │────→│  Route   │────→│ Server Component │
│ (请求)   │     │ (URL)    │     │ (page.tsx)       │
└──────────┘     └──────────┘     └────────┬─────────┘
                                           │
                                    ┌──────┴──────┐
                                    │             │
                              ┌─────┴─────┐ ┌────┴────┐
                              │   Prisma  │ │  API    │
                              │   (直接)  │ │ (fetch) │
                              └─────┬─────┘ └────┬────┘
                                    │             │
                              ┌─────┴─────────────┴─────┐
                              │     PostgreSQL DB        │
                              └─────────────┬────────────┘
                                            │
                              ┌─────────────┴────────────┐
                              │    Server Component       │
                              │    (渲染 HTML)            │
                              └─────────────┬────────────┘
                                            │
                              ┌─────────────┴────────────┐
                              │    HTML Response          │
                              │    (流式传输)             │
                              └─────────────┬────────────┘
                                            │
                              ┌─────────────┴────────────┐
                              │    Browser                │
                              │    (渲染 + Hydration)     │
                              └──────────────────────────┘
```

### 1.2 Client Component 数据流

```
┌──────────┐     ┌──────────┐     ┌──────────────────┐
│ Browser  │────→│  Route   │────→│ Server Component │
│ (请求)   │     │ (URL)    │     │ (page.tsx)       │
└──────────┘     └──────────┘     └────────┬─────────┘
                                           │
                              ┌────────────┴────────────┐
                              │  Client Component        │
                              │  ('use client')          │
                              └────────────┬────────────┘
                                           │
                              ┌────────────┴────────────┐
                              │  useEffect / fetch       │
                              │  (客户端数据获取)         │
                              └────────────┬────────────┘
                                           │
                              ┌────────────┴────────────┐
                              │  /api/* (API Route)      │
                              └────────────┬────────────┘
                                           │
                              ┌────────────┴────────────┐
                              │  Prisma → PostgreSQL     │
                              └────────────┬────────────┘
                                           │
                              ┌────────────┴────────────┐
                              │  JSON Response           │
                              └────────────┬────────────┘
                                           │
                              ┌────────────┴────────────┐
                              │  Client Component        │
                              │  (setState → re-render)  │
                              └─────────────────────────┘
```

### 1.3 Server Action 数据流

```
┌──────────────────┐
│ Client Component │
│ (form submit)    │
└────────┬─────────┘
         │
┌────────┴─────────┐
│ Server Action    │
│ ('use server')   │
└────────┬─────────┘
         │
┌────────┴─────────┐
│ Prisma → DB      │
└────────┬─────────┘
         │
┌────────┴─────────┐
│ revalidatePath   │
│ (缓存失效)       │
└──────────────────┘
```

---

## 2. Workspace 数据流

```
用户操作
│
├── 登录
│   └── POST /api/auth/[...nextauth]
│       └── NextAuth → Prisma → User
│           └── JWT Token → Cookie
│
├── 查看工作区
│   └── GET /workspace
│       └── Server Component
│           └── auth() → 验证 JWT
│               ├── 未登录 → redirect /login
│               └── 已登录 → Prisma → Workspace, WorkspaceMember
│                   └── HTML Response
│
├── 查看收藏
│   └── GET /workspace/favorites
│       └── Client Component (favorites-client.tsx)
│           └── fetch /api/workbench/favorites
│               └── auth() → Prisma → WorkbenchLink, ToolFavorite
│                   └── JSON → setState → render
│
├── 创建备忘录
│   └── POST /api/workspace/memos
│       └── auth() → Prisma → Memo.create()
│           └── JSON { success: true }
│
├── 创建任务链
│   └── POST /api/me/task-chains
│       └── auth() → Prisma → TaskChain.create()
│           └── JSON { id: "..." }
│
└── 修改设置
    └── PUT /api/preferences
        └── auth() → Prisma → UserPreference.upsert()
            └── JSON { success: true }
```

---

## 3. Resources 数据流

```
用户访问 /resources
│
├── Server Component (page.tsx)
│   └── Prisma → Resource.findMany()
│       ├── include: Category, Tag
│       └── orderBy: createdAt desc
│           └── HTML (资源列表)
│
├── 用户点击资源
│   └── GET /resources/site/[id]
│       └── Server Component
│           └── Prisma → Resource.findUnique({ where: { id } })
│               ├── include: Category, Tag
│               └── HTML (资源详情)
│                   └── JueshiV4PublicShell 包裹
│
├── 用户搜索资源
│   └── GET /api/search?q=xxx&type=resource
│       └── Prisma → Resource.findMany({ where: { OR: [...] } })
│           └── JSON (搜索结果)
│
└── Admin 操作
    ├── 导入资源
    │   └── POST /api/admin/resources/import
    │       └── admin auth → Prisma → Resource.createMany()
    │
    └── 检查链接
        └── GET /api/resources/[id]/check-link
            └── admin auth → cheerio → HTTP GET → 验证链接
```

---

## 4. Guides 数据流

```
用户访问 /guides
│
├── Server Component (page.tsx)
│   └── JueshiV4PublicShell 包裹
│       └── Prisma → Article.findMany({ where: { type: 'guide' } })
│           └── HTML (指南列表)
│
├── 用户点击指南
│   └── GET /guides/[slug]
│       └── Server Component
│           ├── 动态指南: Prisma → Article.findUnique({ slug })
│           └── 静态指南: 直接渲染 Markdown
│               └── JueshiV4PublicShell 包裹
│                   └── HTML (指南详情)
│
├── 静态指南页面 (15+)
│   └── /guides/hs-code-basics
│       └── Server Component (静态)
│           └── 直接渲染 → JueshiV4PublicShell
│               └── HTML
│
└── Admin 操作
    ├── 创建指南
    │   └── POST /api/admin/guides
    │       └── admin auth → Prisma → Article.create()
    │
    └── 编辑指南
        └── PUT /api/admin/guides/[id]
            └── admin auth → Prisma → Article.update()
```

---

## 5. Checklists 数据流

```
用户访问 /checklists
│
├── Server Component (page.tsx)
│   └── JueshiV4PublicShell 包裹
│       └── Prisma → Article.findMany({ where: { type: 'checklist' } })
│           └── HTML (清单列表)
│
├── 用户点击清单
│   └── GET /checklists/[slug]
│       └── Server Component
│           └── Prisma → Article.findUnique({ slug })
│               └── JueshiV4PublicShell 包裹
│                   └── HTML (清单详情)
│
└── Admin 操作
    └── 同 Guides (共用 Article Model)
```

---

## 6. Tools 数据流

```
用户访问 /tools
│
├── Server Component (page.tsx)
│   └── JueshiV4PublicShell 包裹
│       └── Prisma → ToolReview.findMany()
│           └── HTML (工具列表)
│
├── 用户使用工具
│   ├── 运费计算器
│   │   └── Client Component
│   │       └── 本地计算 (无需 API)
│   │           └── 结果渲染
│   │
│   ├── 邮编查询
│   │   └── Client Component
│   │       └── fetch /api/postal-codes?q=xxx
│   │           └── Prisma → PostalCode.findMany()
│   │               └── JSON → render
│   │
│   ├── HS 编码查询
│   │   └── Client Component
│   │       └── fetch /api/tools/hs-code?q=xxx
│   │           └── Prisma → HSCode.findMany()
│   │               └── JSON → render
│   │
│   ├── 汇率换算
│   │   └── Client Component
│   │       └── fetch /api/exchange-rate
│   │           └── 外部 API → JSON → render
│   │
│   ├── 商业发票生成
│   │   └── Client Component
│   │       └── 表单输入 → @react-pdf/renderer
│   │           └── PDF 生成 → 下载
│   │
│   └── AI 工具
│       └── Client Component
│           └── fetch /api/ai/generate
│               └── 外部 AI API → JSON → render
│
└── Admin 操作
    └── /admin/tool-reviews
        └── CRUD → Prisma → ToolReview
```

---

## 7. 认证数据流

```
┌──────────────────────────────────────────────────────────┐
│                    Authentication Flow                     │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  登录:                                                    │
│  Browser → POST /api/auth/[...nextauth]                   │
│          → NextAuth → Prisma → User                       │
│          → JWT Token → Cookie (httpOnly)                  │
│                                                           │
│  验证:                                                    │
│  Server Component → auth() → JWT 验证                     │
│          ├── 有效 → 返回 session                          │
│          └── 无效 → null / redirect                       │
│                                                           │
│  API 验证:                                                │
│  API Route → auth() → JWT 验证                            │
│          ├── 有效 → 处理请求                              │
│          └── 无效 → 401 Unauthorized                      │
│                                                           │
│  登出:                                                    │
│  Browser → POST /api/auth/signout                         │
│          → NextAuth → 清除 Cookie                         │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 8. Night Pipeline 数据流

```
┌──────────────────────────────────────────────────────────┐
│                   Night Pipeline V3 Flow                   │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  1. queue.json → night-run.sh 读取任务                    │
│                                                           │
│  2. hermes-health-check.sh → 检查 FD/进程                │
│                                                           │
│  3. claude-generate-patch.sh → Claude Code (-p 模式)      │
│     └── Claude 读取目标文件 (Read)                        │
│     └── Claude 输出完整文件 (<<<FILE:path>>>)             │
│                                                           │
│  4. 脚本提取 → proposals/<task-id>/<path>                │
│                                                           │
│  5. diff -u → patches/<task-id>.patch                    │
│                                                           │
│  6. ai-patch-runner.sh                                    │
│     ├── allowlist 验证                                    │
│     ├── 硬禁止检查                                        │
│     ├── git apply                                         │
│     └── npm run build                                     │
│         ├── 成功 → 继续                                   │
│         └── 失败 → git reset --hard                       │
│                                                           │
│  7. deploy-staging.sh → rsync → build → pm2 restart       │
│                                                           │
│  8. curl → HTTP 200 验证                                  │
│                                                           │
│  9. state.json + completed.json 更新                      │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

**文档状态**: DATA_FLOW_COMPLETED  
**生成时间**: 2026-07-09
