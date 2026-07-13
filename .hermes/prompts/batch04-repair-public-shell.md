# 修复公共页面 Shell

## 任务
修复 /changelog 和 /shipping 页面，使其使用 JueshiV4PublicShell。

## 当前状态
- /changelog 和 /shipping 页面存在，但未使用 JueshiV4PublicShell
- 参考页面：/help 和 /privacy 已正确使用 JueshiV4PublicShell

## 要求
1. 在 /changelog/page.tsx 和 /shipping/page.tsx 中导入并使用 JueshiV4PublicShell
2. 保留现有页面内容和业务逻辑
3. 不修改 JueshiV4PublicShell 组件本身
4. 不修改 public-layout-client.tsx（由后续任务处理）
5. 不修改其他页面

## 参考实现
参考 /help/page.tsx 的实现方式：
```tsx
import JueshiV4PublicShell from '@/components/layout/JueshiV4PublicShell';

export default function HelpPage() {
  return (
    <JueshiV4PublicShell>
      {/* 页面内容 */}
    </JueshiV4PublicShell>
  );
}
```

## 验证
- 两个页面都能正常渲染
- 页面内容保持不变
- 使用 JueshiV4PublicShell 包裹

## 成功标记
完成后输出：
```
PUBLIC_SHELL_REPAIR_COMPLETE
- /changelog: 已使用 JueshiV4PublicShell
- /shipping: 已使用 JueshiV4PublicShell
```
