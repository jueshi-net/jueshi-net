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
| 最新稳定版本 | v1.32.16 (2026-05-25) |

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

### 4.2 移动端铁律（v1.32.12 起生效）

**⚠️ 所有组件必须遵守以下移动端约束：**

1. **输入框最小触摸区域**：所有 `<input>`, `<textarea>`, `<button>` 必须设置 `min-h-[44px]`（iOS Human Interface Guidelines 标准）。
2. **数据表格横向滚动防护**：所有包含 `<table>` 或长数据行的容器必须外层包裹 `<div className="w-full overflow-x-auto">`，允许用户横向滑动查看，而不是撑爆页面宽度。
3. **Paywall/Modal 防截断**：弹窗面板必须设置 `max-h-[90vh] overflow-y-auto mx-4`，确保小屏幕下底部按钮可见且可点击。
4. **长文本防溢出**：AI 生成内容、用户输入展示区必须添加 `break-words overflow-wrap-anywhere` 防止横向滚动。
5. **Header 工具栏**：按钮组必须使用 `flex-wrap` 并缩小 `gap`（移动端 `gap-1.5`），标题使用 `text-base sm:text-lg` + `truncate` 防溢出。
6. **Preview 容器**：发票/单据等复杂预览必须有 `overflow-x-auto` 包裹 + `min-w-[320px]` 确保内容不被压缩变形。

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

### 6.3 生产环境 HTTPS Cookie 前缀踩坑（v1.32.11 修复）

**问题**：NextAuth 在生产 HTTPS 环境下会自动给 session cookie 加上 `__Secure-` 前缀，实际 Cookie 名称为 `__Secure-next-auth.session-token`，而非本地 HTTP 下的 `next-auth.session-token`。

**旧代码（仅 HTTP 有效）**：
```typescript
document.cookie.includes("next-auth")  // ❌ 生产 HTTPS 下永远返回 false
```

**修复后（兼容 HTTP + HTTPS）**：
```typescript
document.cookie.includes("next-auth.session-token") ||
document.cookie.includes("__Secure-next-auth.session-token")  // ✅ 双端兼容
```

**涉及修复文件（6 处）**：
- `src/hooks/use-freemium-gate.ts` — 核心 freemium 拦截 hook
- `src/app/(public)/tools/video-script-sop/video-script-sop-client.tsx` — 剩余次数显示
- `src/app/(public)/tools/documents/shipping-label/label-maker-client.tsx` — 评价面板
- `src/app/(public)/ai-tools/product-copy/product-copy-client.tsx` — 评价面板
- `src/app/(public)/ai-tools/translate-polish/translate-polish-client.tsx` — 评价面板
- `src/app/(public)/ai-tools/document-summary/document-summary-client.tsx` — 评价面板

**⚠️ 铁律**：任何新的客户端登录态判定逻辑必须同时检查 `next-auth.session-token` 和 `__Secure-next-auth.session-token`，或优先使用 `useSession()` hook。

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

## 8. 商业化与支付铁律（v1.32.13 起生效）

**⚠️ 涉及资金流动，必须零容忍任何未捕获异常。**

1. **Stripe 生产密钥强制校验**：`src/lib/stripe.ts` 在 `NODE_ENV=production` 时检测 `STRIPE_SECRET_KEY` 是否以 `sk_live_` 开头。如使用 `sk_test_` 则 **直接 throw Error 阻止启动**，并输出高优先级日志。
2. **Webhook 签名必须校验**：所有 `/api/webhooks/stripe` 请求必须通过 `stripe.webhooks.constructEvent()` 验证签名。签名无效直接返回 400，不执行任何业务逻辑。
3. **会员状态更新必须后台异步**：`checkout.session.completed` 事件触发后，由 Webhook 后端调用 Prisma 更新 `User` 模型的 `stripeSubscriptionId` / `stripeCurrentPeriodEnd` 字段。**严禁前端伪造成功状态或直接修改会员权限。**
4. **Success/Cancel URL 严禁写死 localhost**：必须使用 `process.env.NEXT_PUBLIC_SITE_URL || 'https://jueshi.net'` 动态构建。
5. **Checkout API 必须鉴权**：未登录用户调用 `/api/checkout` 返回 401 + `redirectTo`，前端自动跳转 `/login?callbackUrl=/pricing`。
6. **订阅取消处理**：`customer.subscription.deleted` 事件触发后，清空用户 `stripeSubscriptionId` / `stripePriceId` / `stripeCurrentPeriodEnd`，降级为免费用户。

---

