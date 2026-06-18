#!/bin/bash
# v1.20.42.8.0 Beta 基线冻结备份脚本
# 创建完整的 Beta 基线备份包

set -e

echo "=== v1.20.42.8.0 Beta 基线冻结备份 ==="
echo "执行时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 配置
BACKUP_DIR="/home/deploy/backups/beta-baseline-v1.20.42.8.0"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
TAG="v1.20.42.8.0-beta-baseline"

# 创建备份目录
echo "1. 创建备份目录..."
mkdir -p "$BACKUP_DIR"
cd "$BACKUP_DIR"

# 2. 数据库备份
echo "2. 备份数据库..."
source /home/deploy/xixiong-saas/.env.production 2>/dev/null || true
if [ -n "$DATABASE_URL" ]; then
    pg_dump "$DATABASE_URL" > "bxb_prod_beta_baseline_${TIMESTAMP}.dump"
    echo "✅ 数据库备份完成: bxb_prod_beta_baseline_${TIMESTAMP}.dump"
    ls -lh "bxb_prod_beta_baseline_${TIMESTAMP}.dump"
else
    echo "❌ 无法获取 DATABASE_URL"
    exit 1
fi

# 3. 上传资产备份
echo "3. 备份上传资产..."
if [ -d "/home/deploy/xixiong-saas/public/uploads" ]; then
    tar -czf "uploads_beta_baseline_${TIMESTAMP}.tar.gz" -C /home/deploy/xixiong-saas public/uploads
    echo "✅ 上传资产备份完成: uploads_beta_baseline_${TIMESTAMP}.tar.gz"
    ls -lh "uploads_beta_baseline_${TIMESTAMP}.tar.gz"
else
    echo "⚠️ 上传资产目录不存在，跳过"
fi

# 4. 运维配置备份
echo "4. 备份运维配置..."
# Nginx 配置
if [ -f "/etc/nginx/sites-available/jueshi.net" ]; then
    cp /etc/nginx/sites-available/jueshi.net "nginx-jueshi.net_${TIMESTAMP}.conf"
    echo "✅ Nginx 配置备份完成"
fi

# PM2 配置
if [ -f "/home/deploy/.pm2/dump.pm2" ]; then
    cp /home/deploy/.pm2/dump.pm2 "pm2-dump_${TIMESTAMP}.json"
    echo "✅ PM2 配置备份完成"
fi

# 环境变量 key 清单（不包含 secret）
echo "5. 生成环境变量 key 清单..."
if [ -f "/home/deploy/xixiong-saas/.env.production" ]; then
    grep -E "^[A-Z_]+=" /home/deploy/xixiong-saas/.env.production | cut -d'=' -f1 | sort > "env-keys_${TIMESTAMP}.txt"
    echo "✅ 环境变量 key 清单生成完成"
    cat "env-keys_${TIMESTAMP}.txt"
else
    echo "⚠️ .env.production 不存在"
fi

# 6. 创建 MANIFEST.txt
echo "6. 创建 MANIFEST.txt..."
cat > MANIFEST.txt <<EOF
# v1.20.42.8.0 Beta 基线冻结备份清单
# 创建时间: $(date '+%Y-%m-%d %H:%M:%S')
# Tag: $TAG

## 备份文件列表

1. 数据库备份:
   - bxb_prod_beta_baseline_${TIMESTAMP}.dump

2. 上传资产备份:
   - uploads_beta_baseline_${TIMESTAMP}.tar.gz

3. 运维配置备份:
   - nginx-jueshi.net_${TIMESTAMP}.conf
   - pm2-dump_${TIMESTAMP}.json

4. 环境变量 key 清单:
   - env-keys_${TIMESTAMP}.txt

## 恢复顺序

1. 恢复数据库: pg_restore -d bxb_prod < bxb_prod_beta_baseline_${TIMESTAMP}.dump
2. 恢复上传资产: tar -xzf uploads_beta_baseline_${TIMESTAMP}.tar.gz -C /home/deploy/xixiong-saas/
3. 恢复 Nginx 配置: cp nginx-jueshi.net_${TIMESTAMP}.conf /etc/nginx/sites-available/jueshi.net
4. 恢复 PM2 配置: pm2 start dump.pm2
5. 重启服务: pm2 restart xixiong-saas

## 风险提示

- 恢复数据库会覆盖当前数据
- 必须先停写入
- 必须先备份当前状态
EOF

echo "✅ MANIFEST.txt 创建完成"

# 7. 创建 SHA256 校验文件
echo "7. 生成 SHA256 校验文件..."
sha256sum *.dump *.tar.gz *.conf *.json *.txt 2>/dev/null > SHA256.txt || true
echo "✅ SHA256.txt 生成完成"
cat SHA256.txt

# 8. 列出所有备份文件
echo "8. 备份文件清单..."
ls -lh "$BACKUP_DIR"

echo ""
echo "=== 备份完成 ==="
echo "备份目录: $BACKUP_DIR"
echo "执行时间: $(date '+%Y-%m-%d %H:%M:%S')"
