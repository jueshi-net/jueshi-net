'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface SidebarItem {
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: string | number;
  badgeVariant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children?: SidebarItem[];
}

export interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

interface WorkspaceSidebarProps {
  logo?: ReactNode;
  title?: string;
  sections: SidebarSection[];
  footer?: ReactNode;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

const badgeVariantStyles: Record<string, string> = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  neutral: 'bg-gray-100 text-gray-600',
};

/**
 * WorkspaceSidebar — SaaS 工作区左侧导航
 *
 * 支持分组、图标、徽标、折叠状态。
 * 自动根据 pathname 高亮当前项。
 */
export function WorkspaceSidebar({
  logo,
  title,
  sections,
  footer,
  collapsed = false,
  onToggleCollapse,
  className,
}: WorkspaceSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/workspace') {
      return pathname === '/workspace';
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside
      className={cn(
        'flex flex-col bg-white border-r border-gray-200 h-full transition-all duration-200',
        collapsed ? 'w-16' : 'w-60',
        className
      )}
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-gray-100 flex-shrink-0">
        {logo && (
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white">
            {logo}
          </div>
        )}
        {!collapsed && title && (
          <span className="text-sm font-bold text-gray-900 truncate">
            {title}
          </span>
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="ml-auto p-1 rounded hover:bg-gray-100 transition-colors"
            title={collapsed ? '展开侧边栏' : '收起侧边栏'}
          >
            <svg
              className={cn(
                'w-4 h-4 text-gray-400 transition-transform',
                collapsed && 'rotate-180'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation sections */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {sections.map((section, sIdx) => (
          <div key={sIdx}>
            {section.title && !collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg text-sm transition-all duration-150',
                      collapsed ? 'px-2.5 py-2 justify-center' : 'px-3 py-2',
                      active
                        ? 'bg-teal-50 text-teal-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    {item.icon && (
                      <span
                        className={cn(
                          'flex-shrink-0',
                          active ? 'text-teal-600' : 'text-gray-400'
                        )}
                      >
                        {item.icon}
                      </span>
                    )}
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span
                            className={cn(
                              'flex-shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-medium',
                              badgeVariantStyles[item.badgeVariant || 'neutral']
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {footer && (
        <div className="flex-shrink-0 border-t border-gray-100 p-3">
          {footer}
        </div>
      )}
    </aside>
  );
}
