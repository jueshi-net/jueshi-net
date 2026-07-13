# Night 5 设计评审文档

## 任务调整说明

原计划 Batch A 包含 `/about` 和 `/contact`，但这两个页面在项目中不存在。

### 实际存在的低风险页面

从项目结构分析，以下页面适合进行 V4 Shell 统一：

1. **`/starter`** - 新手资源清单页面
   - 当前状态：使用 PublicLayoutClient
   - 风险：🟢 低
   - 复杂度：中等（201 行）

2. **`/pricing`** - 定价页面
   - 当前状态：使用 PublicLayoutClient
   - 风险：🟢 低
   - 复杂度：中等（287 行，包含客户端组件）

### 已完成的页面

- `/guides` - ✅ 已使用 JueshiV4PublicShell
- `/checklists` - ✅ 已使用 JueshiV4PublicShell
- `/topics` - ✅ 已使用 JueshiV4PublicShell (Night 4)
- `/search` - ✅ 已使用 JueshiV4PublicShell (Night 4)

## Batch A 目标

将 `/starter` 和 `/pricing` 页面统一为 V4 Shell：
- 导入并使用 JueshiV4PublicShell
- 更新 public-layout-client.tsx 跳过逻辑
- 保持原有功能和样式不变

## 风险评估

- **`/starter`**：纯静态页面，无 API 调用，风险极低
- **`/pricing`**：包含客户端组件和支付逻辑，需要谨慎处理

## 预期结果

- V4 Shell 覆盖率：4.1% (9/221) → 5.0% (11/221)
- 新增 2 个页面使用 V4 Shell
