# Worker D: ADMIN 页面迁移任务

## 任务目标
将以下 ADMIN 页面迁移到 AdminPageFrame 模板。

## 目标页面列表
- /(admin)/admin/ad-placements
- /(admin)/admin/content
- /(admin)/admin/content/checklists
- /(admin)/admin/content/guides
- /(admin)/admin/landing-pages
- /(admin)/admin/growth-logs
- /(admin)/admin/ad-entitlements
- /(admin)/admin/ad-creatives
- /(admin)/admin/forum
- /(admin)/admin/levels

... 还有 1 个页面

## 迁移步骤

### 1. 检查页面当前结构
读取每个页面文件，确认：
- 当前布局结构
- 页面类型（table/form/detail）

### 2. 应用 AdminPageFrame
对每个页面：

```tsx
import AdminPageFrame from '@/components/templates/AdminPageFrame';

export default function Page() {
  return (
    <AdminPageFrame
      title="页面标题"
      description="页面描述"
      icon={<IconComponent />}
      variant="table" // 或 "form" 或 "detail"
      actions={
        <Button>操作按钮</Button>
      }
    >
      {/* 页面主内容 */}
    </AdminPageFrame>
  );
}
```

### 3. 选择正确的 variant
- `table`: 列表页、数据表格页
- `form`: 表单页、编辑页
- `detail`: 详情页、查看页

### 4. 移除重复布局
- 删除页面内的 min-h-screen
- 删除页面内的 max-w-7xl 容器
- 删除页面内的 px-4/py-6 等间距
- 删除自定义标题区（AdminPageFrame 已包含）

### 5. 保留业务内容
- 保留所有数据获取逻辑
- 保留所有业务组件
- 保留所有交互逻辑
- 只调整布局包装

### 6. 验证
- 确保页面可正常访问
- 确保无 TypeScript 错误
- 确保布局正确

## 注意事项
- 不要修改业务逻辑
- 不要修改数据获取
- 不要修改 API 调用
- 只调整布局结构
- Admin 页面不需要 JueshiV4PublicShell 包装
