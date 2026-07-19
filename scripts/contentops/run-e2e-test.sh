#!/bin/bash
# ContentOps E2E Test Runner with Keychain secrets

SECRET=*** find-generic-password -s 'jueshi-contentops-bridge' -a 'staging' -w 2>/dev/null`)
if [ -z "$SECRET" ]; then
  echo "ERROR: Could not read bridge secret from Keychain"
  exit 1
fi

export CONTENTOPS_BRIDGE_SECRET=*** CONTENTOPS_BRIDGE_URL="https://i.jueshi.net"
export LOCAL_HERMES_ENABLED="true"
export LOCAL_HERMES_PATH="/Users/chq/.nvm/versions/node/v22.17.0/bin/hermes"

cd /Users/chq/xixiong-saas
npx tsx scripts/contentops/test-telegram-e2e-standalone.ts
