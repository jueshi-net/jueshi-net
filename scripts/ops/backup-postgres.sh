#!/bin/bash
# scripts/ops/backup-postgres.sh
#
# 本地 PostgreSQL 每日备份脚本
# 输出目录：/var/backups/xixiong-saas/postgres/
# 保留最近 14 天

set -euo pipefail

# ===== 配置 =====
DB_NAME="bxb_prod"
DB_HOST="127.0.0.1"
DB_PORT="5432"
BACKUP_DIR="/var/backups/xixiong-saas/postgres"
RETENTION_DAYS=14

# ===== 读取数据库密码 =====
ENV_FILE="/home/deploy/xixiong-saas/.env.production"
if [ ! -f "$ENV_FILE" ]; then
  ENV_FILE="/var/www/xixiong-saas/.env.production"
fi
if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: .env.production not found"
  exit 1
fi

# Extract user and password from DATABASE_URL
# Format: postgresql://user:password@host:port/db?schema=public
DB_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | sed 's/DATABASE_URL="//' | sed 's/"$//')
DB_USER=$(echo "$DB_URL" | sed 's|postgresql://\([^:]*\):.*|\1|')
DB_PASS=$(echo "$DB_URL" | sed 's|postgresql://[^:]*:\(.*\)@.*|\1|')
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${DATE}.sql.gz"

# ===== 确保目录存在 =====
mkdir -p "$BACKUP_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始备份 ${DB_NAME}..."

# ===== pg_dump =====
PGPASSWORD="$DB_PASS" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  --format=plain \
  --no-owner \
  --no-privileges \
  --no-acl \
  | gzip -9 > "$BACKUP_FILE"

# ===== 输出文件信息 =====
SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
SHA256=$(sha256sum "$BACKUP_FILE" | awk '{print $1}')

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 备份完成"
echo "  路径: ${BACKUP_FILE}"
echo "  大小: ${SIZE}"
echo "  SHA256: ${SHA256}"

# ===== 更新 latest 软链接 =====
ln -sf "$BACKUP_FILE" "${BACKUP_DIR}/latest.sql.gz"

# ===== 清理过期文件 =====
DELETED=$(find "$BACKUP_DIR" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete -print 2>/dev/null | wc -l)
if [ "$DELETED" -gt 0 ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 已清理 ${DELETED} 个过期备份（>${RETENTION_DAYS}天）"
fi

# ===== 列出当前备份 =====
echo ""
echo "当前备份文件："
ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null | tail -5 || echo "（无备份文件）"
