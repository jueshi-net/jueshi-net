#!/bin/bash
# v1.20.42.7.12.3 - 生产源码级漂移只读审查脚本
# 只读操作，不修改任何文件

set -e

echo "=== v1.20.42.7.12.3 生产源码级漂移只读审查 ==="
echo "执行时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

cd /home/deploy/xixiong-saas

echo "=== 1. 当前版本关系 ==="
echo "HEAD: $(git rev-parse HEAD)"
echo "origin/main: $(git rev-parse origin/main 2>/dev/null || echo 'N/A')"
echo "当前分支: $(git branch --show-current)"
echo ""
echo "最近 10 个 commit:"
git log -10 --oneline
echo ""
echo "总未提交文件数: $(git status --porcelain | wc -l)"
echo ""

echo "=== 2. 源码级变更文件清单 ==="
echo "变更的源码文件:"
git diff --name-only -- prisma/ package.json package-lock.json pnpm-lock.yaml src/ app/ components/ lib/ middleware.ts middleware.tsx next.config.* tsconfig.json 2>/dev/null | sort
echo ""
echo "变更文件数量: $(git diff --name-only -- prisma/ package.json package-lock.json pnpm-lock.yaml src/ app/ components/ lib/ middleware.ts middleware.tsx next.config.* tsconfig.json 2>/dev/null | wc -l)"
echo ""

echo "=== 3. prisma/schema.prisma diff 摘要 ==="
echo "diff stat:"
git diff --stat -- prisma/schema.prisma
echo ""
echo "变更的模型/字段/index（只输出关键信息，不输出完整 diff）:"
git diff prisma/schema.prisma | grep -E '^\+|^\-' | grep -v '^\+\+\+\|^\-\-\-' | head -50
echo ""

echo "=== 4. prisma/migrations 变更 ==="
echo "migrations 目录变更:"
git diff --name-only -- prisma/migrations/
echo ""
echo "新增的 migration 目录:"
git ls-files --others --exclude-standard -- prisma/migrations/
echo ""

echo "=== 5. package.json diff 摘要 ==="
echo "diff stat:"
git diff --stat -- package.json
echo ""
echo "变更内容（dependencies/devDependencies/scripts）:"
git diff package.json | grep -E '^\+|^\-' | grep -v '^\+\+\+\|^\-\-\-' | head -30
echo ""

echo "=== 6. lockfile 变更 ==="
echo "package-lock.json 变更:"
git diff --stat -- package-lock.json 2>/dev/null || echo "无变更或不存在"
echo ""
echo "pnpm-lock.yaml 变更:"
git diff --stat -- pnpm-lock.yaml 2>/dev/null || echo "无变更或不存在"
echo ""

echo "=== 7. 高风险文件清单 ==="
echo "API/Auth 相关文件:"
git diff --name-only | grep -E '(api/|auth/|middleware|password|reset|login|session)' | head -20
echo ""
echo "Workspace/后台相关文件:"
git diff --name-only | grep -E '(admin/|workspace/|dashboard)' | head -20
echo ""
echo "配置文件:"
git diff --name-only | grep -E '(next\.config|tsconfig|\.env)' | head -10
echo ""

echo "=== 8. 源码变更按目录统计 ==="
echo "src/app/(public) 变更数量: $(git diff --name-only | grep 'src/app/(public)' | wc -l)"
echo "src/app/(admin) 变更数量: $(git diff --name-only | grep 'src/app/(admin)' | wc -l)"
echo "src/app/api 变更数量: $(git diff --name-only | grep 'src/app/api' | wc -l)"
echo "src/lib 变更数量: $(git diff --name-only | grep 'src/lib' | wc -l)"
echo "src/components 变更数量: $(git diff --name-only | grep 'src/components' | wc -l)"
echo "prisma 变更数量: $(git diff --name-only | grep 'prisma' | wc -l)"
echo ""

echo "=== 9. Prisma migration 状态（只读） ==="
echo "检查 migration 目录:"
ls -la prisma/migrations/ 2>/dev/null | tail -10
echo ""
echo "检查 PasswordResetToken migration:"
ls -la prisma/migrations/ 2>/dev/null | grep -i password || echo "未找到 password 相关 migration"
echo ""

echo "=== 10. 当前包管理器 ==="
if [ -f pnpm-lock.yaml ]; then
    echo "包管理器: pnpm"
elif [ -f package-lock.json ]; then
    echo "包管理器: npm"
elif [ -f yarn.lock ]; then
    echo "包管理器: yarn"
else
    echo "包管理器: 未知"
fi
echo ""

echo "=== 11. node_modules 状态 ==="
if [ -d node_modules ]; then
    echo "node_modules 存在"
    echo "node_modules 最后修改时间: $(stat -c '%y' node_modules 2>/dev/null || echo 'N/A')"
else
    echo "node_modules 不存在"
fi
echo ""

echo "=== 12. 构建状态 ==="
if [ -f .next/BUILD_ID ]; then
    echo "当前 buildId: $(cat .next/BUILD_ID)"
    echo ".next 最后修改时间: $(stat -c '%y' .next 2>/dev/null || echo 'N/A')"
else
    echo "buildId 不存在"
fi
echo ""

echo "=== 审查完成 ==="
echo "执行时间: $(date '+%Y-%m-%d %H:%M:%S')"
