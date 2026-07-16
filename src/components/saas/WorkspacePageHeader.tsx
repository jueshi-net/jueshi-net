'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface WorkspacePageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  backHref?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  tabs?: {
    label: string;
    href?: string;
    active?: boolean;
    onClick?: () => void;
  }[];
  className?: string;
}

/**
 * WorkspacePageHeader — 工作区页面头部
 *
 * 支持面包屑、图标、标签页、操作按钮区域。
 * 适用于 SaaS 工作区内的各功能页面顶部。
 */
export function WorkspacePageHeader({
  title,
  subtitle,
  icon,
  backHref,
  breadcrumbs,
  actions,
  tabs,
  className,
}: WorkspacePageHeaderProps) {
  return (
    <div className={cn('bg-white border-b border-gray-200', className)}>
      <div className="px-6 py-4">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            {breadcrumbs.map((item, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                {idx > 0 && <span>/</span>}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-gray-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-gray-600">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Title row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {backHref && (
              <Link
                href={backHref}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </Link>
            )}
            {icon && (
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center text-teal-600">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex-shrink-0 flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      {tabs && tabs.length > 0 && (
        <div className="px-6 flex items-center gap-1 border-t border-gray-100 overflow-x-auto scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
          {tabs.map((tab, idx) => {
            const tabClasses = cn(
              'px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0',
              tab.active
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            );

            if (tab.href) {
              return (
                <Link key={idx} href={tab.href} className={tabClasses}>
                  {tab.label}
                </Link>
              );
            }

            return (
              <button
                key={idx}
                onClick={tab.onClick}
                className={tabClasses}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
