#!/bin/bash
# scripts/ops/verify-postgres-backup.sh
#
# 验证最新 PostgreSQL 备份的完整性
# 流程：
# 1. 找到最新备份文件
# 2. 创建临时数据库 bxb_restore_test
# 3. 从备份恢复
# 4. 验证关键表和行数
# 5. 删除临时数据库
# 6. 输出 PASS/FAIL

set -euo pipefail

# ===== 配置 =====
DB_NAME="bxb_prod"
DB_USER="bxb_user"
DB_HOST="127.0.0.1"
DB_PORT="5432"
BACKUP_DIR="/var/backups/xixiong-saas/postgres"
TEST_DB="bxb_restore_test"
PASS=true

# ===== 辅助函数 =====
run_sql() {
  PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$TEST_DB" -t -A -c "$1"
}

check() {
  local desc="$1"
  local expected="$2"
  local actual="$3"
  if [ "$actual" = "$expected" ]; then
    echo "  ✅ ${desc}: ${actual}"
  else
    echo "  ❌ ${desc}: expected=${expected}, actual=${actual}"
    PASS=false
  fi
}

check_min() {
  local desc="$1"
  local min="$2"
  local actual="$3"
  if [ "$actual" -ge "$min" ]; then
    echo "  ✅ ${desc}: ${actual} (>= ${min})"
  else
    echo "  ❌ ${desc}: ${actual} (< ${min})"
    PASS=false
  fi
}

# ===== 读取数据库密码 =====
# 从 .env.production 提取 DATABASE_URL 中的密码
ENV_FILE="/home/deploy/xixiong-saas/.env.production"
if [ ! -f "$ENV_FILE" ]; then
  ENV_FILE="/var/www/xixiong-saas/.env.production"
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: .env.production not found"
  exit 1
fi

# Extract password from DATABASE_URL (handles special chars)
DB_PASS=$(grep "^DATABASE_URL=" "$ENV_FILE" | sed 's/DATABASE_URL="postgresql:\/\/[^:]*:\(.*\)@.*/\1/' | sed 's/"$//')

if [ -z "$DB_PASS" ]; then
  echo "ERROR: Could not extract database password"
  exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始验证备份..."

# ===== 1. 找到最新备份 =====
LATEST=$(ls -t "${BACKUP_DIR}"/*.sql.gz 2>/dev/null | head -1)
if [ -z "$LATEST" ]; then
  echo "❌ 未找到备份文件"
  exit 1
fi
echo "  最新备份: ${LATEST}"

# ===== 2. 清理旧测试数据库（如果存在） =====
echo "  清理旧测试数据库..."
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres \
  -c "DROP DATABASE IF EXISTS ${TEST_DB};" > /dev/null 2>&1 || true

# ===== 3. 创建测试数据库 =====
echo "  创建测试数据库 ${TEST_DB}..."
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres \
  -c "CREATE DATABASE ${TEST_DB};" > /dev/null 2>&1

# ===== 4. 恢复备份 =====
echo "  恢复备份到 ${TEST_DB}..."
gunzip -c "$LATEST" | PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$TEST_DB" > /dev/null 2>&1

echo ""
echo "=== 验证结果 ==="

# ===== 5. 验证关键表存在 =====
echo ""
echo "-- 表存在性检查 --"

TABLES=$(run_sql "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;")

# Check for expected tables (using actual Prisma @@map names)
for table in users memos postal_codes event_logs accounts sessions; do
  if echo "$TABLES" | grep -q "^${table}$"; then
    echo "  ✅ 表存在: ${table}"
  else
    echo "  ❌ 表缺失: ${table}"
    PASS=false
  fi
done

# ===== 6. 验证关键数据量 =====
echo ""
echo "-- 数据量检查 --"

# users 表
USER_COUNT=$(run_sql "SELECT count(*) FROM users;" 2>/dev/null || echo "0")
check_min "users 表行数" 0 "$USER_COUNT"

# memos 表
MEMO_COUNT=$(run_sql "SELECT count(*) FROM memos;" 2>/dev/null || echo "0")
check_min "memos 表行数" 0 "$MEMO_COUNT"

# postal_codes 表（核心数据）
POSTAL_COUNT=$(run_sql "SELECT count(*) FROM postal_codes;" 2>/dev/null || echo "0")
check_min "postal_codes 表行数 (必须 >= 2,700,000)" 2700000 "$POSTAL_COUNT"

# event_logs 表
EVENT_COUNT=$(run_sql "SELECT count(*) FROM event_logs;" 2>/dev/null || echo "0")
check_min "event_logs 表行数" 0 "$EVENT_COUNT"

# ===== 7. 验证索引 =====
echo ""
echo "-- 索引检查 --"
INDEX_COUNT=$(run_sql "SELECT count(*) FROM pg_indexes WHERE schemaname = 'public';" 2>/dev/null || echo "0")
check_min "索引数量" 10 "$INDEX_COUNT"

# ===== 8. 清理测试数据库 =====
echo ""
echo "-- 清理测试数据库 --"
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres \
  -c "DROP DATABASE IF EXISTS ${TEST_DB};" > /dev/null 2>&1
echo "  ✅ 测试数据库 ${TEST_DB} 已删除"

# ===== 最终结果 =====
echo ""
echo "=============================="
if [ "$PASS" = true ]; then
  echo "✅ 备份验证: PASS"
else
  echo "❌ 备份验证: FAIL"
fi
echo "=============================="
