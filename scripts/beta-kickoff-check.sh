#!/bin/bash
# Beta 启动前综合检查脚本
# 一次性采集所有状态，避免重复调用

echo "=== Beta 启动前综合检查 ==="
echo "时间: $(date)"
echo ""

echo "=== 1. 核心页面状态 ==="
for url in "https://jueshi.net/" "https://jueshi.net/resources" "https://jueshi.net/tracking" "https://jueshi.net/forgot-password" "https://jueshi.net/login"; do
    code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    echo "$url: $code"
done
echo ""

echo "=== 2. 系统状态 ==="
echo "PM2 状态:"
pm2 status | grep xixiong-saas
echo ""

echo "Nginx 状态:"
sudo nginx -t 2>&1 | head -3
echo ""

echo "磁盘使用率:"
df -h / | tail -1
echo ""

echo "=== 3. 备份状态 ==="
echo "最新备份:"
ls -lh /home/deploy/backups/daily_*.dump 2>/dev/null | tail -1
echo ""

echo "备份 cron:"
crontab -l 2>/dev/null | grep backup
echo ""

echo "=== 4. 监控状态 ==="
echo "Telegram 告警配置:"
grep -c "TELEGRAM_BOT_TOKEN\|TELEGRAM_CHAT_ID" /home/deploy/xixiong-saas/.env.production 2>/dev/null || echo "0"
echo ""

echo "Health-check 脚本:"
ls -la /home/deploy/xixiong-saas/scripts/health-check.sh 2>/dev/null | awk '{print $1, $9}'
echo ""

echo "=== 5. Git 状态 ==="
cd /home/deploy/xixiong-saas
echo "当前 HEAD: $(git rev-parse HEAD 2>/dev/null || echo 'N/A')"
echo "当前分支: $(git branch --show-current 2>/dev/null || echo 'N/A')"
echo "Git status: $(git status --short 2>/dev/null | wc -l) 个文件"
echo ""

echo "=== 6. 环境配置 ==="
echo "NEXT_PUBLIC_APP_URL:"
grep "NEXT_PUBLIC_APP_URL" /home/deploy/xixiong-saas/.env.production 2>/dev/null || echo "未配置"
echo ""

echo ".env.production 权限:"
ls -la /home/deploy/xixiong-saas/.env.production 2>/dev/null | awk '{print $1}'
echo ""

echo "=== 7. Nginx 5xx 检查 ==="
echo "最近 1 小时 5xx 错误数:"
sudo grep -c " 5[0-9][0-9] " /var/log/nginx/access.log 2>/dev/null || echo "0"
echo ""

echo "=== 检查完成 ==="
