/**
 * SaaS UI 组件库
 *
 * 提供 SaaS 化设计所需的核心组件：
 * - CompactTable: 紧凑数据表格（支持信息密度、斑马纹、粘性表头）
 * - WorkspacePageHeader: 工作区页面头部（支持面包屑、标签页）
 * - WorkspaceSidebar: 工作区左侧导航（支持分组、折叠、徽标）
 * - WorkspaceTopbar: 工作区顶部工具栏（支持搜索、通知、用户信息）
 * - SectionCard: 区块卡片
 *
 * 注意：ActionCard、StatusBadge、EmptyState、MetricCard 已迁移到 design-system
 */

export { CompactTable } from './CompactTable';
export { WorkspacePageHeader } from './WorkspacePageHeader';
export { WorkspaceSidebar } from './WorkspaceSidebar';
export type { SidebarItem, SidebarSection } from './WorkspaceSidebar';
export { WorkspaceTopbar } from './WorkspaceTopbar';

// Re-export existing saas components for unified imports
export { SectionCard } from './SectionCard';

// MetricCard has been migrated to design-system
// Import from '@/components/design-system' instead
export { MetricCard } from '@/components/design-system';
