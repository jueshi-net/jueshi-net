'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface ToolWorkspaceShellProps {
  /** 工具名称 */
  title: string;
  /** 工具简介 */
  subtitle?: string;
  /** 面包屑导航项 */
  breadcrumbs?: Array<{ title: string; href?: string; current?: boolean }>;
  /** 工具工作台主体内容（包含表单和预览双栏） */
  children: React.ReactNode;
  /** 页面底部区域（FAQ、相关工具、任务链等） */
  bottomSections?: React.ReactNode;
}

/**
 * ToolWorkspaceShell - 复杂工具工作台外壳
 *
 * 提供宽屏容器（max-w-[1400px]），不包裹白色卡片，
 * 让工具页面内部的 sticky 工具栏和双栏布局自由展开。
 *
 * 由 JueshiV4PublicShell（layout 提供）负责 Header/Footer，
 * 本组件只负责页面内容结构。
 */
export default function ToolWorkspaceShell({
  title,
  subtitle,
  breadcrumbs,
  children,
  bottomSections,
}: ToolWorkspaceShellProps) {
  const defaultBreadcrumbs = breadcrumbs || [
    { title: '首页', href: '/' },
    { title: '工具中心', href: '/tools' },
    { title, current: true },
  ];

  return (
    <div className="bg-bg min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        {/* 面包屑 */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-3" aria-label="Breadcrumb">
          {defaultBreadcrumbs.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {item.href && !item.current ? (
                <Link href={item.href} className="hover:text-brand transition-colors">
                  {item.title}
                </Link>
              ) : (
                <span className={item.current ? 'text-gray-900 font-medium' : ''}>
                  {item.title}
                </span>
              )}
              {!item.current && <ChevronRight className="w-3 h-3 text-gray-300" />}
            </span>
          ))}
        </nav>

        {/* 标题区 */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>

        {/* 主体内容 */}
        {children}

        {/* 底部区域 */}
        {bottomSections && (
          <div className="mt-8 space-y-6">
            {bottomSections}
          </div>
        )}
      </div>
    </div>
  );
}
