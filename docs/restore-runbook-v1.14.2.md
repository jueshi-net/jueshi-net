# 海外百宝箱 v1.14.2 灾难恢复手册

> **版本**: v1.14.2-stable  
> **Tag**: `v1.14.2-stable`  
> **Commit**: `760f52a`  
> **创建日期**: 2026-05-15  
> **加密备份 SHA256**: `52866250fc8874b8007f50e8399021f985b675aad1403742249a9da25639f512`

---

## 前置条件

- 一台全新的 VPS（Ubuntu 22.04/24.04）
- 已安装 `ssh`、`rsync`、`openssl`、`postgresql-client`
- 备份加密密码（保存在 1Password 或离线记录中）

---

## 一、解密备份包

### 1.1 从 iCloud Drive 获取备份

在 Mac 上：
```bash
# 确认文件已同步
ls -lh ~/Library/Mobile\ Documents/com~apple~CloudDocs/Backups/海外百宝箱/
```

### 1.2 解密

```bash
ENCRYPTED_FILE="xixiong-saas_20260515_215929_FULL_BACKUP.tar.gz.enc"
PASSWORD_FILE="xixiong-saas_20260515_215929_FULL_BACKUP.tar.gz.enc.password"

# 使用密码文件解密
openssl enc -aes-256-cbc -d -salt -pbkdf2 -iter 200000 \
  -in "$ENCRYPTED_FILE" \
  -out "xixiong-saas_20260515_215929_FULL_BACKUP.tar.gz" \
  -pass "file:$PASSWORD_FILE"

# 或手动输入密码
# openssl enc -aes-256-cbc -d -salt -pbkdf2 -iter 200000 \
#   -in "$ENCRYPTED_FILE" \
#   -out "xixiong-saas_20260515_215929_FULL_BACKUP.tar.gz" \
#   -pass stdin
```

### 1.3 验证 SHA256

```bash
echo "52866250fc8874b8007f50e8399021f985b675aad1403742249a9da25639f512  $ENCRYPTED_FILE" | shasum -a 256 -c
```

### 1.4 解压

```bash
tar -xzf xixiong-saas_20260515_215929_FULL_BACKUP.tar.gz
# 解压后目录: xixiong-saas_20260515_215929/
```

---

## 二、恢复源码

### 2.1 确认目录结构

```
xixiong-saas_20260515_215929/
├── local-project/       # 本机开发源码（含 .git）
├── vps-project/         # VPS 生产源码
├── database/            # PostgreSQL 备份
├── vps-config/          # PM2/Nginx/cron/env 配置
├── hermes-openclaw/     # Hermes/OpenClaw 配置
└── meta/                # manifest + SHA256
```

### 2.2 部署源码到 VPS

```bash
# 从 local-project 获取干净代码（含 git 历史）
scp -r xixiong-saas_20260515_215929/local-project/ deploy@VPS_IP:/tmp/xixiong-saas-src/

# SSH 到 VPS
ssh deploy@VPS_IP

# 迁移到生产目录
sudo rm -rf /home/deploy/xixiong-saas/
mv /tmp/xixiong-saas-src /home/deploy/xixiong-saas
cd /home/deploy/xixiong-saas

# 确认 tag
git tag -l | grep v1.14.2-stable
git checkout v1.14.2-stable
```

### 2.3 恢复 .env.production

```bash
# ⚠️ 从安全的密码管理器中恢复以下内容：
# DATABASE_URL (格式: postgresql://bxb_user:<password>@127.0.0.1:5432/bxb_prod?schema=public)
# AUTH_SECRET
# NEXTAUTH_URL
# ADMIN_SECRET
# NODE_ENV=production

nano /home/deploy/xixiong-saas/.env.production
chmod 600 /home/deploy/xixiong-saas/.env.production
```

### 2.4 安装依赖并构建

```bash
cd /home/deploy/xixiong-saas
npm ci
npx prisma generate
npm run build
```

---

## 三、恢复 PostgreSQL

### 3.1 确认数据库服务运行

```bash
sudo systemctl status postgresql
```

### 3.2 创建数据库和用户（如果需要）

```bash
sudo -u postgres psql -c "CREATE USER bxb_user WITH PASSWORD '<密码>';"
sudo -u postgres psql -c "CREATE DATABASE bxb_prod OWNER bxb_user;"
```

