import React from 'react';
import { Breadcrumb } from '@/components/breadcrumb';

interface PublicLandingPageFrameProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  variant?: 'content' | 'tool' | 'form';
}

/**
 * 公共落地页模板框架
 * 
 * 适用于：
 * - /tools/[slug] 工具详情页
 * - /guides/[slug] 指南详情页
 * - /starter 新手指南
 * - /packages/[id] 套餐详情页
 * 
 * 变体：
 * - content: 内容型（指南、文章）
 * - tool: 工具型（工具详情、演示）
 * - form: 表单型（工具主界面）
 */
export default function PublicLandingPageFrame({
  title,
  description,
  icon,
  children,
  actions,
  variant = 'content',
}: PublicLandingPageFrameProps) {
  const containerClass = variant === 'form' 
    ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'
    : 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={containerClass}>
        {/* 面包屑（自动生成） */}
        <div className="mb-6">
          <Breadcrumb />
        </div>

        {/* 标题区 */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-3 flex-1">
              {icon && (
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                  {icon}
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
                {description && (
                  <p className="text-gray-600 text-lg">{description}</p>
                )}
              </div>
            </div>
            {actions && <div className="flex-shrink-0">{actions}</div>}
          </div>
        </div>

        {/* 主内容区 */}
        <div className={variant === 'form' ? '' : 'prose prose-sm max-w-none'}>
          {children}
        </div>
      </div>
    </div>
  );
}
