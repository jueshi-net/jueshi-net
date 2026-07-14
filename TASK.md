# Worker A: PUBLIC_CATEGORY 页面迁移任务

## 任务目标
将以下 PUBLIC_CATEGORY 页面迁移到 PublicCategoryPageFrame 模板。

## 目标页面列表
- /destinations
- /checklists
- /resources-v2/scenarios/payment
- /resources-v2/scenarios/life
- /resources-v2/scenarios/shipping
- /resources-v2/scenarios/official
- /resources-v2/scenarios/company
- /resources-v2/scenarios/invoice

## 迁移步骤

### 1. 检查页面当前结构
读取每个页面文件，确认：
- 是否已使用 JueshiV4PublicShell
- 当前布局结构
- 是否有自定义 Header/Footer

### 2. 应用 PublicCategoryPageFrame
对每个页面：

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
        {/* 页面主内容 */}
      </PublicCategoryPageFrame>
    </JueshiV4PublicShell>
  );
}
```

### 3. 移除重复布局
- 删除页面内的 min-h-screen
- 删除页面内的 max-w-7xl 容器
- 删除页面内的 px-4/py-8 等间距
- 删除自定义面包屑（PublicCategoryPageFrame 已包含）

### 4. 保留业务内容
- 保留所有数据获取逻辑
- 保留所有业务组件
- 保留所有交互逻辑
- 只调整布局包装

### 5. 验证
- 确保页面可正常访问
- 确保无 TypeScript 错误
- 确保布局正确

## 注意事项
- 不要修改业务逻辑
- 不要修改数据获取
- 不要修改 API 调用
- 只调整布局结构
