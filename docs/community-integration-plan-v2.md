# Discourse 社区整合方案 v2

> 版本: v0.2  
> 状态: 设计草案，待确认  
> 日期: 2026-05-15  
> 基于: v1.12.9-stable (commit `3110be8`)  
> 更新: 基于 `docs/community-integration-plan.md` v0.1 完善

---

## 一、结论：是否仍推荐 Discourse？

**✅ 仍然推荐 Discourse，且是首选。**

对比 v0.1 阶段的评估，结论不变：

| 维度 | Discourse | Flarum | NodeBB |
|------|-----------|--------|--------|
| SSO 成熟度 | ⭐⭐⭐⭐⭐ 内置 discourse_sso | ⭐⭐⭐ 第三方扩展 | ⭐⭐⭐⭐ OAuth2 |
| 移动端体验 | 最佳（PWA） | 一般 | 较好 |
| 社区规模 | 最大 | 中等 | 中等 |
| 反垃圾能力 | 最强（Trust Level） | 较弱 | 中等 |
| 长期维护 | 官方团队 + 商业公司 | 社区驱动 | 社区驱动 |

---

## 二、架构设计：forum.jueshi.net

### 2.1 整体架构

```
                        ┌─────────────────────────────┐
                        │        Cloudflare CDN       │
                        │  (DNS + SSL + 可选缓存)      │
                        └──────────┬──────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
              jueshi.net                   forum.jueshi.net
                    │                             │
        ┌───────────┴───────────┐                 │
        │    RackNerd 8GB KVM   │                 │
        │                       │          ┌──────┴──────┐
        │  Nginx                │          │  同 VPS 或   │
        │  ├─ port 80/443       │          │  独立 VPS    │
        │  │  ├─ / → PM2:3000  │          │             │
        │  │  └─ SSO endpoint   │          │  Nginx      │
        │  │                    │          │  ├─ port 80/443
        │  PM2: Next.js         │          │  └─ / → Discourse:2000
        │  └─ port 3000         │          │             │
        │                       │          │  Docker     │
        │  PostgreSQL: 5432     │          │  ├─ Discourse Web
        │  └─ bxb_prod          │          │  ├─ Discourse Sidekiq
        │                       │          │  ├─ Discourse PG: 5433
        │                       │          │  └─ Redis: 6380
        └───────────────────────┘          └─────────────┘
```

### 2.2 部署方案选择

| 方案 | 优点 | 缺点 | 建议 |
|------|------|------|------|
| **同 VPS**（RackNerd 8GB） | 零额外成本，运维简单 | 内存紧张（总需 ~3.5GB） | ✅ 初期可用 |
| **独立 VPS**（2C4G） | 完全隔离，性能稳定 | $10-15/月 额外成本 | ✅ 用户增长后迁移 |

**内存预算（同 VPS 部署）：**

| 组件 | 峰值内存 |
|------|----------|
| 主站 Next.js | ~200MB |
| 主站 PostgreSQL | ~500MB |
| Discourse Web | ~1200MB |
| Discourse Sidekiq | ~800MB |
| Discourse PostgreSQL | ~500MB |
| Redis (论坛) | ~50MB |
| Nginx + 系统 | ~200MB |
| **总计** | **~3.5GB / 7.8GB** (45%) |

**结论：** 同 VPS 部署可行，有余量。建议 Docker 限制内存上限 `--memory=2g`。

---

## 三、SSO 整合设计

### 3.1 核心原则

1. **主站是唯一身份源头**：所有认证由 `jueshi.net` 处理
2. **论坛不存储密码**：Discourse 不使用自有注册/登录
3. **单向同步**：主站 → 论坛，不同步论坛数据回主站
4. **零信任**：论坛每次登录都向主站验证身份

### 3.2 SSO 登录流程

```
用户访问 forum.jueshi.net
    │
    ▼
Discourse 检测到未登录
    │
    ▼
重定向到 https://jueshi.net/api/forum/sso
    ?sso=<base64_payload>&sig=<hex_signature>
    │
    ▼
主站验证：
1. 检查用户是否已登录（NextAuth session）
2. 验证 sig = HMAC-SHA256(base64_payload, SSO_SECRET)
3. 从数据库获取用户真实角色
    │
    ├── 未登录 → 302 到 /login?returnTo=/api/forum/sso?sso=...
    │               登录后自动回到 SSO 流程
    │
    └── 已登录 → 构造 DiscourseConnect payload
                 base64(nonce=xxx&email=...&external_id=...
                 &username=...&name=...&admin=false&moderator=false)
                 重定向回论坛 /session/sso_login?sso=...&sig=...
    │
    ▼
Discourse 验证签名 → 创建/更新用户 → 完成登录
```

