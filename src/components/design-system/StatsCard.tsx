/**
 * StatsCard 组件
 * 用于展示单个统计数据卡片
 */
import React, { FC } from 'react';

interface StatsCardProps {
  /**
   * 卡片标题
   */
  title?: string;
  
  /**
   * 卡片标签（兼容 MetricCard 接口）
   */
  label?: string;
  
  /**
   * 显示的数据值
   */
  value: string | number;
  
  /**
   * 数据变化趋势（可选）
   */
  trend?: {
    value: string;
    positive: boolean;
  };
  
  /**
   * 额外的类名
   */
  className?: string;
  
  /**
   * 图标元素
   */
  icon?: React.ReactNode;
}

export const StatsCard: FC<StatsCardProps> = ({
  title,
  label,
  value,
  trend,
  className = '',
  icon
}) => {
  // 支持 title 或 label（向后兼容）
  const displayTitle = title || label || '';
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {displayTitle}
          </p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        
        {icon && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            {icon}
          </div>
        )}
      </div>
      
      {trend && (
        <div className="mt-4">
          <span className={`inline-flex items-center text-sm ${
            trend.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
};

// 向后兼容导出
export const MetricCard = StatsCard;

export default StatsCard;