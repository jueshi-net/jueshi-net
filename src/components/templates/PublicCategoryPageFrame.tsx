import React from 'react';
import { Breadcrumb } from '@/components/breadcrumb';

interface PublicCategoryPageFrameProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

/**
 * 公共分类页模板框架
 * 
 * 适用于：
 * - /destinations 全球目的地
 * - /checklists 清单列表
 * - /topics 话题分类
 * - /blog 博客列表
 * - /resources 资源分类
 * 
 * 结构：
 * - 面包屑导航（自动生成）
 * - 分类标题区（标题 + 描述 + 图标 + 操作按钮）
 * - 主内容区（卡片/列表）
 */
export default function PublicCategoryPageFrame({
  title,
  description,
  icon,
  children,
  actions,
}: PublicCategoryPageFrameProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 面包屑（自动生成） */}
        <div className="mb-6">
          <Breadcrumb />
        </div>

        {/* 分类标题区 */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-3">
              {icon && (
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                  {icon}
                </div>
              )}
              <div>
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
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
