# PROJECT_MEMORY.md — 长效记忆锚点

> **AI 纪律声明 (AI DISCIPLINE):**
> *This document serves as the long-term memory for Hermes and other AI agents. ALWAYS read this file before suggesting architecture changes, implementing new auth logic, or modifying core UI components to prevent redundant or conflicting code.*
> *本文件是 AI 介入开发时的唯一权威参照源。任何架构变更、权限逻辑修改、核心 UI 组件修改之前，必须先读取此文件。*

---

## 0. 项目元信息

| 属性 | 值 |
|------|-----|
| 项目名称 | 海外百宝箱 (xixiong-saas) |
| 主域名 | jueshi.net |
| 备用域名 | kjbxb.com |
| 技术栈 | Next.js 16.2.4 + React 19 + Prisma 7.8.0 + PostgreSQL + TailwindCSS v4 |
| 认证 | NextAuth v5 beta (credentials provider + bcryptjs 10 rounds) |
| 支付 | Stripe (订阅制) |
| AI 引擎 | DeepSeek API |
| VPS | RackNerd 8GB KVM |
| SSH 用户 | deploy@jueshi.net (root 登录失败) |
| PM2 工作目录 | /home/deploy/xixiong-saas |
| 部署方式 | rsync → rm -rf .next → npm run build → pm2 reload |
| 最新稳定版本 | v1.32.6 (2026-05-25) |

---

## 1. 架构规范（v1.32.4+ 生效）

### 1.1 Prisma 动态环境加载（彻底修复 P1013）

**文件：** `prisma.config.ts`
**规则：** 必须根据 `NODE_ENV` 动态加载 `.env` 或 `.env.production`：

```typescript
import dotenv from 'dotenv';
import path from 'path';

const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
```

**⚠️ 铁律：** 绝不允许回退到 `import "dotenv/config"` 的静态导入方式，这会导致生产环境 fallback 到 dev.db。

### 1.2 生产数据库配置

| 环境 | 数据库 | 连接方式 |
|------|--------|---------|
| 本地 (.env) | Neon Cloud (dev) | `postgresql://...neon.tech/neondb` |
| VPS (.env.production) | VPS 本地 PG | `postgresql://bxb_user:...@127.0.0.1:5432/bxb_prod` |

**⚠️ 铁律：**
- 本地 `.env` 指向 Neon，VPS `.env.production` 指向本地 PG — **永远不要混淆**
- 执行 `prisma migrate deploy` 时必须显式传 `DATABASE_URL` 或确保 `NODE_ENV=production`
- **禁止**在 VPS 上执行 `prisma db push` 或 `prisma migrate reset`

### 1.3 Prisma Client 构建模式

项目使用 Prisma 7 的 Driver Adapter 模式：
- PostgreSQL: `@prisma/adapter-pg` → `new PrismaPg({ connectionString: dbUrl })`
- SQLite (dev): `@prisma/adapter-better-sqlite3` → `new PrismaBetterSqlite3({ url: "file:..." })`

所有自定义脚本（seeder 等）必须遵循相同的 adapter 模式，不能直接 `new PrismaClient()` 无参数。

---

## 2. pSEO 国别聚合引擎

### 2.1 数据模型

**表名：** `destinations`（22 列）
**关联表：** `destination_tools`, `destination_guides`, `destination_services`

### 2.2 21 国数据源

**种子文件：** `prisma/seeds/destinations-batch.json`
**注入脚本：** `scripts/seed-pseo-destinations.ts`
**当前国家：** 新加坡、英国、德国、美国、澳大利亚、加拿大、马来西亚、法国、日本、新西兰、韩国、泰国、越南、印尼、菲律宾、沙特、阿联酋、墨西哥、巴西、西班牙、意大利

### 2.3 动态 Sitemap

**文件：** `src/app/sitemap.ts`
- `force-dynamic` 运行时生成
- 每小时缓存刷新 (`revalidate: 3600`)
- 动态查询 `prisma.destination.findMany({ where: { isActive: true } })`
- 每个国别页 priority: 0.8, changeFrequency: weekly

---

## 3. 流量探针（零渲染优雅降级）

**文件：** `src/app/layout.tsx`

### 3.1 GA4
```tsx
{process.env.NEXT_PUBLIC_GA_ID && (
  <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
)}
```

### 3.2 Microsoft Clarity
```tsx
{process.env.NEXT_PUBLIC_CLARITY_ID && (
  <Script id="microsoft-clarity" strategy="lazyOnload">
    {`...(clarity bootstrap)...`}
  </Script>
)}
```

