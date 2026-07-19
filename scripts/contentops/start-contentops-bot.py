#!/usr/bin/env python3
"""ContentOps Bot Startup Script with Whitelist - Fail-closed"""

import subprocess
import os
import sys

# Read secrets from Keychain
try:
    bridge_result = subprocess.run(
        ['security', 'find-generic-password', '-s', 'jueshi-contentops-bridge', '-a', 'staging', '-w'],
        capture_output=True, text=True, check=True
    )
    bridge_secret = bridge_result.stdout.strip()
except subprocess.CalledProcessError:
    print("ERROR: Could not read bridge secret from Keychain")
    sys.exit(1)

try:
    token_result = subprocess.run(
        ['security', 'find-generic-password', '-s', 'jueshi-contentops-telegram', '-a', 'fabuxia_bot', '-w'],
        capture_output=True, text=True, check=True
    )
    bot_token = token_result.stdout.strip()
except subprocess.CalledProcessError:
    print("ERROR: Could not read bot token from Keychain")
    sys.exit(1)

# Whitelist: only authorized Chat IDs (fail-closed)
# User's Telegram Chat ID from Hermes memory
ALLOWED_CHAT_IDS = "8602323654"

# Set environment variables
os.environ['CONTENTOPS_TELEGRAM_ALLOWED_CHAT_IDS'] = ALLOWED_CHAT_IDS
os.environ['CONTENTOPS_BRIDGE_SECRET'] = bridge_secret
os.environ['CONTENTOPS_BOT_TOKEN'] = bot_token
os.environ['CONTENTOPS_BRIDGE_URL'] = 'https://i.jueshi.net/api/internal/contentops/drafts'
os.environ['LOCAL_HERMES_ENABLED'] = 'true'
os.environ['LOCAL_HERMES_PATH'] = '/Users/chq/.hermes/hermes-agent/venv/bin/hermes'

print(f"ContentOps Bot starting with whitelist: {ALLOWED_CHAT_IDS}")
print(f"Bridge URL: {os.environ['CONTENTOPS_BRIDGE_URL']}")
print(f"Hermes enabled: {os.environ['LOCAL_HERMES_ENABLED']}")

# Change to project directory
os.chdir('/Users/chq/xixiong-saas')

# Run the bot
result = subprocess.run(
    ['npx', 'tsx', 'scripts/contentops/contentops-telegram-bot.ts'],
    capture_output=False
)

sys.exit(result.returncode)
