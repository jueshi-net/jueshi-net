# ADMIN 页面批量迁移任务

## 任务概述
将 10 个 ADMIN 页面迁移到 AdminPageFrame 模板。

## 目标页面（第一批）
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

## 模板组件位置
- AdminPageFrame: src/components/templates/AdminPageFrame.tsx

## 迁移模式

对每个页面执行以下步骤：

### 1. 读取当前页面
```bash
cat src/app/(admin)/[route]/page.tsx
```

### 2. 应用模板包装
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

### 4. 清理重复布局
删除以下内容：
- `min-h-screen` 类名
- `max-w-7xl` 容器
- `px-4 py-6` 间距
- 自定义标题区

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
1. /(admin)/admin/ad-placements
2. /(admin)/admin/content
3. /(admin)/admin/content/checklists
4. /(admin)/admin/content/guides
5. /(admin)/admin/landing-pages
6. /(admin)/admin/growth-logs
7. /(admin)/admin/ad-entitlements
8. /(admin)/admin/ad-creatives
9. /(admin)/admin/forum
10. /(admin)/admin/levels

## 成功标准
- 所有页面使用 AdminPageFrame
- 无重复布局代码
- 业务逻辑完整保留
- TypeScript 编译通过

## 输出要求
完成后提供：
1. 每个页面的修改摘要
2. 遇到的问题和解决方案
3. 验证结果

开始执行迁移。