**⚠️ 铁律：** 环境变量为空时**必须优雅跳过**，绝不能引发报错或空渲染。Clarity 使用 `lazyOnload` 策略，零首屏性能影响。

---

## 4. UI 组件规范

### 4.1 PaywallModal 组件

**文件：** `src/components/ui/paywall-modal.tsx`
**设计原则：**
- **无状态纯 UI 组件**：只接收 props，不管理自身业务逻辑
- **受控组件**：通过 `isOpen` / `onClose` 由父组件控制显隐
- **零额外依赖**：纯 React + Tailwind CSS 实现，不引入 framer-motion / headlessui
- **SSR 安全**：使用 `mounted` state + `useEffect` 管理动画，避免 hydration mismatch
- **毛玻璃质感**：`bg-white/80 backdrop-blur-xl border-white/20`

**Props API：**
```tsx
interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  onLogin?: () => void;
  onUpgrade?: () => void;
}
```

---

## 5. SSR 与 localStorage 兼容性规则

**⚠️ 铁律：** `localStorage` 是浏览器端 API，SSR 环境下调用会报 `ReferenceError: localStorage is not defined` 并导致 Hydration Mismatch。

**正确处理模式：**
```tsx
// ✅ 正确：使用 mounted state 延迟读取
const [mounted, setMounted] = useState(false);
const [count, setCount] = useState(0);

useEffect(() => {
  setMounted(true);
  setCount(Number(localStorage.getItem('free_usage_count') || 0));
}, []);

if (!mounted) return null; // 或返回默认占位 UI
```

**所有涉及 localStorage 的组件必须遵循此模式。**

---

## 6. 权限系统

### 6.1 角色兼容（v1.32.4 修复）

角色校验必须同时兼容英文和中文：
```typescript
// ✅ 正确
if (role === "admin" || role === "管理员") return "admin";
```

**涉及文件：**
- `src/lib/auth/permissions.ts`
- `src/lib/auth/client-permissions.ts`
- `src/lib/auth-guard.ts`
- `src/middleware/auth-guard.ts`

### 6.2 权限碎片化警告

当前存在多个权限文件（见上），逻辑可能有重复。新增权限逻辑时应优先复用 `permissions.ts` 中的 `requireAdmin()` / `requireMember()` 等函数，避免创建新的权限校验入口。

---

## 7. 部署铁律

### 7.1 标准流程
```bash
rsync -avz --exclude='node_modules' --exclude='.next' --exclude='.git' --exclude='.env' --exclude='prisma/dev.db' ./ deploy@jueshi.net:/home/deploy/xixiong-saas
ssh deploy@jueshi.net "cd /home/deploy/xixiong-saas && rm -rf .next && npm run build && pm2 reload xixiong-saas --update-env"
```

### 7.2 验证清单
- [ ] `curl -s -o /dev/null -w "%{http_code}" https://jueshi.net` → 200
- [ ] `ssh deploy@jueshi.net "grep version /home/deploy/xixiong-saas/package.json | head -1"` → 版本号一致
- [ ] 核心工具页可交互（邮编/汇率/追踪）
- [ ] Sitemap 包含所有新路由

### 7.3 版本号管理
- `package.json` version 必须与 git tag 一致
- 使用 `npm version X.Y.Z --no-git-tag-version` 修改版本号后再手动 `git tag`
- 禁止出现双 tag 或 tag 与 commit 不对应

---

## 8. 测试账号

| 角色 | Email | 密码 |
|------|-------|------|
| 测试用户 | test@jueshi.net | Test123456! |
| 管理员 | 9833416@qq.com | Test123456! |

---

## 9. 历史版本锚点

| 版本 | 日期 | 核心变更 |
|------|------|---------|
| v1.32.4 | 2026-05-25 | 环境错位修复 + 基建脚本归档 + 权限中英兼容 |
| v1.32.5 | 2026-05-25 | Prisma 动态 env 彻底修复 + pSEO 21国数据注入 |
| v1.32.6 | 2026-05-25 | GA4/Clarity 探针 + 动态 Sitemap + PaywallModal 组件 |
| **v1.32.7** | **当前** | **PROJECT_MEMORY 建立 + Freemium 拦截逻辑实装 + Google Spider Ping** |

---

*Last updated: 2026-05-25 (v1.32.7)*
