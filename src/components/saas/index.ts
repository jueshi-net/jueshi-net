/**
 * SaaS UI 组件库
 *
 * 提供 SaaS 化设计所需的核心组件：
 * - StatusBadge: 状态标签（支持多种变体、尺寸、脉冲动画）
 * - SaasEmptyState: 空状态（支持多种场景变体、紧凑模式）
 * - CompactTable: 紧凑数据表格（支持信息密度、斑马纹、粘性表头）
 * - WorkspacePageHeader: 工作区页面头部（支持面包屑、标签页）
 * - WorkspaceSidebar: 工作区左侧导航（支持分组、折叠、徽标）
 * - WorkspaceTopbar: 工作区顶部工具栏（支持搜索、通知、用户信息）
 */

export { StatusBadge } from './StatusBadge';
export { SaasEmptyState } from './SaasEmptyState';
export { CompactTable } from './CompactTable';
export { WorkspacePageHeader } from './WorkspacePageHeader';
export { WorkspaceSidebar } from './WorkspaceSidebar';
export type { SidebarItem, SidebarSection } from './WorkspaceSidebar';
export { WorkspaceTopbar } from './WorkspaceTopbar';

// Re-export existing saas components for unified imports
export { SectionCard } from './SectionCard';
export { MetricCard } from './MetricCard';
export { ActionCard } from './ActionCard';
