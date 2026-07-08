# NIGHT5_REFACTOR_PLAN.md

## /starter 页面重构计划
- 准备替换哪些组件
  - 移除当前页面的 Header 和 Footer 相关代码
  - 使用 JueshiV4PublicShell 包裹页面内容
- 具体修改内容（只包裹 V4 Shell，不改变页面内部逻辑）
  - 在 starter/page.tsx 中导入并使用 JueshiV4PublicShell
  - 将现有页面内容作为 children 传入 JueshiV4PublicShell
  - 保持页面的全部业务逻辑、样式和功能不变

## /pricing 页面重构计划
- 准备替换哪些组件
  - 移除当前页面的 Header 和 Footer 相关代码
  - 使用 JueshiV4PublicShell 包裹页面内容
- 具体修改内容（只包裹 V4 Shell，不改变页面内部逻辑）
  - 在 pricing/page.tsx 中不再直接返回 PricingClient
  - 而是将 PricingClient 包裹在 JueshiV4PublicShell 中
  - 保持页面的全部业务逻辑、样式和功能不变
- 注意：pricing 页面有客户端组件 pricing-client.tsx
  - pricing-client.tsx 本身不修改，保持原有逻辑
  - 仅在父级页面（pricing/page.tsx）中添加 V4 Shell 包裹

## 预计修改文件列表
1. `src/app/(public)/starter/page.tsx`
   - 导入 JueshiV4PublicShell 组件
   - 将整个页面内容用 JueshiV4PublicShell 包裹
   
2. `src/app/(public)/pricing/page.tsx`
   - 导入 JueshiV4PublicShell 组件
   - 将 PricingClient 组件用 JueshiV4PublicShell 包裹
   
3. `src/app/(public)/public-layout-client.tsx`
   - 添加对 /starter 和 /pricing 路径的检测
   - 在条件判断中增加这两个路径，使其跳过公共 Header/Footer

## 风险评估
- 功能风险：由于只是在外层添加 Shell 包裹，理论上不会影响页面内部逻辑
- 样式风险：可能存在全局样式冲突，因为 V4 Shell 可能引入新的 CSS 规则
- 性能风险：极小，只是增加了组件层级，没有额外的数据请求
- 兼容性风险：确保 V4 Shell 与现有的 Next.js 版本兼容

## 回滚方案
- 如果出现问题，可快速回滚到修改前的版本：
  - 恢复 `src/app/(public)/starter/page.tsx` 到原始状态
  - 恢复 `src/app/(public)/pricing/page.tsx` 到原始状态
  - 恢复 `src/app/(public)/public-layout-client.tsx` 到原始状态
- 使用 git checkout 命令恢复相关文件
- 测试页面确保恢复正常后再进行部署

关键原则：
- 只做 V4 Shell 包裹，不做 Design System 替换
- 保持所有现有功能不变
- 只修改 public-layout-client.tsx 添加跳过条件
