#!/bin/bash
# PROJECT MEMORY LOCK - 项目记忆锁检查脚本
# Goal 开始后必须执行，读取 PROJECT_MEMORY.md 失败则停止

set -e

MEMORY_FILE="PROJECT_MEMORY.md"

echo "=== Memory Lock Check ==="

if [ ! -f "$MEMORY_FILE" ]; then
    echo "❌ PROJECT_MEMORY.md not found"
    echo "PROJECT_MEMORY_NOT_LOADED"
    exit 1
fi

# 检查文件是否可读
if [ ! -r "$MEMORY_FILE" ]; then
    echo "❌ PROJECT_MEMORY.md is not readable"
    echo "PROJECT_MEMORY_NOT_LOADED"
    exit 1
fi

# 检查文件是否为空
if [ ! -s "$MEMORY_FILE" ]; then
    echo "❌ PROJECT_MEMORY.md is empty"
    echo "PROJECT_MEMORY_NOT_LOADED"
    exit 1
fi

# 读取关键信息
echo "✅ PROJECT_MEMORY.md loaded successfully"
echo ""

# 提取关键配置
echo "Key configurations:"
grep -E "^(staging|production|branch|deploy):" "$MEMORY_FILE" | head -10 || echo "No key configs found"

echo ""
echo "Memory Lock: OK"
exit 0
