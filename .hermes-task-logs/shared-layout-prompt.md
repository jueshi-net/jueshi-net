# Shared Public Layout Exclusion Task

## 任务目标
修改 public-layout-client.tsx，将 /privacy 和 /terms 两个路由排除在旧的 PublicLayoutClient 之外，使它们使用各自的 JueshiV4PublicShell。

## 当前状态
- /privacy 和 /terms 页面已各自包装了 JueshiV4PublicShell
- 但 public-layout-client.tsx 仍在为它们提供旧的 Header/Footer
- 导致页面出现重复的 Header/Footer

## 需要修改的文件
src/app/(public)/public-layout-client.tsx

## 修改要点
1. 读取现有的路由排除逻辑（参考 /feedback, /help, /pricing 的处理方式）
2. 添加 /privacy 和 /terms 到排除列表
3. 确保这两个路由返回 <>children</> 而不是包装旧布局
4. 保持其他路由的行为不变

## 禁止事项
- 不得修改其他路由的逻辑
- 不得修改 Header/Footer 组件
- 不得修改 JueshiV4PublicShell 组件
- 不得修改任何页面文件

## 成功标准
- /privacy 页面只显示一个 Header 和一个 Footer（来自 JueshiV4PublicShell）
- /terms 页面只显示一个 Header 和一个 Footer（来自 JueshiV4PublicShell）
- 其他页面（/feedback, /help, /pricing 等）的行为保持不变

## 完成标记
回复：PRIVACY_TERMS_LAYOUT_EXCLUSION_COMPLETE
ACTUAL_CHANGED_FILES=src/app/(public)/public-layout-client.tsx
