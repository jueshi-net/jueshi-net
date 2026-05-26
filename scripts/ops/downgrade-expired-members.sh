#!/bin/bash
# scripts/ops/downgrade-expired-members.sh
# Check for expired member trial users and downgrade them back to "user".
# Run via cron: 0 */6 * * *
# Usage: bash scripts/ops/downgrade-expired-members.sh

set -e

DB_HOST="127.0.0.1"
DB_USER="bxb_user"
DB_NAME="bxb_prod"
export PGPASSWORD="Bxb2024!Prod@Secure"
PSQL="psql -h $DB_HOST -U $DB_USER -d $DB_NAME"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Checking for expired member trials..."

# Find expired members
EXPIRED=$($PSQL -t -A -c "
  SELECT id || '|' || email || '|' || \"memberUntil\"
  FROM users
  WHERE role = 'member'
    AND \"memberUntil\" IS NOT NULL
    AND \"memberUntil\" <= NOW();
" 2>/dev/null)

if [ -z "$EXPIRED" ]; then
  log "No expired member trials found."
  exit 0
fi

COUNT=$(echo "$EXPIRED" | wc -l)
log "Found $COUNT expired member(s):"
echo "$EXPIRED" | while IFS='|' read -r id email expiry; do
  log "  - $email (expired: $expiry)"
done

# Get all expired IDs (quoted for SQL IN clause)
EXPIRED_IDS=$(echo "$EXPIRED" | cut -d'|' -f1 | sed "s/^/'/;s/$/'/" | tr '\n' ',' | sed 's/,$//')

# Downgrade
$PSQL -c "
  UPDATE users
  SET role = 'user', \"memberUntil\" = NULL
  WHERE id IN ($EXPIRED_IDS);
" 2>/dev/null

RESULT=$($PSQL -t -A -c "SELECT COUNT(*) FROM users WHERE role = 'member' AND \"memberUntil\" IS NULL;")
log "Downgraded members to user (checking: $RESULT should be 0)"
log "Done."
