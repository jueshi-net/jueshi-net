# VPS 部署 Runbook — 海外百宝箱 v1.12

> 适用于从零开始部署到 Linux VPS，或更新已有部署。

## 1. 环境变量清单

在 `.env.production` 中设置以下变量：

| 变量 | 必需 | 说明 | 示例值 |
|------|------|------|--------|
| `DATABASE_URL` | ✅ | Neon PostgreSQL 连接字符串 | `postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require` |
| `AUTH_SECRET` | ✅ | NextAuth v5 签名密钥（至少32字符随机串） | `openssl rand -base64 32` 输出 |
| `NEXTAUTH_URL` | ❌ | 外部访问URL（生产环境需要） | `https://kjbxb.com` |
| `NEXT_PUBLIC_SITE_URL` | ❌ | 前端基础URL | `https://kjbxb.com` |
| `TRACKING_17TRACK_API_KEY` | ❌ | 17TRACK API密钥（暂未启用） | `""` |
| `GOOGLE_TRANSLATE_API_KEY` | ❌ | Google翻译API密钥（暂未启用） | `""` |
| `STORAGE_ENDPOINT` | ❌ | 对象存储端点（暂未启用） | `""` |
| `STORAGE_ACCESS_KEY` | ❌ | 对象存储AK | `""` |
| `STORAGE_SECRET_KEY` | ❌ | 对象存储SK | `""` |
| `STORAGE_BUCKET` | ❌ | 对象存储桶名 | `""` |
| `CLOUDFLARE_API_TOKEN` | ❌ | Cloudflare DNS API令牌（暂未启用） | `""` |

**注意**：
- `AUTH_SECRET` 不能为空。可以用 `openssl rand -base64 32` 生成
- 数据库连接字符串需要包含 `?sslmode=require`

## 2. 部署命令

```bash
# 1. 进入项目目录
cd /opt/xixiong-saas

# 2. 拉取最新代码
git pull origin main

# 3. 安装依赖（生产环境用 ci，不用 install）
npm ci --production=false

# 4. 生成 Prisma Client
npx prisma generate

# 5. 执行数据库迁移
npx prisma migrate deploy

# 6. 构建生产版本
npm run build

# 7. 启动（开发/测试用）
npm run start

# 或使用 PM2（生产推荐）
pm2 start npm --name "xixiong-saas" -- start -- -p 3000
pm2 save
pm2 startup
```

### 首次部署（新 VPS / 新数据库）

如果数据库是全新的（没有表结构），在 `npx prisma migrate deploy` 之前需要先执行：

```bash
# 新库：执行所有 migration 初始化表结构
npx prisma migrate deploy

# 然后手动标记已知的已执行 migration（如果之前用 db push 创建过表）：
npx prisma migrate resolve --applied 20260505031827_init
npx prisma migrate resolve --applied 20260513120000_add_memo_due_date
```

### 从 db push 迁移到 migrate

如果当前数据库是通过 `prisma db push` 创建的，需要先告诉 Prisma 现有 migration 已执行：

```bash
# 标记已有 migration 为已执行（避免重复创建表）
npx prisma migrate resolve --applied 20260505031827_init
npx prisma migrate resolve --applied 20260513120000_add_memo_due_date

# 之后所有部署使用 migrate deploy 即可
npx prisma migrate deploy
```

## 3. 健康检查

部署完成后，执行以下检查：

```bash
# 基础可达性 — 应返回 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000

# Sitemap — 应返回 200 和 XML 内容
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/sitemap.xml

# 汇率 API — 应返回 200 和 JSON
curl -s http://localhost:3000/api/exchange-rate | head -c 200

# 事件统计 API — 未登录应返回 403
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/events/stats
# 预期: 403

# 登录页面 — 应返回 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/login

# 物流追踪页面 — 应返回 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/tracking

# 工具页面 — 应返回 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/tools/postal-code
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/tools/memo
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/tools/documents
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/tools/shipping-calculator
```

## 4. 失败回滚

```bash
# 1. 回退到上一个 commit
git reset --hard HEAD~1

# 2. 重新构建
npm run build

# 3. 如果使用 PM2
pm2 restart xixiong-saas

# 4. 检查是否恢复
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

### 数据库回滚（如果需要）

```bash
# 查看 migration 状态
npx prisma migrate status

# 如果某个 migration 有问题，回滚一步
npx prisma migrate reset --force

# 然后重新部署
npx prisma migrate deploy
```

## 5. PM2 配置

`ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'xixiong-saas',
    script: 'npm',
    args: 'start -- -p 3000',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
    },
    max_memory_restart: '1G',
    error_file: '/var/log/pm2/xixiong-saas-error.log',
    out_file: '/var/log/pm2/xixiong-saas-out.log',
    merge_logs: true,
  }]
};
```

启动：
```bash
pm2 start ecosystem.config.js
pm2 save
```

## 6. Nginx 反代配置（可选）

```nginx
server {
    listen 80;
    server_name kjbxb.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 7. 已知限制与注意事项

1. **CSS print 变体警告**：`print\:w-full` 等 Tailwind print 变体在 build 时产生 6 个 CSS 解析警告。这些是 Tailwind 已知问题，不影响功能。
2. **Build 需要 DB 连接**：首页和 sitemap.xml 在 build 阶段会尝试连接数据库。已添加降级方案（DB 不可用时使用默认值），但建议 VPS 部署时确保 DATABASE_URL 可达。
3. **权限系统仅前端**：会员权限（`bxb_role`）存储在 localStorage，纯前端限制。如果需要收费/服务端保护，需要对 API routes 添加会员状态校验。详见权限审计部分。
4. **Neon 冷启动**：Neon 数据库有冷启动延迟（约 1-2 秒），首次请求可能较慢。

## 8. 监控建议

```bash
# 检查 PM2 状态
pm2 status

# 查看最近日志
pm2 logs xixiong-saas --lines 50

# 检查内存使用
pm2 monit
```
