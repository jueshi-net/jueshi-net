#!/bin/bash
# Checkpoint System - 实时检查点记录
# 每个 Task 完成后立即调用

set -e

CHECKPOINT_FILE="docs/CHECKPOINT.md"
TASK_NAME="${1:-unknown}"
STATUS="${2:-in_progress}"

# 确保 docs 目录存在
mkdir -p docs

# 获取当前时间
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
HEAD=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# 检查文件是否存在，不存在则创建
if [ ! -f "$CHECKPOINT_FILE" ]; then
    cat > "$CHECKPOINT_FILE" << 'EOF'
# Checkpoint Log

实时记录每个 Task 的完成状态。

## Format

| Timestamp | Task | Status | Branch | HEAD | Notes |
|-----------|------|--------|--------|------|-------|
EOF
fi

# 添加新的 checkpoint 记录
echo "| $TIMESTAMP | $TASK_NAME | $STATUS | $BRANCH | $HEAD | - |" >> "$CHECKPOINT_FILE"

echo "✅ Checkpoint recorded: $TASK_NAME ($STATUS)"
echo "   File: $CHECKPOINT_FILE"

exit 0
