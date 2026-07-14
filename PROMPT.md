# PUBLIC_LANDING content/tool 页面批量迁移任务

## 任务概述
将 10 个 PUBLIC_LANDING 页面（content/tool 变体）迁移到 PublicLandingPageFrame 模板。

## 目标页面（第一批）
  - /
  - /
  - /tools/video-script-sop
  - /tools/postal-code
  - /tools/handover-note
  - /tools/document-runtime-demo
  - /tools/sensitive-goods
  - /tools/documents
  - /tools/documents/quotation
  - /tools/documents/settings/role-switcher

## 模板组件位置
- PublicLandingPageFrame: src/components/templates/PublicLandingPageFrame.tsx
- JueshiV4PublicShell: src/components/layout/JueshiV4PublicShell.tsx

## 迁移模式

对每个页面执行以下步骤：

### 1. 读取当前页面
```bash
cat src/app/(public)/[route]/page.tsx
```

### 2. 应用模板包装
```tsx
import PublicLandingPageFrame from '@/components/templates/PublicLandingPageFrame';
import JueshiV4PublicShell from '@/components/layout/JueshiV4PublicShell';

export default function Page() {
  return (
    <JueshiV4PublicShell>
      <PublicLandingPageFrame
        title="页面标题"
        description="页面描述"
        icon={<IconComponent />}
        variant="content" // 或 "tool"
      >
        {/* 原有内容 */}
      </PublicLandingPageFrame>
    </JueshiV4PublicShell>
  );
}
```

### 3. 选择正确的 variant
- `content`: 指南、文章、介绍类页面
- `tool`: 工具展示、工具说明类页面

### 4. 清理重复布局
删除以下内容：
- `min-h-screen` 类名
- `max-w-4xl` 或 `max-w-7xl` 容器
- `px-4 sm:px-6 lg:px-8` 间距
- `py-8` 间距
- 自定义面包屑组件

### 5. 保留业务逻辑
保留：
- 数据获取
- 业务组件
- 状态管理
- 事件处理

### 6. 验证
- TypeScript 编译通过
- 页面可正常访问
- 布局正确

## 执行顺序
1. /
2. /
3. /tools/video-script-sop
4. /tools/postal-code
5. /tools/handover-note
6. /tools/document-runtime-demo
7. /tools/sensitive-goods
8. /tools/documents
9. /tools/documents/quotation
10. /tools/documents/settings/role-switcher

## 成功标准
- 所有页面使用 PublicLandingPageFrame
- 所有页面使用 JueshiV4PublicShell
- 无重复布局代码
- 业务逻辑完整保留
- TypeScript 编译通过

## 输出要求
完成后提供：
1. 每个页面的修改摘要
2. 遇到的问题和解决方案
3. 验证结果

开始执行迁移。
