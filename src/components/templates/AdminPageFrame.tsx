import React from 'react';

interface AdminPageFrameProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  variant?: 'table' | 'form' | 'detail';
}

/**
 * 后台管理页模板框架
 * 
 * 适用于：
 * - 列表页（table）
 * - 表单页（form）
 * - 详情页（detail）
 * 
 * 结构：
 * - 页面标题区（标题 + 描述 + 图标 + 操作按钮）
 * - 主内容区（表格/表单/详情）
 */
export default function AdminPageFrame({
  title,
  description,
  icon,
  children,
  actions,
  variant = 'table',
}: AdminPageFrameProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 页面标题区 */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {icon && (
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white">
                  {icon}
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
                {description && (
                  <p className="text-sm text-gray-600">{description}</p>
                )}
              </div>
            </div>
            {actions && <div className="flex-shrink-0">{actions}</div>}
          </div>
        </div>

        {/* 主内容区 */}
        <div className={variant === 'table' ? 'bg-white rounded-lg shadow-sm border border-gray-200' : ''}>
          {children}
        </div>
      </div>
    </div>
  );
}
