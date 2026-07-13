/**
 * StatsGrid 组件
 * 用于展示统计卡片网格布局
 */
import React, { FC, ReactNode } from 'react';

interface StatsGridProps {
  /**
   * 统计卡片数组
   */
  children: ReactNode;
  
  /**
   * 网格列数
   */
  columns?: '1' | '2' | '3' | '4' | '5' | '6';
  
  /**
   * 额外的类名
   */
  className?: string;
}

export const StatsGrid: FC<StatsGridProps> = ({
  children,
  columns = '3',
  className = ''
}) => {
  const columnClasses = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 sm:grid-cols-2',
    '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    '5': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
    '6': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-6'
  };

  return (
    <div className={`grid gap-6 ${columnClasses[columns]} ${className}`}>
      {children}
    </div>
  );
};

export default StatsGrid;