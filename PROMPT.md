# PUBLIC_CATEGORY 页面批量迁移任务

## 任务概述
将 8 个 PUBLIC_CATEGORY 页面迁移到 PublicCategoryPageFrame 模板。

## 目标页面
  - /destinations
  - /checklists
  - /resources-v2/scenarios/payment
  - /resources-v2/scenarios/life
  - /resources-v2/scenarios/shipping
  - /resources-v2/scenarios/official
  - /resources-v2/scenarios/company
  - /resources-v2/scenarios/invoice

## 模板组件位置
- PublicCategoryPageFrame: src/components/templates/PublicCategoryPageFrame.tsx
- JueshiV4PublicShell: src/components/layout/JueshiV4PublicShell.tsx

## 迁移模式

对每个页面执行以下步骤：

### 1. 读取当前页面
```bash
cat src/app/(public)/[route]/page.tsx
```

### 2. 应用模板包装
```tsx
import PublicCategoryPageFrame from '@/components/templates/PublicCategoryPageFrame';
import JueshiV4PublicShell from '@/components/layout/JueshiV4PublicShell';

export default function Page() {
  return (
    <JueshiV4PublicShell>
      <PublicCategoryPageFrame
        title="页面标题"
        description="页面描述"
        icon={<IconComponent />}
      >
        {/* 原有内容 */}
      </PublicCategoryPageFrame>
    </JueshiV4PublicShell>
  );
}
```

### 3. 清理重复布局
删除以下内容：
- `min-h-screen` 类名
- `max-w-7xl mx-auto` 容器
- `px-4 sm:px-6 lg:px-8` 间距
- `py-8` 间距
- 自定义面包屑组件

### 4. 保留业务逻辑
保留：
- 数据获取（getServerSideProps, fetch 等）
- 业务组件
- 状态管理
- 事件处理

### 5. 验证
- TypeScript 编译通过
- 页面可正常访问
- 布局正确

## 执行顺序
按以下顺序处理页面：
1. /destinations
2. /checklists
3. /resources-v2/scenarios/payment
4. /resources-v2/scenarios/life
5. /resources-v2/scenarios/shipping
6. /resources-v2/scenarios/official
7. /resources-v2/scenarios/company
8. /resources-v2/scenarios/invoice

## 成功标准
- 所有页面使用 PublicCategoryPageFrame
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