### 3.3 恢复数据库

```bash
# 从备份目录获取数据库 dump
DB_DUMP="xixiong-saas_20260515_215929/database/bxb_prod_20260515_135555.sql.gz"

# 验证 SHA256
sha256sum "$DB_DUMP"
# 预期: 7757c92830088c064f94c843fc158d3218b9aef69c1694cdc4ab65b1dce1120e

# 恢复
gunzip -c "$DB_DUMP" | sudo -u postgres psql -U bxb_user -d bxb_prod -h 127.0.0.1
```

### 3.4 运行 migration（确保 schema 一致）

```bash
cd /home/deploy/xixiong-saas
npx prisma migrate deploy
npx prisma generate
```

> **注意**: `migrate deploy` 会跳过已应用的 migration，不会产生冲突。

---

## 四、恢复 PM2 / Nginx

### 4.1 恢复 PM2

```bash
cd /home/deploy/xixiong-saas

# 启动生产服务
pm2 start npm --name "xixiong-saas" -- start

# 保存 PM2 配置
pm2 save
pm2 startup

# 检查状态
pm2 status
pm2 logs xixiong-saas --lines 50
```

### 4.2 恢复 Nginx

```bash
# 查看 VPS 配置包中的 Nginx 配置
tar -xzf xixiong-saas_20260515_215929/vps-config/xixiong-config.tar.gz
cat nginx/nginx-T.txt

# 手动重建或从 nginx-T.txt 恢复:
# sudo cp nginx/sites-available/xixiong-saas /etc/nginx/sites-available/
# sudo ln -sf /etc/nginx/sites-available/xixiong-saas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4.3 恢复 crontab

```bash
# 查看备份中的 crontab
cat crontab-deploy.txt

# 恢复
crontab crontab-deploy.txt
```

---

## 五、恢复 Hermes / OpenClaw

### 5.1 恢复 .hermes

```bash
rsync -a xixiong-saas_20260515_215929/hermes-openclaw/.hermes/ ~/.hermes/
```

### 5.2 恢复 .openclaw

```bash
rsync -a xixiong-saas_20260515_215929/hermes-openclaw/.openclaw/ ~/.openclaw/
```

### 5.3 重启 Hermes 服务

```bash
# 如果使用 PM2 管理 Hermes:
pm2 start ~/.hermes/processes.json 2>/dev/null || true

# 或手动启动
hermes start
```

---

## 六、恢复后验证

### 6.1 服务状态检查

```bash
# PM2
pm2 status

# Nginx
sudo nginx -t
curl -I http://127.0.0.1:3000

# PostgreSQL
sudo -u postgres psql -c "SELECT count(*) FROM users;" -d bxb_prod -h 127.0.0.1
```

### 6.2 端点检查

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/dashboard
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/api/rewards
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/api/me/permissions
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/tools/documents
```

### 6.3 数据完整性

```bash
sudo -u postgres psql -d bxb_prod -h 127.0.0.1 -c "
  SELECT 'users' as tbl, count(*) FROM users
  UNION ALL SELECT 'memos', count(*) FROM memos
  UNION ALL SELECT 'postal_codes', count(*) FROM postal_codes
  UNION ALL SELECT 'point_ledgers', count(*) FROM point_ledgers
  UNION ALL SELECT 'reward_items', count(*) FROM reward_items
  UNION ALL SELECT 'user_rewards', count(*) FROM user_rewards;
"
```

---

## 七、应急恢复顺序

如果全量恢复失败，按以下优先级恢复：

1. **数据库**（最优先）：`database/bxb_prod_*.sql.gz`
2. **源码**：`local-project/` 或 `vps-project/`
3. **环境变量**：从密码管理器恢复 `.env.production`
4. **Nginx 配置**：从 `vps-config/xixiong-config.tar.gz` 提取
5. **Hermes/OpenClaw**：按需恢复

---

## 附录：加密备份 SHA256

| 文件 | SHA256 |
|------|--------|
| `xixiong-saas_20260515_215929_FULL_BACKUP.tar.gz.enc` | `52866250fc8874b8007f50e8399021f985b675aad1403742249a9da25639f512` |
| `bxb_prod_20260515_135555.sql.gz` | `7757c92830088c064f94c843fc158d3218b9aef69c1694cdc4ab65b1dce1120e` |
