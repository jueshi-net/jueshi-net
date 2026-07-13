#!/bin/bash
# Checkpoint System - 实时记录任务完成状态

set -e

TYPE=${1:-"task"}
ID=${2:-"unknown"}
STATUS=${3:-"completed"}

CHECKPOINT_DIR="docs/checkpoints"
TIMESTAMP=$(date +"%Y-%m-%d-%H-%M-%S")
CHECKPOINT_FILE="${CHECKPOINT_DIR}/${TIMESTAMP}-${TYPE}-${ID}.md"

# 创建目录
mkdir -p "$CHECKPOINT_DIR"

# 获取 Git 信息
COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "no-commit")
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "no-branch")

# 获取修改的文件
MODIFIED_FILES=$(git diff --name-only HEAD~1 2>/dev/null || echo "no-changes")

# 创建 Checkpoint
cat > "$CHECKPOINT_FILE" << EOF
# Checkpoint: ${ID}

## Metadata
- **Type**: ${TYPE}
- **ID**: ${ID}
- **Status**: ${STATUS}
- **Timestamp**: ${TIMESTAMP}
- **Branch**: ${BRANCH}
- **Commit**: ${COMMIT_HASH}

## Modified Files
\`\`\`
${MODIFIED_FILES}
\`\`\`

## Notes
Checkpoint created automatically by checkpoint system.
EOF

# 更新 latest.md
cp "$CHECKPOINT_FILE" "${CHECKPOINT_DIR}/latest.md"

echo "✅ Checkpoint created: ${CHECKPOINT_FILE}"
echo "📝 Latest checkpoint: ${CHECKPOINT_DIR}/latest.md"
