import React from 'react';
import Link from 'next/link';
import { BreadcrumbBar, SectionHeader, ContentSection, StatusBadge } from '@/components/design-system';

interface ToolLandingPageShellProps {
  /** 工具名称 */
  title: string;
  /** 工具简介 */
  subtitle?: string;
  /** 面包屑导航项 */
  breadcrumbs?: Array<{ title: string; href?: string; current?: boolean }>;
  /** 是否为官方轻应用 */
  isOfficialLightApp?: boolean;
  /** 工具运行区域内容 */
  children: React.ReactNode;
  /** 使用说明内容 */
  usageTips?: React.ReactNode;
  /** 隐私说明内容 */
  privacyNotice?: React.ReactNode;
  /** 相关推荐内容 */
  relatedTools?: React.ReactNode;
}

/**
 * ToolLandingPageShell - 统一工具落地页外壳
 * 
 * 复用现有 UI V4 / Design System 组件，确保所有工具页面视觉一致
 * 由 JueshiV4PublicShell 提供公共 Header/Footer，本组件只负责页面内容结构
 */
export default function ToolLandingPageShell({
  title,
  subtitle,
  breadcrumbs,
  isOfficialLightApp = false,
  children,
  usageTips,
  privacyNotice,
  relatedTools,
}: ToolLandingPageShellProps) {
  // 默认面包屑
  const defaultBreadcrumbs = breadcrumbs || [
    { title: '首页', href: '/' },
    { title: '工具中心', href: '/tools' },
    { title, current: true },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* 面包屑导航 */}
      <div className="mb-4">
        <BreadcrumbBar items={defaultBreadcrumbs} />
      </div>

      {/* 标题区 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {isOfficialLightApp && (
            <StatusBadge status="success">官方轻应用</StatusBadge>
          )}
        </div>
        {subtitle && (
          <p className="text-base text-gray-600">{subtitle}</p>
        )}
      </div>

      {/* 隐私说明 */}
      {privacyNotice && (
        <div className="mb-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-amber-800">{privacyNotice}</div>
          </div>
        </div>
      )}

      {/* 工具运行区域 */}
      <div className="mb-6">
        {children}
      </div>

      {/* 使用说明 */}
      {usageTips && (
        <ContentSection>
          <SectionHeader title="使用提示" />
          <div className="prose prose-sm max-w-none">
            {usageTips}
          </div>
        </ContentSection>
      )}

      {/* 相关推荐 */}
      {relatedTools && (
        <div className="mt-8">
          <SectionHeader title="相关推荐" />
          {relatedTools}
        </div>
      )}
    </div>
  );
}
