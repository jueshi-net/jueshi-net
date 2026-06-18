#!/bin/bash
# v1.20.42.7.13 小范围 Beta Day 0 + Day 1 观察脚本
# 只读检查生产状态，不修改任何文件

set -e

echo "=== v1.20.42.7.13 小范围 Beta Day 0 + Day 1 观察 ==="
echo "执行时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 进入项目目录
cd /home/deploy/xixiong-saas

echo "=== 1. 核心 URL 状态 ==="
for url in https://jueshi.net/ https://jueshi.net/resources https://jueshi.net/tracking https://jueshi.net/forgot-password https://jueshi.net/login https://jueshi.net/feedback; do
    code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    echo "  $url → $code"
done
echo ""

echo "=== 2. PM2 状态 ==="
pm2 list 2>/dev/null | grep xixiong-saas
echo ""
echo "PM2 详细信息:"
pm2 show xixiong-saas 2>/dev/null | grep -E "status|restarts|uptime|memory"
echo ""

echo "=== 3. PM2 最近日志（最后 20 行） ==="
pm2 logs xixiong-saas --nostream --lines 20 2>/dev/null | tail -20
echo ""

echo "=== 4. Nginx 错误统计 ==="
echo "最近 1 小时 5xx 错误数:"
sudo tail -n 10000 /var/log/nginx/error.log 2>/dev/null | grep -E "5[0-9]{2}" | awk -v d="$(date -d '1 hour ago' '+%Y/%m/%d %H')" '$0 ~ d' | wc -l || echo "0"
echo ""
echo "最近 24 小时 5xx 错误数:"
sudo tail -n 10000 /var/log/nginx/error.log 2>/dev/null | grep -E "5[0-9]{2}" | awk -v d="$(date -d '24 hours ago' '+%Y/%m/%d')" '$0 ~ d' | wc -l || echo "0"
echo ""
echo "最近 10 条 Nginx 错误:"
sudo tail -n 10 /var/log/nginx/error.log 2>/dev/null || echo "无错误"
echo ""

echo "=== 5. 磁盘使用率 ==="
df -h / | tail -1
echo ""

echo "=== 6. 最新备份 ==="
ls -lh /home/deploy/backups/*.dump 2>/dev/null | tail -5 || echo "无备份"
echo ""

echo "=== 7. 数据库连接测试 ==="
source .env.production 2>/dev/null
if [ -n "$DATABASE_URL" ]; then
    echo "数据库连接测试:"
    psql "$DATABASE_URL" -c "SELECT 1;" 2>/dev/null && echo "✅ 数据库连接正常" || echo "❌ 数据库连接失败"
else
    echo "⚠️ DATABASE_URL 未设置"
fi
echo ""

echo "=== 8. 关键表记录数 ==="
if [ -n "$DATABASE_URL" ]; then
    echo "用户数:"
    psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "N/A"
    echo ""
    echo "今日注册用户:"
    psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE;" 2>/dev/null || echo "N/A"
    echo ""
    echo "密码重置 token 数:"
    psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM password_reset_tokens;" 2>/dev/null || echo "N/A"
    echo ""
    echo "今日密码重置数:"
    psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM password_reset_tokens WHERE created_at >= CURRENT_DATE;" 2>/dev/null || echo "N/A"
    echo ""
    echo "论坛帖子数:"
    psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM forum_posts;" 2>/dev/null || echo "N/A"
    echo ""
    echo "论坛评论数:"
    psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM forum_comments;" 2>/dev/null || echo "N/A"
fi
echo ""

echo "=== 9. VPS Git 状态 ==="
echo "HEAD: $(git rev-parse HEAD)"
echo "未提交文件: $(git status --porcelain | wc -l)"
echo ""

echo "=== 10. deploy meta ==="
cat .deploy-meta.json 2>/dev/null || echo "N/A"
echo ""

echo "=== 11. 系统负载 ==="
uptime
echo ""

echo "=== 12. 内存使用 ==="
free -h
echo ""

echo "=== 观察完成 ==="
echo "执行时间: $(date '+%Y-%m-%d %H:%M:%S')"
