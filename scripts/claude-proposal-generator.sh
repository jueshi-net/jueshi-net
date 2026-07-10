#!/bin/bash
# Claude Code Proposal 生成脚本
# 目标：生成修复 ToolFilterBar sticky 重叠问题的完整文件提案

set -e

PROPOSAL_DIR=".hermes/pipeline/proposals/tools-mobile-v2-remediation"
mkdir -p "$PROPOSAL_DIR"

echo "=== Claude Code Proposal Generation ==="
echo "Task: Fix ToolFilterBar sticky overlap with Header"
echo ""

claude "你是绝世百宝箱项目的前端架构师。基于审计报告，请生成修复提案。

问题确认：
1. Header 高度 76px，sticky top-0，z-index 50
2. ToolFilterBar sticky top-[57px]，z-index 30
3. ToolFilterBar 的 top 值小于 Header 高度，导致重叠

修复目标：
- ToolFilterBar 在移动端（< 768px）不使用 sticky，改为 static
- ToolFilterBar 在桌面端（>= 768px）使用 sticky，top 值设为 Header 高度 + 间距
- 确保 ToolFilterBar 不会与 Header 重叠

必须读取的文件：
1. src/components/tools/tool-filter-bar.tsx（当前实现）
2. src/components/layout/JueshiV4PublicShell.tsx（了解 Header 结构）
3. src/app/(public)/tools/page.tsx（了解页面结构）

输出要求：
使用完整文件格式输出修复后的 tool-filter-bar.tsx：

<<<FILE:src/components/tools/tool-filter-bar.tsx>>>
[完整的修复后文件内容]
<<<END_FILE>>>

修复要点：
- 移动端：移除 sticky，使用 static 定位
- 桌面端：sticky top-[76px] 或 top-[80px]（Header 高度 + 4px 间距）
- 保持其他功能不变（搜索、分类筛选、排序）
- 保持响应式断点 md: 的使用

必须声明：
CLAUDE_GENERATED_PROPOSAL"
