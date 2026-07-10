#!/bin/bash
# Report Quality Check - 报告质量检查
# 扫描所有报告文件，确保没有违禁语句

set -e

REPORT_DIR="${1:-docs}"
VIOLATIONS=0

echo "=== Report Quality Check ==="
echo "Scanning directory: $REPORT_DIR"
echo ""

# 违禁语句列表
FORBIDDEN_PHRASES=(
    "请用户检查 SSH"
    "请用户登录服务器"
    "请用户执行 systemctl"
    "需要用户手动"
    "用户需要检查"
    "让用户去"
)

# 扫描所有 markdown 文件
find "$REPORT_DIR" -name "*.md" -type f | while read -r file; do
    for phrase in "${FORBIDDEN_PHRASES[@]}"; do
        if grep -q "$phrase" "$file" 2>/dev/null; then
            echo "❌ VIOLATION in $file:"
            echo "   Found: $phrase"
            grep -n "$phrase" "$file" | head -3 | sed 's/^/   /'
            echo ""
            VIOLATIONS=$((VIOLATIONS + 1))
        fi
    done
done

if [ $VIOLATIONS -eq 0 ]; then
    echo "✅ No violations found"
    echo "Report Quality: PASS"
    exit 0
else
    echo "❌ Found $VIOLATIONS violations"
    echo "Report Quality: FAIL"
    exit 1
fi
