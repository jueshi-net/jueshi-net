'use client';

import React from 'react';
import { AdSlot } from '@/components/ads/AdSlot';

/**
 * V4 广告位网格组件
 * 
 * 调用现有 AdSlot 组件，支持矩阵布局
 * 每个 placement 独立渲染，无广告时自动折叠
 */

interface JueshiV4AdPlacementGridProps {
  placements: string[];
  columns?: number;
  showLabel?: boolean;
  title?: string;
  description?: string;
}

export default function JueshiV4AdPlacementGrid({
  placements,
  columns = 4,
  showLabel = true,
  title,
  description,
}: JueshiV4AdPlacementGridProps) {
  // 根据列数确定响应式类
  const gridColsClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
  }[columns] || 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';

  return (
    <section className="relative bg-gradient-to-br from-[#FAFBFE] to-[#F6F8FC] border border-[#E8ECF3] rounded-2xl p-5 md:p-6">
      {/* 推广标识 */}
      {showLabel && (
        <span className="absolute top-3 right-3 bg-[#FF754C]/10 text-[#FF754C] text-[10px] px-2 py-0.5 rounded font-medium z-10">
          推广
        </span>
      )}

      {/* 标题 */}
      {(title || description) && (
        <div className="mb-4 pr-14">
          {title && <h3 className="text-sm font-bold text-[#11142D]">{title}</h3>}
          {description && <p className="text-xs text-[#808191] mt-0.5">{description}</p>}
        </div>
      )}

      {/* 广告网格 */}
      <div className={`grid ${gridColsClass} gap-3`}>
        {placements.map((placement) => (
          <div key={placement} className="min-h-[100px]">
            <AdSlot placement={placement} />
          </div>
        ))}
      </div>
    </section>
  );
}
