#!/bin/bash
# Claude Code 仓库审计脚本
# 目标：让 Claude 读取真实仓库文件，输出审计报告

set -e

echo "=== Claude Code Repository Audit ==="
echo "Mode: TOOLS_MOBILE_V2_PIPELINE_AND_INTERACTION_REMEDIATION"
echo ""

# 调用 Claude Code，要求读取真实文件并输出审计报告
claude "你是绝世百宝箱项目的 UI 架构师。请读取以下真实仓库文件，并输出审计报告。

必须读取的文件：
1. src/app/(public)/tools/page.tsx
2. src/components/layout/JueshiV4PublicShell.tsx
3. src/components/ui-lab/jueshi-v4-home-candidate-v4/JueshiV4Header.tsx
4. src/components/design-system/PageHero.tsx
5. src/components/tools/tool-filter-bar.tsx
6. src/components/tools/tool-grid.tsx
7. src/lib/tool-center.ts
8. src/app/(public)/tools/layout.tsx
9. git show 5a30974:src/app/(public)/tools/page.tsx（仅作为上一版视觉参考）

审计输出要求：

1. 已读取文件清单（每个文件必须标注：✅ 已读取 或 ❌ 未找到）

2. 每个文件的真实作用（一句话说明）

3. 当前 Header 的真实高度和 sticky 行为：
   - Header 高度（px）
   - Header 是否 sticky
   - Header 的 z-index
   - Header 的 position 属性

4. ToolFilterBar 的真实 sticky 行为：
   - 是否使用 sticky
   - sticky 的 top 值
   - z-index
   - 是否与 Header 重叠

5. 菜单遮罩创建、关闭和卸载逻辑：
   - 菜单状态管理方式（useState / context / ref）
   - 遮罩层 DOM 结构
   - 关闭菜单时的清理逻辑
   - body overflow 是否恢复
   - aria-expanded 是否更新

6. 29 个工具的真实数据来源：
   - 数据源文件路径
   - 数据结构（字段列表）
   - 工具总数
   - 分类数量

7. 需要修改的最小文件清单：
   - 列出需要修改的文件
   - 每个文件的修改原因

8. 是否需要修改共享菜单组件：
   - 是 / 否
   - 如果需要，说明原因

必须声明：
CLAUDE_READ_REAL_REPOSITORY

如果没有真实读取证据，输出：
CLAUDE_REPOSITORY_READ_NOT_PROVEN"
