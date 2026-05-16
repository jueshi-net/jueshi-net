"use client";

import { cn } from "@/lib/utils";
import { BaseButton } from "./base-button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  variant?: "default" | "unauthorized" | "no-data";
}

/**
 * EmptyState — 空状态组件
 *
 * 变体：default（通用）、unauthorized（未登录/无权限）、no-data（无数据）
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  variant = "default",
}: EmptyStateProps) {
  const defaultIcons: Record<string, React.ReactNode> = {
    default: (
      <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
    unauthorized: (
      <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    "no-data": (
      <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className={cn(
      "bg-white rounded-xl border border-gray-200 p-12 md:p-16 text-center",
      className
    )}>
      <div className="flex justify-center mb-4">
        {icon || defaultIcons[variant]}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      {actionLabel && onAction && (
        <BaseButton variant="primary" onClick={onAction}>
          {actionLabel}
        </BaseButton>
      )}
    </div>
  );
}
