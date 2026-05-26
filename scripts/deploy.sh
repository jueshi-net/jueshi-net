#!/bin/bash
# scripts/deploy.sh — Safe deployment script for JueShi.net
# Protects all .env* files from being overwritten by rsync
set -e

echo "🚀 Starting deployment to production..."
echo ""

# Rsync with strict exclude list — NEVER overwrite .env files
rsync -avz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='.env.production' \
  --exclude='.env.development' \
  --exclude='.env.example' \
  --exclude='prisma/dev.db' \
  ./ deploy@jueshi.net:/home/deploy/xixiong-saas

echo ""
echo "📦 Synced. Building and restarting on VPS..."
echo ""

ssh deploy@jueshi.net << 'EOF'
  cd /home/deploy/xixiong-saas

  echo "─── Installing dependencies ───"
  npm install --production=false

  echo "─── Rebuilding Next.js ───"
  rm -rf .next
  npm run build

  echo "─── Restarting PM2 with fresh env ───"
  NODE_ENV=production pm2 restart xixiong-saas --update-env

  echo "─── Ensuring Miner Daemon is registered (not auto-started) ───"
  # Miner is NOT auto-started on deploy — it must be manually activated by admin
  # To start: NODE_ENV=production pm2 start jueshi-miner
  # To check: pm2 list | grep miner
  pm2 list

  echo ""
  echo "✅ Deployment successful and PM2 reloaded!"
  echo "💡 数字矿机 (jueshi-miner) 未自动启动。如需 24/7 运行，请执行:"
  echo "   ssh deploy@jueshi.net 'cd /home/deploy/xixiong-saas && NODE_ENV=production pm2 start ecosystem.config.js --only jueshi-miner'"
EOF
