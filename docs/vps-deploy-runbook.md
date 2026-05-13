# VPS 部署操作手册 (Runbook)

> 版本：v1.12.3 | 目标：确保当前版本能在干净 VPS 上稳定部署

---

## 1. 环境变量清单

在 VPS 上创建 `.env.production` 或设置系统环境变量：

```bash
# 必需
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>?sslmode=require"
AUTH_SECRET="<生成方法: openssl rand -base64 32>"
NEXTAUTH_URL="https://<your-domain.com>"  # 生产环境域名，不带尾部斜杠

# 可选
ADMIN_SECRET="<管理员后台访问密钥>"
EXCHANGE_RATE_API_KEY="<ExchangeRate-API 密钥，可选，无则使用免费层>"
NEXT_PUBLIC_SITE_URL="https://<your-domain.com>"
```

### 环境变量说明

| 变量 | 必需 | 说明 |
|------|------|------|
| `DATABASE_URL` | ✅ | Neon PostgreSQL 连接字符串（含 pooler） |
| `AUTH_SECRET` | ✅ | NextAuth v5 签名密钥，至少 32 字符 |
| `NEXTAUTH_URL` | ✅ | 生产域名，影响 OAuth 回调 URL |
| `ADMIN_SECRET` | ❌ | 管理员 `/admin` 入口保护（如未实现可留空） |
| `EXCHANGE_RATE_API_KEY` | ❌ | 汇率 API 密钥，无则使用免费层（有调用限制） |
| `NEXT_PUBLIC_SITE_URL` | ❌ | 用于 sitemap.xml 和 SEO 元数据 |

---

## 2. 前置检测命令

在部署前依次执行以下检测：

```bash
# 1. 确认 Node.js 版本 (需要 >= 20)
node --version

# 2. 确认环境变量
echo "DATABASE_URL: ${DATABASE_URL:+SET}"
echo "AUTH_SECRET: ${AUTH_SECRET:+SET}"
echo "NEXTAUTH_URL: ${NEXTAUTH_URL:-NOT SET}"

# 3. 测试数据库连接
npx prisma db execute --stdin --file /dev/null 2>&1 | head -3
# 或更简单：
npx prisma migrate status

# 4. 确认 prisma generate 成功
npx prisma generate

# 5. TypeScript 类型检查
npx tsc --noEmit

# 6. 生产构建
npm run build
```

---

## 3. 部署命令（首次部署）

```bash
# 克隆代码
git clone https://github.com/<your-org>/xixiong-saas.git
cd xixiong-saas

# 安装依赖
npm ci

# 生成 Prisma Client
npx prisma generate

# 首次部署：执行 migration（创建表结构 + dueDate 字段）
npx prisma migrate deploy

# 生产构建
npm run build

# 启动（生产模式）
npm run start
```

### 使用 PM2 管理进程（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start npm --name "xixiong-saas" -- run start

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs xixiong-saas
```

---

## 4. 已有数据库的部署（Neon DB 已存在）

如果 Neon 数据库已经通过 `prisma db push` 同步了 schema：

```bash
# 1. 标记已有 migration 为已应用（避免重复执行 ALTER TABLE 报错）
npx prisma migrate resolve --applied 20260505031827_init
npx prisma migrate resolve --applied 20260513120000_add_memo_due_date

# 2. 之后正常执行
npx prisma generate
npm run build
npm run start
```

或者直接使用 `prisma migrate deploy`，它会自动跳过已应用的 migration。
但如果 `_prisma_migrations` 表为空（之前只用 db push），需要先 resolve。

### 新库 vs 现有库对比

| 场景 | 命令 | 说明 |
|------|------|------|
| 全新空库 | `npx prisma migrate deploy` | 自动创建所有表 + 字段 |
| 已有表结构（db push 同步过） | 先 `migrate resolve --applied` 再 `deploy` | 标记 migration 为已应用 |
| 不确定状态 | `npx prisma migrate status` | 查看哪些 migration 未应用 |

---

## 5. 健康检查

部署完成后，依次执行：

```bash
# 1. 首页加载（应返回 200 + HTML）
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# 预期: 200

# 2. Sitemap（应返回 XML）
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/sitemap.xml
# 预期: 200

# 3. 汇率 API（应返回 JSON 或降级数据）
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/exchange-rate
# 预期: 200

# 4. 事件统计（应返回 403，未授权）
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/events/stats
# 预期: 403

# 5. 登录页面
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/login
# 预期: 200

# 6. 工具页面
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/tools/documents
# 预期: 200

# 7. Tracking 页面
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/tracking
# 预期: 200

# 8. Memo 页面
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/tools/memo
# 预期: 200

# 9. Starter 页面
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/starter
# 预期: 200
```

### 一键健康检查脚本

```bash
#!/bin/bash
BASE="http://localhost:3000"
echo "=== Health Check ==="
for path in "/" "/sitemap.xml" "/api/exchange-rate" "/api/events/stats" "/login" "/tracking" "/tools/memo" "/tools/documents" "/starter"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE}${path}")
  echo "${path}: ${code}"
done
```

---

## 6. 失败回滚

```bash
# 1. 回退到上一个 Git 提交
git reset --hard HEAD~1

# 2. 重新构建
npm ci
npx prisma generate
npm run build

# 3. 重启服务
pm2 restart xixiong-saas

# 或使用 PM2 的回滚（如果用 ecosystem 文件部署）
pm2 deploy production revert
```

### 数据库回滚（仅当 migration 导致问题时）

```bash
# 查看最近的 migration
npx prisma migrate status

# 回退最后一个 migration
npx prisma migrate reset  # ⚠️ 这会删除所有数据！仅用于开发环境
```

生产环境不建议 `migrate reset`。如需回滚 schema 变更，应手动编写反向 SQL。

---

## 7. 已知问题与注意事项

### 7.1 CSS 构建警告
构建时会出现 6 条 Tailwind `print:` 变体的 CSS 警告：
```
'hidden' is not recognized as a valid pseudo-class
```
这是 Tailwind v4 + PostCSS 的已知兼容性问题，**不影响功能**，仅为 warning 非 error。

### 7.2 Build 阶段 DB 访问
首页 (`/`) 在 build 阶段会尝试访问数据库获取统计数据，但已用 `try/catch` 包裹并提供 fallback 默认值。即使 DB 不可用，build 也不会失败。

### 7.3 权限系统
当前权限控制（会员/非会员）完全基于前端 `localStorage.bxb_role`，**无服务端角色校验**。
- 用户可以自行修改 localStorage 绕过限制
- 如果未来开启付费会员，必须在 API 层增加 `session.user.role` 校验
- 当前阶段不影响使用，但需知悉此风险

### 7.4 数据库连接池
Neon 使用 pooler 连接，URL 中需包含 `pgbouncer=true`。当前 `.env` 已正确配置。

---

## 8. 部署后检查清单

- [ ] 所有健康检查端点返回预期状态码
- [ ] 用户注册/登录流程正常
- [ ] Memo 云同步正常（登录后可见）
- [ ] Documents 工具页面加载正常
- [ ] Tracking 页面单号管理正常
- [ ] Sitemap.xml 可访问
- [ ] 静态资源（CSS/JS/图片）加载正常
- [ ] PM2 进程状态为 `online`
- [ ] 错误日志无持续报错 (`pm2 logs`)

---

*最后更新：2026-05-13 | v1.12.3 部署就绪检查*