### 3.3 主站端实现

```typescript
// src/app/api/forum/sso/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createHmac } from 'crypto';

const DISCOURSE_URL = process.env.DISCOURSE_URL || 'https://forum.jueshi.net';
const SSO_SECRET = process.env.DISCOURSE_SSO_SECRET || '';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sso = searchParams.get('sso');
  const sig = searchParams.get('sig');

  if (!sso || !sig) {
    return NextResponse.json({ error: 'Missing sso or sig' }, { status: 400 });
  }

  // 验证签名
  const expectedSig = createHmac('sha256', SSO_SECRET).update(sso).digest('hex');
  if (sig !== expectedSig) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }

  // 解码 payload
  const decoded = Buffer.from(sso, 'base64').toString('utf-8');
  const nonce = new URLSearchParams(decoded).get('nonce');
  if (!nonce) {
    return NextResponse.json({ error: 'Missing nonce' }, { status: 400 });
  }

  // 检查用户登录状态
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    // 未登录，重定向到登录页
    const loginUrl = new URL('/login', request.nextUrl.origin);
    loginUrl.searchParams.set('returnTo', `/api/forum/sso?sso=${sso}&sig=${sig}`);
    return NextResponse.redirect(loginUrl.toString());
  }

  // 从数据库获取用户真实角色
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      subscriptions: { where: { status: 'active' }, take: 1 },
    },
  });

  const isAdmin = user?.role === 'admin';
  const isMember = user?.subscriptions?.length > 0 || user?.role === 'admin';

  // 构造 DiscourseConnect payload
  const payload = new URLSearchParams({
    nonce,
    email: session.user.email,
    external_id: user?.id || '',
    username: user?.name || session.user.email.split('@')[0],
    name: user?.name || '',
    avatar_url: user?.image || '',
    admin: String(isAdmin),
    moderator: String(isAdmin),
  });

  const base64Payload = Buffer.from(payload.toString()).toString('base64');
  const returnSig = createHmac('sha256', SSO_SECRET).update(base64Payload).digest('hex');

  // 重定向回 Discourse
  const returnUrl = new URL('/session/sso_login', DISCOURSE_URL);
  returnUrl.searchParams.set('sso', base64Payload);
  returnUrl.searchParams.set('sig', returnSig);
  return NextResponse.redirect(returnUrl.toString());
}
```

---

## 四、用户角色映射

### 4.1 映射表

| 主站角色 | Discourse 角色 | Discourse 组 | 权限说明 |
|----------|---------------|-------------|----------|
| guest | 无法访问 | — | 论坛强制登录 |
| user | trust_level_0 | `basic` | 可阅读、发帖、回复（反垃圾限制） |
| member | trust_level_0 + `会员组` | `basic` + `会员` | 无发帖限制、可上传附件、专属分类 |
| admin | admin + moderator | `admins` + `moderators` | 完整管理权限 |

### 4.2 信任级别（Trust Level）策略

| TL | 条件 | 说明 |
|----|------|------|
| TL0 | 新用户 | 发帖间隔限制、链接数量限制 |
| TL1 | 阅读 5 篇、发帖 1 篇、登录 1 天 | 正常用户 |
| TL2 | 持续活跃（30 天 / 10 话题 / 100 回复） | 可编辑 wiki、创建标签 |
| TL3 | 社区贡献者 | 可编辑分类设置、用户管理 |
| TL4 | 社区领袖 | 管理员手动授予 |

**同步策略：**
- 首次 SSO：根据主站 role 设置初始 group
- 后续 SSO：仅更新 avatar_url、name
- 不覆盖 Discourse 自动升降的 Trust Level
- 会员过期（member → user）：下次 SSO 从 `会员组` 移除

---

## 五、Prisma User 模型预留字段

```prisma
model User {
  // ... 现有字段 ...

  // === 论坛整合预留字段 ===
  forumUserId      Int?       @unique  // Discourse 用户 ID
  forumUsername    String?             // 论坛用户名（可与主站 name 不同）
  forumLastSynced  DateTime?           // 最后一次论坛信息同步时间
  forumTrustLevel  Int?       @default(0)  // 论坛信任级别（只读，由论坛决定）
}
```

