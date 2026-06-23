#!/bin/bash
# Production DB Backup → Mac iCloud → Delete from server
# Designed to run from Mac (Hermes host)
# Usage: bash scripts/backup-prod-to-icloud.sh

set -euo pipefail

# Global error trap: output to stdout on any uncaught error
trap 'echo "❌ DB backup FAILED at line $LINENO. Check log: $LOG_FILE"' ERR

# === Config ===
PROD_SSH="jueshi-new"
PROD_DB="bxb_prod"
ICLOUD_DIR="/Users/chq/Library/Mobile Documents/com~apple~CloudDocs/Backups/jueshi-prod-db"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REMOTE_DUMP="/tmp/bxb_prod_${TIMESTAMP}.sql.gz"
LOCAL_FILE="${ICLOUD_DIR}/bxb_prod_${TIMESTAMP}.sql.gz"
LOG_FILE="${ICLOUD_DIR}/backup.log"

# === Functions ===
# All output goes to log file only. stdout stays empty on success (silent cron).
# On failure, error message goes to stdout (triggers cron alert).
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

# === Main ===
mkdir -p "$ICLOUD_DIR"

log "=== START: Production DB backup ==="

# 1. Create compressed dump on production server
log "Step 1: Creating pg_dump on production server..."
ssh "$PROD_SSH" "sudo su - postgres -c 'pg_dump $PROD_DB' | gzip > $REMOTE_DUMP" 2>&1
log "  Dump created on server: $REMOTE_DUMP"

# 2. Verify dump is non-empty (at least 1MB)
REMOTE_SIZE=$(ssh "$PROD_SSH" "stat -c%s $REMOTE_DUMP" 2>/dev/null || echo 0)
if [ "$REMOTE_SIZE" -lt 1048576 ]; then
  echo "❌ DB backup FAILED: Dump too small (${REMOTE_SIZE} bytes). Server dump kept at ${REMOTE_DUMP}"
  log "  ERROR: Dump file too small (${REMOTE_SIZE} bytes). Aborting, keeping server dump for inspection."
  exit 1
fi
log "  Dump size: $((REMOTE_SIZE / 1024 / 1024))MB"

# 3. Download to iCloud
log "Step 2: Downloading to iCloud..."
scp "${PROD_SSH}:${REMOTE_DUMP}" "$LOCAL_FILE" 2>&1
log "  Downloaded to: $LOCAL_FILE"

# 4. Verify local file
LOCAL_SIZE=$(stat -f%z "$LOCAL_FILE" 2>/dev/null || echo 0)
if [ "$LOCAL_SIZE" -lt 1048576 ]; then
  echo "❌ DB backup FAILED: Local file too small (${LOCAL_SIZE} bytes). Server dump kept."
  log "  ERROR: Local file too small (${LOCAL_SIZE} bytes). Aborting, keeping server dump."
  exit 1
fi
log "  Local file size: $((LOCAL_SIZE / 1024 / 1024))MB"

# 5. Verify sizes match (allow 5% difference for SCP overhead)
if [ "$((REMOTE_SIZE * 95 / 100))" -gt "$LOCAL_SIZE" ]; then
  echo "❌ DB backup FAILED: Size mismatch (remote=${REMOTE_SIZE}, local=${LOCAL_SIZE}). Server dump kept."
  log "  ERROR: Size mismatch (remote=${REMOTE_SIZE}, local=${LOCAL_SIZE}). Keeping server dump."
  exit 1
fi
log "  Size verification passed."

# 6. Delete dump from server
log "Step 3: Deleting dump from production server..."
ssh "$PROD_SSH" "rm -f $REMOTE_DUMP"
log "  Server dump deleted. Server storage clean."

# 7. Cleanup old backups (>30 days)
log "Step 4: Cleaning up old backups (>${RETENTION_DAYS} days)..."
DELETED=$(find "$ICLOUD_DIR" -name "bxb_prod_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -print -delete | wc -l)
log "  Deleted ${DELETED} old backup(s)."

# 8. List current backups
log "Step 5: Current backups in iCloud:"
ls -lh "$ICLOUD_DIR"/bxb_prod_*.sql.gz 2>/dev/null | awk '{print "  "$NF" ("$5")"}' | tee -a "$LOG_FILE"

# 9. iCloud sync
log "iCloud will auto-sync this file to Apple Cloud."

log "=== DONE: Backup successful ==="
log "  File: $LOCAL_FILE"
log "  Size: $((LOCAL_SIZE / 1024 / 1024))MB"
