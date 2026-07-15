#!/bin/bash
cd /Users/chq/xixiong-saas-wave-03-d-admin

# Selected routes for this worker
export ROUTE="/admin"
export FILE="src/app/(admin)/admin/page.tsx"
export FAMILY="ADMIN_TABLE"
export RISK="LOW"
export REFERENCE_PAGE="/admin/users"

echo "Starting Worker D - Admin Table Migration"
echo "Route: $ROUTE"
echo "File: $FILE"
echo "Family: $FAMILY"
echo "Risk: $RISK"
echo "Reference: $REFERENCE_PAGE"

# Wait for migration signal
while true; do
  if [ -f "/Users/chq/xixiong-saas-wave-03-d-admin/.migration_signal" ]; then
    echo "Migration signal received for Worker D"
    break
  fi
  sleep 5
done

echo "Worker D completed"
