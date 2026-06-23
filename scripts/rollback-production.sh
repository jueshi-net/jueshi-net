#!/bin/bash
# Production rollback — DOCUMENTED, NON-DESTRUCTIVE, requires manual confirmation
# Usage: bash scripts/rollback-production.sh
#
# This script does NOT auto-execute destructive actions.
# It prints the rollback steps and requires explicit confirmation.
set -euo pipefail

VPS="deploy@192.129.155.149"
APP_DIR="/home/deploy/xixiong-saas"

echo "═══════════════════════════════════════════════════"
echo "  PRODUCTION ROLLBACK PROCEDURE"
echo "═══════════════════════════════════════════════════"
echo ""

# Show current state
echo "=== Current State ==="
ssh "$VPS" "cd $APP_DIR && cat public/deploy-version.json 2>/dev/null; echo ''; git log --oneline -3; echo ''; pm2 describe xixiong-saas 2>&1 | grep -E 'restarts|uptime|status'"
echo ""

# List available backups
echo "=== Available Backups ==="
ssh "$VPS" "ls -lht /home/deploy/backups/ | head -10"
echo ""

echo "=== Rollback Options ==="
echo ""
echo "Option A: Application Rollback (git reset — no DB change)"
echo "  1. ssh $VPS"
echo "  2. cd $APP_DIR"
echo "  3. git log --oneline -10  # find target commit"
echo "  4. git reset --hard <commit>"
echo "  5. npm run build"
echo "  6. pm2 restart xixiong-saas --update-env"
echo "  7. bash scripts/smoke-test.sh"
echo ""
echo "Option B: DNS Rollback (point jueshi.net back to old server)"
echo "  1. Go to Cloudflare dashboard"
echo "  2. Change A record for jueshi.net to old server IP"
echo "  3. Wait for DNS propagation (TTL dependent)"
echo "  4. Verify with: curl -sI https://jueshi.net/deploy-version.json"
echo ""
echo "Option C: Database Rollback (DESTRUCTIVE — loses post-backup data)"
echo "  1. ssh $VPS"
echo "  2. cd $APP_DIR && set -a && source .env.production && set +a"
echo "  3. pg_restore --clean --if-exists -d \"\$DATABASE_URL\" < /home/deploy/backups/<backup_dir>/db_dump.dump"
echo "  4. npx prisma migrate deploy"
echo "  5. pm2 restart xixiong-saas --update-env"
echo "  ⚠️  This will LOSE all data written after the backup timestamp."
echo "  ⚠️  Requires explicit human confirmation."
echo ""
echo "=== Safety Rules ==="
echo "  - Never run prisma db push"
echo "  - Never DELETE/DROP/TRUNCATE production tables"
echo "  - Never modify 9833416@qq.com"
echo "  - Always backup before rollback"
echo "  - Always run smoke-test.sh after rollback"
echo ""

read -p "Do you want to proceed with a rollback? Type the option (A/B/C) or 'cancel': " CHOICE

case "$CHOICE" in
  A|a)
    read -p "Enter target git commit hash: " COMMIT
    echo "Executing application rollback to $COMMIT..."
    ssh "$VPS" "cd $APP_DIR && git reset --hard $COMMIT && set -a && source .env.production && set +a && npx prisma generate && npm run build && pm2 restart xixiong-saas --update-env"
    echo "✅ Application rollback complete. Run smoke-test.sh to verify."
    ;;
  B|b)
    echo "DNS rollback requires manual Cloudflare dashboard action."
    echo "See instructions above."
    ;;
  C|c)
    read -p "Enter backup directory name (e.g., migration_20260623_105136): " BACKUP
    read -p "⚠️  This will LOSE all data after backup. Type 'CONFIRM' to proceed: " CONFIRM
    if [ "$CONFIRM" = "CONFIRM" ]; then
      echo "Executing database rollback from $BACKUP..."
      ssh "$VPS" "cd $APP_DIR && set -a && source .env.production && set +a && pg_restore --clean --if-exists -d \"\$DATABASE_URL\" < /home/deploy/backups/$BACKUP/db_dump.dump && npx prisma migrate deploy && pm2 restart xixiong-saas --update-env"
      echo "✅ Database rollback complete. Run smoke-test.sh to verify."
    else
      echo "Cancelled."
    fi
    ;;
  *)
    echo "Rollback cancelled."
    ;;
esac
