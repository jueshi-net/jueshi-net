/**
 * EmptyState 组件
 * 用于展示空状态占位图
 */
import React, { FC, ReactNode } from 'react';

interface EmptyStateProps {
  /**
   * 标题
   */
  title: string;
  
  /**
   * 描述文本
   */
  description: string;
  
  /**
   * 主操作按钮
   */
  primaryAction?: ReactNode;
  
  /**
   * 辅助操作按钮
   */
  secondaryAction?: ReactNode;
  
  /**
   * 图标元素
   */
  icon?: ReactNode;
  
  /**
   * 额外的类名
   */
  className?: string;
  
  /**
   * 是否显示辅助操作在主操作下方
   */
  verticalActions?: boolean;
}

export const EmptyState: FC<EmptyStateProps> = ({
  title,
  description,
  primaryAction,
  secondaryAction,
  icon,
  className = '',
  verticalActions = false
}) => {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {icon && (
        <div className="mx-auto h-24 w-24 flex items-center justify-center text-gray-400 dark:text-gray-500 mb-4">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {description}
      </p>
      
      <div className={`flex ${verticalActions ? 'flex-col' : 'flex-row items-center justify-center'} gap-3`}>
        {primaryAction}
        {secondaryAction && (
          <div className={verticalActions ? '' : 'ml-3'}>
            {secondaryAction}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;