**字段说明：**

| 字段 | 类型 | 用途 | 是否必需 |
|------|------|------|----------|
| `forumUserId` | Int?, unique | 关联 Discourse 用户 ID | ✅ 必需 |
| `forumUsername` | String? | 论坛用户名 | ⚠️ 可选 |
| `forumLastSynced` | DateTime? | 同步时间戳 | ⚠️ 可选 |
| `forumTrustLevel` | Int?, default 0 | 论坛信任级别（只读） | ⚠️ 可选 |

---

## 六、论坛备份方案

### 6.1 论坛数据隔离

| 数据类型 | 存储位置 | 备份方式 | 备份频率 |
|----------|----------|----------|----------|
| Discourse PostgreSQL | Docker 卷 | pg_dump → /var/backups/forum-pg/ | 每日 |
| 论坛上传文件 | Docker 卷 | rsync → /var/backups/forum-uploads/ | 每日 |
| 论坛配置 | `/var/discourse/containers/app.yml` | Git 版本控制 | 每次修改 |

### 6.2 备份命令（草案）

```bash
# 备份论坛 PostgreSQL
docker exec discourse pg_dump -U discourse discourse | \
  gzip > /var/backups/forum-pg/discourse-$(date +%F).sql.gz

# 备份上传文件
rsync -a /var/discourse/shared/standalone/uploads/ \
  /var/backups/forum-uploads/$(date +%F)/
```

### 6.3 与主站备份隔离

- 主站备份：`/var/backups/bxb-postgres/`
- 论坛备份：`/var/backups/forum-pg/` + `/var/backups/forum-uploads/`
- 两套备份独立管理，互不影响
- 异地同步时可合并到同一 R2 bucket 的不同目录

---

## 七、实施阶段划分

### 现在做（v1.13）

| 项目 | 说明 | 依赖 |
|------|------|------|
| 1. DNS 配置 | `forum.jueshi.net` A 记录 | 域名管理权限 |
| 2. SSO Secret | 生成 `DISCOURSE_SSO_SECRET` | 无 |
| 3. Prisma 字段 | 预留 forum 相关字段（不执行迁移） | 主站代码变更 |
| 4. 论坛搭建 | Docker 安装 Discourse | 服务器资源 |
| 5. 基础 SSO | 实现 `/api/forum/sso` 路由 | 主站代码变更 |
| 6. 基础映射 | user → TL0, admin → admin | 无 |

### 等会员系统稳定后做

| 项目 | 说明 | 原因 |
|------|------|------|
| 1. member → 会员组同步 | 会员专属分类/权限 | 需会员订阅逻辑稳定 |
| 2. 会员过期降级回调 | Stripe webhook → 论坛权限调整 | 需 webhook 机制 |
| 3. 论坛付费板块 | 会员专属内容 | 需完整会员体系 |
| 4. 双向数据同步 | 论坛帖子数显示在主站 | 非必需，后期优化 |

---

## 八、风险控制

### 8.1 不影响 jueshi.net 的措施

| 措施 | 说明 |
|------|------|
| **独立 Docker 容器** | Discourse 与主站 PM2 进程完全隔离 |
| **独立 PostgreSQL** | 论坛 PG 实例（端口 5433），不与主站共享 |
| **独立 Redis** | 论坛 Redis（端口 6380） |
| **Docker 资源限制** | `--memory=2g --cpus=2` |
| **Nginx 独立 server block** | 论坛和主站配置完全独立 |
| **回滚方案** | 停止 Discourse 容器即可，主站不受影响 |
| **监控告警** | 内存 > 80% 时告警，及时干预 |

### 8.2 风险清单

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Discourse 内存过高 | 主站性能下降 | Docker 内存限制 + 监控 |
| SSO 同步失败 | 用户无法登录论坛 | 保留论坛管理员独立登录 |
| 论坛垃圾内容 | 社区体验差 | Trust Level + 反垃圾插件 + 审核 |
| 论坛数据损坏 | 论坛数据丢失 | 每日备份 + 异地备份 |
| 主站论坛用户不同步 | 体验差 | SSO 每次登录自动更新 |

---

> 本文档为设计草案 v2，等待确认后进入实施阶段。
