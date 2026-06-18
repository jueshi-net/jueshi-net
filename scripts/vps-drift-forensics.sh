#!/bin/bash
# VPS Git 漂移取证脚本
# 一次性收集所有需要的信息，避免多次 SSH 调用

set -e

echo "=== VPS Git 漂移取证报告 ==="
echo "执行时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 进入项目目录
cd /home/deploy/xixiong-saas

echo "=== 1. 基本信息 ==="
echo "当前路径: $(pwd)"
echo "Git HEAD: $(git rev-parse HEAD 2>/dev/null || echo 'N/A')"
echo "Git origin/main: $(git rev-parse origin/main 2>/dev/null || echo 'N/A')"
echo "当前分支: $(git branch --show-current 2>/dev/null || echo 'N/A')"
echo ""

echo "=== 2. Git 状态统计 ==="
echo "总未提交文件数: $(git status --porcelain 2>/dev/null | wc -l)"
echo "未跟踪文件数: $(git ls-files --others --exclude-standard 2>/dev/null | wc -l)"
echo "修改文件数: $(git diff --name-only 2>/dev/null | wc -l)"
echo ""

echo "=== 3. 最近 10 个 commit ==="
git log -10 --oneline 2>/dev/null || echo "N/A"
echo ""

echo "=== 4. 未提交文件分类 ==="
echo ""
echo "--- 4.1 源码级文件 (app/src/components/lib/prisma/middleware/package/next.config/package.json 等) ---"
git status --porcelain 2>/dev/null | grep -E '^\s*M\s+(app/|src/|components/|lib/|prisma/|middleware|next\.config|package\.json|package-lock\.json|pnpm-lock\.yaml|tsconfig\.json)' | wc -l
echo "文件列表:"
git status --porcelain 2>/dev/null | grep -E '^\s*M\s+(app/|src/|components/|lib/|prisma/|middleware|next\.config|package\.json|package-lock\.json|pnpm-lock\.yaml|tsconfig\.json)' | head -50
echo ""

echo "--- 4.2 脚本级文件 (scripts/) ---"
git status --porcelain 2>/dev/null | grep -E '^\s*M\s+scripts/' | wc -l
echo "文件列表:"
git status --porcelain 2>/dev/null | grep -E '^\s*M\s+scripts/' | head -20
echo ""

echo "--- 4.3 报告级文件 (reports/) ---"
git status --porcelain 2>/dev/null | grep -E '^\s*M\s+reports/' | wc -l
echo "文件列表:"
git status --porcelain 2>/dev/null | grep -E '^\s*M\s+reports/' | head -20
echo ""

echo "--- 4.4 构建产物 (.next/ node_modules/ dist/) ---"
git ls-files --others --exclude-standard 2>/dev/null | grep -E '^(\.next/|node_modules/|dist/)' | wc -l
echo "文件列表 (前 20):"
git ls-files --others --exclude-standard 2>/dev/null | grep -E '^(\.next/|node_modules/|dist/)' | head -20
echo ""

echo "--- 4.5 日志级文件 (logs/) ---"
git ls-files --others --exclude-standard 2>/dev/null | grep -E '^logs/' | wc -l
echo "文件列表 (前 20):"
git ls-files --others --exclude-standard 2>/dev/null | grep -E '^logs/' | head -20
echo ""

echo "--- 4.6 临时文件 (tmp/ *.tmp *.bak) ---"
git ls-files --others --exclude-standard 2>/dev/null | grep -E '^(tmp/|.*\.tmp$|.*\.bak$)' | wc -l
echo "文件列表 (前 20):"
git ls-files --others --exclude-standard 2>/dev/null | grep -E '^(tmp/|.*\.tmp$|.*\.bak$)' | head -20
echo ""

echo "--- 4.7 生产资产 (public/uploads storage) ---"
git ls-files --others --exclude-standard 2>/dev/null | grep -E '^(public/uploads|storage)' | wc -l
echo "文件列表 (前 20):"
git ls-files --others --exclude-standard 2>/dev/null | grep -E '^(public/uploads|storage)' | head -20
echo ""

echo "--- 4.8 其他未跟踪文件 ---"
git ls-files --others --exclude-standard 2>/dev/null | grep -vE '^(\.next/|node_modules/|dist/|logs/|tmp/|.*\.tmp$|.*\.bak$|public/uploads|storage)' | wc -l
echo "文件列表 (前 50):"
git ls-files --others --exclude-standard 2>/dev/null | grep -vE '^(\.next/|node_modules/|dist/|logs/|tmp/|.*\.tmp$|.*\.bak$|public/uploads|storage)' | head -50
echo ""

echo "=== 5. 源码级差异详情 ==="
echo "--- 5.1 修改的源码文件 diff stat ---"
git diff --stat 2>/dev/null | grep -E '(app/|src/|components/|lib/|prisma/|middleware|next\.config|package\.json|package-lock\.json|pnpm-lock\.yaml|tsconfig\.json)' | head -30
echo ""

echo "=== 6. deploy meta ==="
if [ -f .deploy-meta.json ]; then
    echo "deploy meta 内容:"
    cat .deploy-meta.json
else
    echo "deploy meta 文件不存在"
fi
echo ""

echo "=== 7. buildId ==="
if [ -f .next/BUILD_ID ]; then
    echo "当前 buildId: $(cat .next/BUILD_ID)"
else
    echo "buildId 文件不存在"
fi
echo ""

echo "=== 8. PM2 状态 ==="
pm2 list 2>/dev/null || echo "PM2 未运行"
echo ""
echo "PM2 详细信息:"
pm2 show xixiong-saas 2>/dev/null || echo "N/A"
echo ""
echo "PM2 重启次数:"
pm2 show xixiong-saas 2>/dev/null | grep -E 'restarts|unstable restarts' || echo "N/A"
echo ""

echo "=== 9. PM2 最近日志 ==="
echo "最近 100 行 PM2 日志:"
pm2 logs xixiong-saas --nostream --lines 100 2>/dev/null | tail -100 || echo "N/A"
echo ""

echo "=== 10. Nginx 错误统计 ==="
echo "最近 1 小时 5xx 错误数:"
sudo tail -n 10000 /var/log/nginx/error.log 2>/dev/null | grep -E '5[0-9]{2}' | awk -v d="$(date -d '1 hour ago' '+%Y/%m/%d %H')" '$0 ~ d' | wc -l || echo "0"
echo ""
echo "最近 24 小时 5xx 错误数:"
sudo tail -n 10000 /var/log/nginx/error.log 2>/dev/null | grep -E '5[0-9]{2}' | awk -v d="$(date -d '24 hours ago' '+%Y/%m/%d')" '$0 ~ d' | wc -l || echo "0"
echo ""
echo "最近 10 条 Nginx 错误:"
sudo tail -n 10 /var/log/nginx/error.log 2>/dev/null || echo "N/A"
echo ""

echo "=== 11. 磁盘使用率 ==="
df -h / | tail -1
echo ""

echo "=== 12. 最新备份 ==="
ls -lh /home/deploy/backups/*.dump 2>/dev/null | tail -5 || echo "无备份"
echo ""

echo "=== 取证完成 ==="
echo "执行时间: $(date '+%Y-%m-%d %H:%M:%S')"
