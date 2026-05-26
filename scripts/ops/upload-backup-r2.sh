#!/bin/bash
# scripts/ops/upload-backup-r2.sh
#
# 上传最新备份到 Cloudflare R2
# 如果没有配置 R2 环境变量，直接提示

set -euo pipefail

BACKUP_DIR="/var/backups/xixiong-saas/postgres"
ENV_FILE="/home/deploy/xixiong-saas/.env.backup"

# ===== 检查 R2 配置 =====
if [ ! -f "$ENV_FILE" ]; then
  echo "R2 not configured: ${ENV_FILE} not found"
  echo "Configure R2 credentials in ${ENV_FILE} (see docs/examples/backup-r2.env.example)"
  exit 0
fi

# 读取环境变量
set -a
source "$ENV_FILE"
set +a

if [ -z "${R2_ACCESS_KEY_ID:-}" ] || [ -z "${R2_SECRET_ACCESS_KEY:-}" ] || [ -z "${R2_BUCKET:-}" ]; then
  echo "R2 not configured: missing required variables in ${ENV_FILE}"
  echo "Required: R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET"
  exit 0
fi

# ===== 找到最新备份 =====
LATEST=$(ls -t "${BACKUP_DIR}"/*.sql.gz 2>/dev/null | head -1)
if [ -z "$LATEST" ]; then
  echo "ERROR: No backup files found in ${BACKUP_DIR}"
  exit 1
fi

FILENAME=$(basename "$LATEST")
OBJECT_KEY="${R2_BACKUP_PREFIX:-xixiong-saas/postgres}/${FILENAME}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 上传备份到 R2..."
echo "  文件: ${FILENAME}"
echo "  Bucket: ${R2_BUCKET}"
echo "  对象路径: ${OBJECT_KEY}"

# 使用 curl 上传到 R2（S3 兼容 API）
DATE=$(date -u +"%a, %d %b %Y %H:%M:%S GMT")
CONTENT_TYPE="application/gzip"
STRING_TO_SIGN="PUT\n\n${CONTENT_TYPE}\n${DATE}\n/${R2_BUCKET}/${OBJECT_KEY}"
SIGNATURE=$(echo -ne "$STRING_TO_SIGN" | openssl sha1 -hmac "$R2_SECRET_ACCESS_KEY" -binary | base64)

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X PUT \
  -H "Host: ${R2_ACCOUNT_ID}.r2.cloudflarestorage.com" \
  -H "Date: ${DATE}" \
  -H "Content-Type: ${CONTENT_TYPE}" \
  -H "Authorization: AWS ${R2_ACCESS_KEY_ID}:${SIGNATURE}" \
  --upload-file "$LATEST" \
  "${R2_ENDPOINT:-https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com}/${R2_BUCKET}/${OBJECT_KEY}")

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ 上传成功"
  echo "  对象路径: s3://${R2_BUCKET}/${OBJECT_KEY}"
else
  echo "❌ 上传失败 (HTTP ${HTTP_CODE})"
  exit 1
fi
