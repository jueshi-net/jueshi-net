#!/bin/bash
# ============================================================================
# ContentOps Telegram Bot Token 安全录入脚本
# ============================================================================
# 用途：将 @fabuxia_bot Token 安全写入 macOS Keychain
# 安全特性：
#   - 使用 read -s 隐藏输入
#   - 不回显 Token
#   - 不启用 set -x
#   - 写入成功后立即 unset 临时变量
#   - 脚本本身不包含任何秘密
# ============================================================================

set -e

SERVICE="jueshi-contentops-telegram"
ACCOUNT="fabuxia_bot"

echo "=========================================="
echo "ContentOps Telegram Bot Token 安全录入"
echo "=========================================="
echo ""
echo "目标 Bot: @fabuxia_bot"
echo "Keychain Service: $SERVICE"
echo "Keychain Account: $ACCOUNT"
echo ""
echo "请确保您拥有 @fabuxia_bot 的完整 Token"
echo "Token 格式: 数字:字母数字混合字符串"
echo ""
echo "=========================================="
echo ""

# 隐藏输入 Token
read -s -p "请输入 @fabuxia_bot 完整 Token: " TOKEN
echo ""

# 验证输入不为空
if [ -z "$TOKEN" ]; then
    echo "错误: Token 不能为空"
    exit 1
fi

# 验证 Token 格式（基本检查）
if ! echo "$TOKEN" | grep -qE '^[0-9]+:[A-Za-z0-9_-]+$'; then
    echo "警告: Token 格式可能不正确"
    echo "预期格式: 数字:字母数字混合字符串"
    read -p "是否继续? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        unset TOKEN
        echo "已取消"
        exit 0
    fi
fi

echo ""
echo "正在写入 Keychain..."

# 写入 Keychain
security add-generic-password \
    -U \
    -s "$SERVICE" \
    -a "$ACCOUNT" \
    -w "$TOKEN"

# 立即清理临时变量
unset TOKEN

echo "✓ Token 已安全写入 Keychain"
echo ""

# 验证写入成功
if security find-generic-password -s "$SERVICE" -a "$ACCOUNT" -w >/dev/null 2>&1; then
    echo "✓ 验证成功: Token 已存储在 Keychain"
    echo ""
    echo "=========================================="
    echo "下一步:"
    echo "=========================================="
    echo "1. 重启 ContentOps Bot:"
    echo "   cd /Users/chq/xixiong-saas"
    echo "   npx tsx scripts/contentops/contentops-telegram-bot.ts"
    echo ""
    echo "2. Bot 将从 Keychain 读取 Token"
    echo "3. 确认 Bot 身份为 @fabuxia_bot"
    echo "=========================================="
else
    echo "✗ 验证失败: 无法从 Keychain 读取 Token"
    exit 1
fi
