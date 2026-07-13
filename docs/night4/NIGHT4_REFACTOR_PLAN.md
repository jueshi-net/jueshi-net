# NIGHT4_REFACTOR_PLAN.md

> Night 4 重构计划
> 生成时间: 2026-07-09
> 生成方式: Claude Code 只读分析

---

## topics 页面重构计划

### 准备替换哪些组件
- 移除旧的 `PublicLayoutClient` 布局包装
- 使用 `JueshiV4PublicShell` 组件替代原有的公共布局

### 具体修改内容
- 仅包裹 V4 Shell，不改变页面内部逻辑
- 保持所有服务器端逻辑（getTopics、metadata 等）完全不变
- 保持所有现有样式和结构完全不变
- 只在页面顶级添加 V4 Shell 包装器

## search 页面重构计划

### 准备替换哪些组件
- 移除旧的 `PublicLayoutClient` 布局包装
- 使用 `JueshiV4PublicShell` 组件替代原有的公共布局

### 具体修改内容
- 仅包裹 V4 Shell，不改变页面内部逻辑
- 保持所有客户端逻辑（useState、API 调用等）完全不变
- 保持所有现有样式和结构完全不变
- 只在页面顶级添加 V4 Shell 包装器

## 预计修改文件列表

### src/app/(public)/topics/page.tsx
```tsx
// 修改：导入 V4 Shell
import JueshiV4PublicShell from '@/components/layout/JueshiV4PublicShell';

// 修改：将整个页面内容包装在 V4 Shell 中
export default async function TopicsPage() {
  const topics = await getTopics();

  return (
    <JueshiV4PublicShell>  {/* 添加这行 */}
      <div className="min-h-screen bg-gray-50">
        {/* 保持现有内容不变 */}
        {/* Hero */}
        {/* Topic cards */}
        {/* More topics coming soon */}
        {/* Related links */}
      </div>
    </JueshiV4PublicShell>  {/* 添加这行 */}
  );
}
```

### src/app/(public)/search/page.tsx
```tsx
// 修改：导入 V4 Shell
import JueshiV4PublicShell from '@/components/layout/JueshiV4PublicShell';

// 修改：将整个页面内容包装在 V4 Shell 中
export default function SearchPage() {
  const [tab, setTab] = useState<"search" | "tracking" | "hs">("search");
  // ... 保持现有逻辑不变

  return (
    <JueshiV4PublicShell>  {/* 添加这行 */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* 保持现有内容不变 */}
        {/* Tabs */}
        {/* Search/Tracking/HS Code sections */}
      </div>
    </JueshiV4PublicShell>  {/* 添加这行 */}
  );
}
```

### src/app/(public)/public-layout-client.tsx
```tsx
// 修改：添加 topics 和 search 路由的跳过条件
export function PublicLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isUILab = pathname.startsWith('/ui-lab');
  const isV4Home = pathname === '/';
  const isResources = pathname === '/resources';
  const isResourcesSite = pathname.startsWith('/resources/site/');
  const isTools = pathname === '/tools';
  const isDestinations = pathname === '/destinations';
  const isGuides = pathname === '/guides';
  const isChecklists = pathname === '/checklists';
  const isTopics = pathname === '/topics';     // 添加这行
  const isSearch = pathname === '/search';     // 添加这行

  // 首页、UI Lab、资源页、工具页、目的地页、指南页、清单页、专题页、搜索页使用各自的 shell，跳过公共 Header/Footer
  if (isUILab || isV4Home || isResources || isResourcesSite || isTools || isDestinations || isGuides || isChecklists || isTopics || isSearch) {  // 修改这行，添加 isTopics 和 isSearch
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <FooterNew />
    </>
  );
}
```

## 风险评估

### 高风险项
- **布局破坏风险**：V4 Shell 使用不同的 Header/Footer 组件，可能导致现有页面布局样式不一致
- **SEO 影响风险**：修改布局可能影响页面元数据、结构化数据等 SEO 元素
- **移动端兼容风险**：V4 Shell 的响应式设计可能与当前页面的响应式设计不匹配

### 中风险项
- **功能冲突风险**：V4 Shell 中的全局组件可能与页面中的特定功能发生冲突
- **加载性能风险**：额外的组件嵌套可能导致页面加载时间增加
- **样式覆盖风险**：V4 Shell 中的全局样式可能意外覆盖页面特定样式

### 低风险项
- **路径变更风险**：导入路径变化可能导致构建失败（可能性较低，因路径正确）

## 回滚方案

### 步骤1：立即回滚代码
1. 还原 `src/app/(public)/topics/page.tsx` 的修改，移除 V4 Shell 包装器
2. 还原 `src/app/(public)/search/page.tsx` 的修改，移除 V4 Shell 包装器  
3. 还原 `src/app/(public)/public-layout-client.tsx` 的修改，删除 isTopics 和 isSearch 条件

### 步骤2：验证回滚效果
1. 启动开发服务器验证页面是否正常显示
2. 测试所有页面功能是否正常工作
3. 确认 Header/Footer 显示正常

### 步骤3：部署回滚版本
1. 如果在生产环境，则部署上一个稳定版本
2. 如果在预发布环境，则重新构建最新稳定分支

### 回滚检查点
- [ ] topics 页面恢复使用旧的 PublicLayoutClient
- [ ] search 页面恢复使用旧的 PublicLayoutClient  
- [ ] public-layout-client.tsx 中移除新增的路由判断逻辑
- [ ] 所有页面功能恢复正常
- [ ] 所有样式显示正常
- [ ] SEO 元素未受影响

关键原则：
- Night 4 只做 V4 Shell 包裹，不做 Design System 替换
- 保持所有现有功能不变
- 只修改 public-layout-client.tsx 添加跳过条件

---

**文档状态**: NIGHT4_REFACTOR_PLAN_COMPLETED  
**生成时间**: 2026-07-09
