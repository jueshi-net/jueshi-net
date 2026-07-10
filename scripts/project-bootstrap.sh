#!/bin/bash
# PROJECT BOOTSTRAP - 项目启动引导脚本
# 任何 Goal 开始前必须执行此脚本

set -e

echo "===================================="
echo "PROJECT BOOTSTRAP"
echo "===================================="

# 读取必要文档
REQUIRED_DOCS=(
    "PROJECT_BIBLE.md"
    "PROJECT_MEMORY.md"
    "PROJECT_GOVERNANCE.md"
    "ROADMAP.md"
    "FEATURE_REGISTRY.md"
    "PAGE_REGISTRY.md"
    "COMPONENT_REGISTRY.md"
    "PROGRAM_MODEL.md"
    "PROGRAM_PROGRESS.md"
    "PROGRAM_QUEUE_SPEC.md"
)

echo "Reading required documents..."
for doc in "${REQUIRED_DOCS[@]}"; do
    if [ ! -f "$doc" ]; then
        echo "❌ Missing required document: $doc"
        echo "Bootstrap: FAILED"
        exit 1
    fi
done
echo "✅ All required documents loaded"

# 获取 Git 信息
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
HEAD=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# 读取 Program 信息
if [ -f "PROGRAM_MODEL.md" ]; then
    PROGRAM=$(grep "^# Program:" PROGRAM_MODEL.md | head -1 | sed 's/^# Program: //' || echo "unknown")
else
    PROGRAM="unknown"
fi

# 读取当前 Batch
if [ -f "PROGRAM_PROGRESS.md" ]; then
    BATCH=$(grep "^## Current Batch:" PROGRAM_PROGRESS.md | head -1 | sed 's/^## Current Batch: //' || echo "unknown")
else
    BATCH="unknown"
fi

# 读取当前 Task
if [ -f "PROGRAM_QUEUE_SPEC.md" ]; then
    TASK=$(grep "^## Current Task:" PROGRAM_QUEUE_SPEC.md | head -1 | sed 's/^## Current Task: //' || echo "unknown")
else
    TASK="unknown"
fi

# 输出 Bootstrap 信息
echo ""
echo "Branch: $BRANCH"
echo "HEAD: $HEAD"
echo "Program: $PROGRAM"
echo "Current Batch: $BATCH"
echo "Current Task: $TASK"
echo "Staging: deploy@192.129.155.149"
echo "PM2: xixiong-staging"
echo "Directory: /home/deploy/xixiong-saas-staging"
echo "Production: PROTECTED"
echo "9833416@qq.com: PROTECTED"
echo ""
echo "Bootstrap: OK"
echo "===================================="

exit 0
