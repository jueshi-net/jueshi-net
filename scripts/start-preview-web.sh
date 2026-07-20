#!/bin/bash
# Start preview web server with correct environment
cd ~/projects/xixiong-service-provider-worktree
set -a
source .env.preview
set +a
export FEATURE_SERVICE_PROVIDER=true
export PREVIEW_MODE=true
export AUTH_SECRET=*** node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
exec npx next start -p 3058
