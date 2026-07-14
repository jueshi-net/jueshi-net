# Worker B: PUBLIC_LANDING content/tool 页面迁移任务

## 任务目标
将以下 PUBLIC_LANDING 页面（content/tool 变体）迁移到 PublicLandingPageFrame 模板。

## 目标页面列表（前 10 个）
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

... 还有 25 个页面

## 迁移步骤

### 1. 检查页面当前结构
读取每个页面文件，确认：
- 是否已使用 JueshiV4PublicShell
- 当前布局结构
- 页面类型（content/tool）

### 2. 应用 PublicLandingPageFrame
对每个页面：

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
        {/* 页面主内容 */}
      </PublicLandingPageFrame>
    </JueshiV4PublicShell>
  );
}
```

### 3. 选择正确的 variant
- `content`: 指南、文章、介绍类页面
- `tool`: 工具展示、工具说明类页面
- `form`: 工具主界面（不在本 Worker 范围）

### 4. 移除重复布局
- 删除页面内的 min-h-screen
- 删除页面内的 max-w-4xl 或 max-w-7xl 容器
- 删除页面内的 px-4/py-8 等间距
- 删除自定义面包屑（PublicLandingPageFrame 已包含）

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
- 本 Worker 只处理 content/tool 变体，不处理 form 变体
