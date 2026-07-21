#!/bin/bash
# ContentOps Bot Startup Script
# Establishes SSH tunnel to staging Bridge before starting Bot

set -e

# Kill any existing tunnel
pkill -f "ssh.*-L 3001:127.0.0.1:3001.*deploy@192.129.155.149" 2>/dev/null || true
sleep 1

# Establish SSH tunnel to staging Bridge
ssh -f -N -L 3001:127.0.0.1:3001 deploy@192.129.155.149
sleep 2

# Verify tunnel is up
if ! nc -z localhost 3001 2>/dev/null; then
    echo "ERROR: SSH tunnel failed to establish"
    exit 1
fi

echo "SSH tunnel established to staging Bridge"

# Start Bot
cd /Users/chq/xixiong-saas
exec npm exec tsx scripts/contentops/contentops-telegram-bot.ts
