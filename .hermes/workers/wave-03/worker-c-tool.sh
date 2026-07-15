#!/bin/bash
cd /Users/chq/xixiong-saas-wave-03-c-tool

# Selected routes for this worker
export ROUTE="/blog"
export FILE="src/app/(public)/blog/page.tsx"
export FAMILY="PUBLIC_LANDING_CONTENT"
export RISK="LOW"
export REFERENCE_PAGE="/guides/hs-code-basics"

echo "Starting Worker C - Public Landing Content Migration"
echo "Route: $ROUTE"
echo "File: $FILE"
echo "Family: $FAMILY"
echo "Risk: $RISK"
echo "Reference: $REFERENCE_PAGE"

# Wait for migration signal
while true; do
  if [ -f "/Users/chq/xixiong-saas-wave-03-c-tool/.migration_signal" ]; then
    echo "Migration signal received for Worker C"
    break
  fi
  sleep 5
done

echo "Worker C completed"
