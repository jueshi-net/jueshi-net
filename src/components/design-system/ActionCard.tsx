/**
 * ActionCard 组件
 * 用于展示具有操作功能的卡片
 */
import React, { FC, ReactNode } from 'react';

interface ActionCardProps {
  /**
   * 卡片标题
   */
  title: string;
  
  /**
   * 卡片描述
   */
  description: string;
  
  /**
   * 操作按钮
   */
  actions: ReactNode;
  
  /**
   * 额外的类名
   */
  className?: string;
  
  /**
   * 图标元素
   */
  icon?: ReactNode;
  
  /**
   * 是否为突出显示样式
   */
  prominent?: boolean;
}

export const ActionCard: FC<ActionCardProps> = ({
  title,
  description,
  actions,
  className = '',
  icon,
  prominent = false
}) => {
  const baseClasses = prominent 
    ? 'border-2 border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20' 
    : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800';
    
  return (
    <div className={`rounded-lg p-6 shadow-sm ${baseClasses} ${className}`}>
      <div className="flex items-start">
        {icon && (
          <div className="flex-shrink-0 mr-4">
            {icon}
          </div>
        )}
        
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
          
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {description}
          </p>
          
          <div className="mt-4">
            {actions}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionCard;