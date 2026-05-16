# 数据库源真相文档 (Database Source of Truth)

> 创建日期：2026-05-16
> 更新：v1.19.1 收口

## 1. 当前生产主库

**VPS 本地 PostgreSQL `bxb_prod`**

| 项目 | 值 |
|------|-----|
| Host | 127.0.0.1:5432 |
| 数据库名 | bxb_prod |
| 用户 | bxb_user |
| 数据量 | 2,763,943 条邮编 |
| 包含表 | users, postal_codes, accounts, sessions, memos, point_ledgers, daily_check_ins, tool_reviews, workbench_links, tool_favorites, ai_usage_logs, reward_items, user_rewards, 等 |

## 2. Neon 状态

**Neon 当前不是生产主库。**

v1.19 期间 `.env.production` 被错误配置为指向 Neon，导致：
- migration 跑到了 Neon 而非本地 PG
- 生产 runtime 连接到空库（无邮编数据）

已修复：`.env.production` 的 `DATABASE_URL` 已改回 `postgresql://bxb_user:...@127.0.0.1:5432/bxb_prod`

Neon 中可能残留少量 `ai_usage_logs` 测试数据，视为脏数据，无需迁回。

## 3. 每次 Migration 后必须确认

三者必须一致：

| 配置项 | 来源 | 验证方法 |
|--------|------|----------|
| runtime DATABASE_URL | `.env.production` | `grep DATABASE_URL .env.production` |
| migration DATABASE_URL | `.env.production` 或 `DATABASE_URL` 环境变量 | `npx prisma migrate status` 输出显示的 datasource |
| backup DATABASE_URL | `backup-postgres.sh` | 脚本内硬编码的 `pg_dump -d bxb_prod` |

验证命令：
```bash
# 确认 runtime 连接的是本地 PG
curl -s "https://jueshi.net/api/postal-codes?country=CA&q=V6B0A1" | python3 -c "import sys,json; print(json.load(sys.stdin)['results'][0]['city'])"
# 必须输出: Vancouver

# 确认 postal_codes 行数
sudo -u postgres psql -d bxb_prod -c "SELECT count(*) FROM postal_codes;"
# 必须输出: 2763943
```

## 4. 邮编库行数校验

`postal_codes` 表行数 **2,763,943** 是判断是否连接到正确生产数据库的关键指标。

如果行数明显少于这个数字（例如几千或零），说明连接到了错误的数据库（如 Neon 空库）。

## 5. 禁止操作

❌ **禁止为了解决新表缺失问题直接把 `.env.production` 切到 Neon**

正确的做法：
1. 确认 `.env.production` 指向本地 PG
2. 在本地 PG 上运行 `npx prisma migrate deploy`
3. 确认新表存在：`SELECT to_regclass('public.new_table');`
4. 重建并重启 PM2

## 6. DATABASE_URL 格式

本地 PG 的 DATABASE_URL 应为：
```
postgresql://bxb_user:PASSWORD@127.0.0.1:5432/bxb_prod
```

注意：
- 不使用 `?sslmode=require`（本地连接不需要 SSL）
- 不使用 Neon pooler 参数
- host 必须是 `127.0.0.1` 不是 `localhost`（避免 Unix socket 混淆）

## 7. 回滚方案

如果数据库配置出错：

```bash
cd /home/deploy/xixiong-saas
# 1. 恢复 .env.production
cp .env.production.bak.v1.19.1 .env.production  # 或手动修正
# 2. 确认 DATABASE_URL 指向本地 PG
grep DATABASE_URL .env.production
# 3. 运行 migration
npx prisma migrate deploy
npx prisma generate
# 4. 重建
rm -rf .next && npm run build
# 5. 重启
pm2 restart xixiong-saas --update-env
pm2 save
# 6. 验证
curl -s "https://jueshi.net/api/postal-codes?country=CA&q=V6B0A1"
```