## 9. 测试账号

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
| **v1.32.8** | 2026-05-25 | 视频 SOP 生成器落地 + .cursorrules + AI 路由扩展 |
| **v1.32.9** | 2026-05-25 | **AI 生产密钥激活** — .env.production 追加 AI_API_KEY/AI_ENABLED + PM2 --update-env 强制刷新 |
| **v1.32.10** | 2026-05-25 | **部署基建固化** — deploy.sh 安全脚本（7 重 exclude 保护）+ 留学生集运专区 /starter/student |
| **v1.32.11** | 2026-05-25 | **HTTPS 鉴权修复 + 全局导航打通** — 生产环境 __Secure-next-auth.session-token Cookie 兼容修复（6 处）+ SOP/学生专区注册至 Cmd+K 搜索与工具广场 |
| **v1.32.12** | 2026-05-25 | **全站移动端深度适配** — Paywall max-h-[90vh] overflow-y-auto、输入框 min-h-[44px]、发票表格 overflow-x-auto、SOP 长文本 break-words、Header 响应式优化 |
| **v1.32.13** | 2026-05-25 | **Stripe 生产支付全链路打通** — Mock→真实 SDK、sk_live_ 强制校验、Webhook 签名验证、Checkout API 鉴权、Pricing 页跳转打通 |
| **v1.32.14** | 2026-05-25 | **Admin 权限硬编码清扫 + AI 矿机重启** — 36 文件 role === 'admin' → isAdminRole()/isElevatedRole() 统一兼容、crawler:daemon npm 脚本、DeepSeek 超时 30s 捕获 |
| **v1.32.15** | 2026-05-25 | **CSS 零警告净化 + 数字矿机 PM2 守护进程化** — 修复 6 个 print: 变体解析警告（.print\\:hidden → @media print 原生类名）、创建 ecosystem.config.js 双进程配置（xixiong-saas + jueshi-miner）、deploy.sh 追加矿机管理提示 |
| **v1.32.16** | 2026-05-25 | **源码远端锚定 + Newsletter 捕获引擎落地** — 添加 GitHub 远端仓库 (jueshi-net/jueshi-net)、创建 newsletter-form.tsx 组件（inline/footer 双变体）、/api/newsletter/subscribe 端点（含去重防重逻辑）、首页+Footer+留学生专区三处挂载 |

---

## 10. 数字矿机与后台 Worker 运维篇

### 10.1 矿机架构

**进程名：** `jueshi-miner`
**脚本：** `scripts/advanced-crawler/daemon.ts`
**运行时：** `npx tsx` (Node.js 20+)
**PM2 配置：** `ecosystem.config.js` 中的第 2 个 app 节点

### 10.2 启动与停止命令

```bash
# VPS 上启动矿机（24/7 守护进程）
ssh deploy@jueshi.net 'cd /home/deploy/xixiong-saas && NODE_ENV=production pm2 start ecosystem.config.js --only jueshi-miner'

# 查看矿机状态
ssh deploy@jueshi.net 'pm2 list | grep miner'

# 查看矿机日志
ssh deploy@jueshi.net 'pm2 logs jueshi-miner --lines 50'

# 停止矿机
ssh deploy@jueshi.net 'pm2 stop jueshi-miner'

# 重启矿机
ssh deploy@jueshi.net 'pm2 restart jueshi-miner'
```

### 10.3 队列管理规则

| 文件 | 用途 | 操作规则 |
|------|------|---------|
| `pending-urls.txt` | 待处理 URL 队列 | 每行一个 URL，矿机从顶部逐条消费 |
| `processed-urls.txt` | 已处理 URL 归档 | 成功/拒绝/超时的 URL 自动追加，**禁止手动删除** |
| `failed-urls.txt` | 失败重试追踪 | 格式 `url|retryCount`，达到 MAX_RETRIES(3) 后自动移入 processed |
| `daemon.log` | 运行日志 | 按时间戳滚动，定期清理旧日志（`tail -10000 > daemon.log`） |

### 10.4 矿机工作流程

```
pending-urls.txt → 读取首条 URL → 检查 DB 去重 → 随机休眠(3-8s)
  → 抓取页面(crawlUrl) → AI 评估(evaluateWithAI) → 质量打分
  → 通过 → Prisma upsert 入库 → 移入 processed
  → 拒绝/失败 → 记录失败计数 → 达 3 次 → 移入 processed
```

### 10.5 安全注意事项

- **矿机默认不随部署自动启动** — 需主理人手动 `pm2 start` 激活，防止意外消耗 AI API 配额
- **环境变量依赖** — 需要 `AI_API_KEY`, `AI_API_BASE_URL`, `AI_MODEL`, `DATABASE_URL` 已配置
- **频率控制** — 每条 URL 之间随机休眠 3-8 秒，防止目标站点反爬
- **终极容错** — 任何未捕获异常都不会导致进程退出，失败 URL 移入 processed 避免死循环

---

*Last updated: 2026-05-25 (v1.32.16)*
