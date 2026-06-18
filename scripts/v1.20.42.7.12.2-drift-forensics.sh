#!/bin/bash
# v1.20.42.7.12.2 生产 Git 漂移取证脚本
# 一次性收集所有需要的信息

cd /home/deploy/xixiong-saas

echo "=========================================="
echo "1. 基础 Git 信息"
echo "=========================================="
echo "pwd: $(pwd)"
echo "git rev-parse HEAD: $(git rev-parse HEAD)"
echo "git rev-parse origin/main: $(git rev-parse origin/main 2>/dev/null || echo 'no origin')"
echo "git branch --show-current: $(git branch --show-current)"
echo ""

echo "=========================================="
echo "2. 最近 10 次提交"
echo "=========================================="
git log -10 --oneline
echo ""

echo "=========================================="
echo "3. Git 状态统计"
echo "=========================================="
echo "git status --porcelain | wc -l: $(git status --porcelain | wc -l)"
echo "git ls-files -others -exclude-standard | wc -l: $(git ls-files -others -exclude-standard | wc -l)"
echo ""

echo "=========================================="
echo "4. 未提交文件分类"
echo "=========================================="

# 源码级文件
echo "源码级文件:"
git status --short | grep -E '^\s*M\s+(src/|app/|components/|lib/|prisma/|middleware|next\.config|package\.json|package-lock\.json|pnpm-lock\.yaml|tsconfig\.json)' | wc -l
echo ""

# 脚本级文件
echo "脚本级文件:"
git status --short | grep -E '^\s*M\s+scripts/' | wc -l
echo ""

# 报告级文件
echo "报告级文件:"
git status --short | grep -E '^\s*M\s+reports/' | wc -l
echo ""

# 未跟踪文件分类
echo "未跟踪文件分类:"
git ls-files -others -exclude-standard | awk -F/ '{print $1}' | sort | uniq -c | sort -rn
echo ""

echo "=========================================="
echo "5. 源码级差异文件列表"
echo "=========================================="
git status --short | grep -E '^\s*M\s+(src/|app/|components/|lib/|prisma/|middleware|next\.config|package\.json|package-lock\.json|pnpm-lock\.yaml|tsconfig\.json)' | head -20
echo ""

echo "=========================================="
echo "6. 未跟踪文件前 50 个"
echo "=========================================="
git ls-files -others -exclude-standard | head -50
echo ""

echo "=========================================="
echo "7. Deploy meta 信息"
echo "=========================================="
if [ -f .deploy-meta.json ]; then
  cat .deploy-meta.json
else
  echo "No .deploy-meta.json found"
fi
echo ""

echo "=========================================="
echo "8. PM2 状态"
echo "=========================================="
pm2 status | grep xixiong-saas
echo ""

echo "=========================================="
echo "9. PM2 详细信息"
echo "=========================================="
pm2 describe xixiong-saas | grep -E 'cwd|script|exec cwd|interpreter|node_args|restart_time|unstable restarts|uptime|created|watch|status'
echo ""

echo "=========================================="
echo "10. PM2 最近日志（最后 50 行）"
echo "=========================================="
pm2 logs xixiong-saas --nostream --lines 50 2>&1 | grep -E 'error|Error|ERROR|crash|Crash|CRASH|restart|Restart|RESTART|SIGINT|SIGTERM|exit' | tail -20
echo ""

echo "=========================================="
echo "11. Nginx 5xx 统计"
echo "=========================================="
echo "最近 1 小时 5xx 数量:"
sudo tail -n 10000 /var/log/nginx/access.log | awk -v d="$(date -d '1 hour ago' '+%d/%b/%Y:%H')" '$4 ~ d && $9 ~ /^5[0-9][0-9]$/ {count++} END {print count+0}'
echo ""

echo "最近 24 小时 5xx 数量:"
sudo tail -n 100000 /var/log/nginx/access.log | awk -v d="$(date -d '24 hours ago' '+%d/%b/%Y')" '$4 ~ d && $9 ~ /^5[0-9][0-9]$/ {count++} END {print count+0}'
echo ""

echo "最近 10 条 5xx 错误:"
sudo tail -n 10000 /var/log/nginx/access.log | awk '$9 ~ /^5[0-9][0-9]$/ {print $4, $9, $7}' | tail -10
echo ""

echo "=========================================="
echo "12. 磁盘状态"
echo "=========================================="
df -h / | tail -1
echo ""

echo "=========================================="
echo "13. 备份状态"
echo "=========================================="
ls -lh /home/deploy/backups/daily_*.dump 2>/dev/null | tail -3
echo ""

echo "=========================================="
echo "14. 核心 URL 状态"
echo "=========================================="
for url in "https://jueshi.net/" "https://jueshi.net/resources" "https://jueshi.net/tracking" "https://jueshi.net/forgot-password" "https://jueshi.net/login" "https://jueshi.net/feedback"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  echo "$url: $code"
done
echo ""

echo "=========================================="
echo "15. UptimeRobot 状态（不重复测试）"
echo "=========================================="
echo "已在 v1.20.42.7.12.1 确认：4 个 monitor，全部 Up，100% uptime"
echo ""

echo "=========================================="
echo "16. Telegram health-check 状态（不重复测试）"
echo "=========================================="
echo "已在 v1.20.42.7.12.1 确认：3 个变量，脚本存在，可执行"
echo ""

echo "=========================================="
echo "取证完成"
echo "=========================================="
