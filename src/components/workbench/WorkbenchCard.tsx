'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, MoreVertical, GripVertical, Star, StarOff } from 'lucide-react';

interface WorkbenchCardProps {
  /** 卡片标题 */
  title: string;
  /** 一行极简描述 */
  description?: string;
  /** 站内路由 (优先) */
  route?: string;
  /** 外部 URL */
  url?: string;
  /** Lucide icon 名称 */
  icon?: React.ReactNode;
  /** 是否站内工具 */
  isInternal?: boolean;
  /** 角标: hot / new / recommended / free / paid */
  tag?: string;
  /** 是否已收藏 */
  isFavorite?: boolean;
  /** 收藏切换回调 */
  onToggleFavorite?: () => void;
  /** 排序序号 */
  sortOrder?: number;
}

const TAG_STYLES: Record<string, string> = {
  hot: 'bg-red-50 text-red-600 border-red-100',
  new: 'bg-blue-50 text-blue-600 border-blue-100',
  recommended: 'bg-teal-50 text-teal-600 border-teal-100',
  free: 'bg-green-50 text-green-600 border-green-100',
  paid: 'bg-amber-50 text-amber-600 border-amber-100',
};

const TAG_LABELS: Record<string, string> = {
  hot: '热门',
  new: 'NEW',
  recommended: '推荐',
  free: '免费',
  paid: '付费',
};

export default function WorkbenchCard({
  title,
  description,
  route,
  url,
  icon,
  isInternal = true,
  tag,
  isFavorite,
  onToggleFavorite,
}: WorkbenchCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const href = isInternal && route ? route : (url || '#');
  const isExternal = !isInternal || !route;

  const CardContent = (
    <div
      className="group relative bg-white rounded-xl border border-gray-100 shadow-sm shadow-gray-100/50 p-4 transition-all duration-200 hover:shadow-md hover:shadow-gray-200/50 hover:border-gray-200 hover:-translate-y-0.5 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 顶部行: 图标 + 标题 + 操作 */}
      <div className="flex items-start gap-3">
        {/* 图标容器 */}
        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400 group-hover:text-teal-500 group-hover:bg-teal-50 group-hover:border-teal-100 transition-all duration-200">
          {icon}
        </div>

        {/* 标题 + 描述 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
            {tag && TAG_STYLES[tag] && (
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${TAG_STYLES[tag]}`}>
                {TAG_LABELS[tag] || tag}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{description}</p>
          )}
        </div>

        {/* 右上角操作区 */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* 收藏按钮 */}
          {onToggleFavorite && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(); }}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
              title={isFavorite ? '取消收藏' : '收藏'}
            >
              {isFavorite ? (
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              ) : (
                <StarOff className="w-3.5 h-3.5 text-gray-300 hover:text-amber-400" />
              )}
            </button>
          )}
          {/* 更多/拖拽手柄 */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors cursor-grab"
            title="拖拽排序"
          >
            <GripVertical className="w-3.5 h-3.5 text-gray-300" />
          </button>
        </div>
      </div>

      {/* 外部链接标识 */}
      {isExternal && (
        <div className="absolute top-3 right-3">
          <ExternalLink className="w-3 h-3 text-gray-300" />
        </div>
      )}
    </div>
  );

  // 站内路由用 Link，外部用 a
  if (isInternal && route) {
    return (
      <Link href={href} className="block">
        {CardContent}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      {CardContent}
    </a>
  );
}
