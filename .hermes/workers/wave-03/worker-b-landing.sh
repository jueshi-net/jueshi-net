#!/bin/bash
cd /Users/chq/xixiong-saas-wave-03-b-landing

# Selected routes for this worker
export ROUTE="/tools/video-script-sop"
export FILE="src/app/(public)/tools/video-script-sop/page.tsx"
export FAMILY="PUBLIC_LANDING_TOOL"
export RISK="LOW"
export REFERENCE_PAGE="/tools/hs-code"

echo "Starting Worker B - Public Landing Tool Migration"
echo "Route: $ROUTE"
echo "File: $FILE"
echo "Family: $FAMILY"
echo "Risk: $RISK"
echo "Reference: $REFERENCE_PAGE"

# Wait for migration signal
while true; do
  if [ -f "/Users/chq/xixiong-saas-wave-03-b-landing/.migration_signal" ]; then
    echo "Migration signal received for Worker B"
    break
  fi
  sleep 5
done

echo "Worker B completed"
