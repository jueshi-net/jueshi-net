#!/bin/bash
# Production backup: DB dump + uploads + configs + sha256
# Usage: bash scripts/backup-prod.sh [label]
set -euo pipefail

VPS="deploy@192.129.155.149"
APP_DIR="/home/deploy/xixiong-saas"
LABEL="${1:-manual}"
TS=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/deploy/backups/${LABEL}_${TS}"

echo "═══ Production Backup ═══"
echo "Label: $LABEL"
echo "Timestamp: $TS"
echo "Remote dir: $BACKUP_DIR"
echo ""

ssh "$VPS" "
set -euo pipefail
mkdir -p $BACKUP_DIR
cd $APP_DIR
set -a && source .env.production && set +a

echo '[1/6] DB dump...'
pg_dump \"\$DATABASE_URL\" --format=custom --file=$BACKUP_DIR/db_dump.dump
echo '  Done: '$(ls -lh $BACKUP_DIR/db_dump.dump | awk '{print \$5}')
sha256sum $BACKUP_DIR/db_dump.dump > $BACKUP_DIR/db_dump.dump.sha256

echo '[2/6] Uploads archive...'
tar czf $BACKUP_DIR/uploads.tar.gz -C $APP_DIR public/uploads 2>/dev/null || true
sha256sum $BACKUP_DIR/uploads.tar.gz > $BACKUP_DIR/uploads.tar.gz.sha256

echo '[3/6] Nginx configs...'
cp /etc/nginx/sites-available/xixiong-saas $BACKUP_DIR/nginx-xixiong-saas.conf 2>/dev/null || true
cp /etc/nginx/sites-available/flarum $BACKUP_DIR/nginx-flarum.conf 2>/dev/null || true

echo '[4/6] PM2 dump...'
pm2 dump >/dev/null 2>&1
cp ~/.pm2/dump.pm2 $BACKUP_DIR/pm2-dump.pm2

echo '[5/6] deploy-version...'
cp $APP_DIR/public/deploy-version.json $BACKUP_DIR/ 2>/dev/null || true
cat $APP_DIR/.next/BUILD_ID > $BACKUP_DIR/BUILD_ID 2>/dev/null || true

echo '[6/6] Git commit...'
git -C $APP_DIR rev-parse HEAD > $BACKUP_DIR/git-commit.txt 2>/dev/null || true

echo ''
echo '═══ Backup Complete ═══'
echo 'Files:'
ls -lh $BACKUP_DIR/
echo ''
echo 'SHA256:'
cat $BACKUP_DIR/*.sha256
echo ''
echo 'Backup path: $BACKUP_DIR'
"

echo ""
echo "✅ Backup complete at $BACKUP_DIR"
