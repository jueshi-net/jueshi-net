# Pricing 页面 V4 Public Shell 对齐任务

## 任务目标
将 /pricing 页面与 V4 Public Shell 对齐，确保 Header/Footer 与其他页面一致。

## 当前状态
- /pricing 页面已使用 JueshiV4PublicShell 包装
- public-layout-client.tsx 已排除 /pricing 路由
- 需要检查是否存在重复的 Header/Footer

## 需要检查的文件
1. src/app/(public)/pricing/page.tsx
2. src/app/(public)/pricing/pricing-client.tsx
3. src/app/(public)/public-layout-client.tsx

## 检查要点
1. pricing-client.tsx 是否包含自己的 Header/Footer
2. 是否存在重复的 Shell 包装
3. 页面布局是否符合 V4 设计系统

## 如果发现重复 Header/Footer
- 删除 pricing-client.tsx 中的 Header/Footer
- 确保只使用 JueshiV4PublicShell 提供的 Header/Footer
- 保留 pricing-client.tsx 中的业务逻辑（套餐卡片、FAQ、购买按钮等）

## 成功标准
- /pricing 页面显示正确的 V4 Header/Footer
- 无重复的 Header/Footer
- 页面内容完整（套餐、FAQ、购买功能）
- 移动端和桌面端布局正常
