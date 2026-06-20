'use client';

import { cn } from '@/lib/utils';
import { Inbox, Search, FileX, ShieldX } from 'lucide-react';

type EmptyStateVariant = 'no-data' | 'no-results' | 'no-access' | 'error';

interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

interface SaasEmptyStateProps {
  variant?: EmptyStateVariant;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
  compact?: boolean;
}

const defaultIcons: Record<EmptyStateVariant, React.ReactNode> = {
  'no-data': <Inbox className="w-12 h-12" />,
  'no-results': <Search className="w-12 h-12" />,
  'no-access': <ShieldX className="w-12 h-12" />,
  error: <FileX className="w-12 h-12" />,
};

const iconBgColors: Record<EmptyStateVariant, string> = {
  'no-data': 'bg-gray-50 text-gray-400',
  'no-results': 'bg-blue-50 text-blue-400',
  'no-access': 'bg-amber-50 text-amber-400',
  error: 'bg-red-50 text-red-400',
};

/**
 * SaasEmptyState — SaaS 空状态组件
 *
 * 变体：no-data（无数据）、no-results（无搜索结果）、no-access（无权限）、error（错误）
 * 支持紧凑模式，适用于卡片内嵌场景。
 */
export function SaasEmptyState({
  variant = 'no-data',
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  className,
  compact = false,
}: SaasEmptyStateProps) {
  const ActionButton = ({
    action,
    isPrimary,
  }: {
    action: EmptyStateAction;
    isPrimary?: boolean;
  }) => {
    const baseClasses = cn(
      'inline-flex items-center gap-1.5 rounded-lg text-sm font-medium transition-colors',
      isPrimary
        ? 'px-4 py-2 bg-teal-600 text-white hover:bg-teal-700'
        : 'px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200'
    );

    if (action.href) {
      return (
        <a href={action.href} className={baseClasses}>
          {action.label}
        </a>
      );
    }

    return (
      <button onClick={action.onClick} className={baseClasses}>
        {action.label}
      </button>
    );
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center text-center',
        compact ? 'p-6' : 'p-10 md:p-14',
        className
      )}
    >
      <div
        className={cn(
          'rounded-2xl flex items-center justify-center mb-4',
          iconBgColors[variant],
          compact ? 'w-12 h-12' : 'w-16 h-16'
        )}
      >
        {icon || defaultIcons[variant]}
      </div>

      <h3
        className={cn(
          'font-semibold text-gray-900 mb-1.5',
          compact ? 'text-sm' : 'text-base'
        )}
      >
        {title}
      </h3>

      {description && (
        <p
          className={cn(
            'text-gray-500 max-w-sm mx-auto mb-5',
            compact ? 'text-xs' : 'text-sm'
          )}
        >
          {description}
        </p>
      )}

      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-3">
          {secondaryAction && (
            <ActionButton action={secondaryAction} isPrimary={false} />
          )}
          {primaryAction && <ActionButton action={primaryAction} isPrimary />}
        </div>
      )}
    </div>
  );
}
