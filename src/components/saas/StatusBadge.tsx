'use client';

import { cn } from '@/lib/utils';

type StatusBadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'pending'
  | 'processing';

type StatusBadgeSize = 'sm' | 'md' | 'lg';

interface StatusBadgeProps {
  label: string;
  variant?: StatusBadgeVariant;
  size?: StatusBadgeSize;
  dot?: boolean;
  pulse?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<StatusBadgeVariant, string> = {
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-gray-50 text-gray-600 border-gray-200',
  pending: 'bg-orange-50 text-orange-700 border-orange-200',
  processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const dotColors: Record<StatusBadgeVariant, string> = {
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-gray-400',
  pending: 'bg-orange-500',
  processing: 'bg-indigo-500',
};

const sizeStyles: Record<StatusBadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
  lg: 'px-2.5 py-1 text-sm',
};

const dotSizes: Record<StatusBadgeSize, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-1.5 h-1.5',
  lg: 'w-2 h-2',
};

/**
 * StatusBadge — SaaS 状态标签组件
 *
 * 支持多种状态变体、尺寸、圆点指示器、脉冲动画和图标。
 */
export function StatusBadge({
  label,
  variant = 'neutral',
  size = 'md',
  dot = false,
  pulse = false,
  icon,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {(dot || pulse) && (
        <span className="relative flex items-center justify-center">
          <span
            className={cn(
              'rounded-full',
              dotColors[variant],
              dotSizes[size]
            )}
          />
          {pulse && (
            <span
              className={cn(
                'absolute rounded-full animate-ping opacity-75',
                dotColors[variant],
                dotSizes[size]
              )}
            />
          )}
        </span>
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {label}
    </span>
  );
}
