/**
 * EmptyState 组件
 * 用于展示空状态占位图
 */
import React, { FC, ReactNode } from 'react';
import Link from 'next/link';

interface ActionConfig {
  label: string;
  href?: string;
  onClick?: () => void;
}

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
   * 主操作按钮（支持 ReactNode 或对象配置）
   */
  primaryAction?: ReactNode | ActionConfig;
  
  /**
   * 辅助操作按钮（支持 ReactNode 或对象配置）
   */
  secondaryAction?: ReactNode | ActionConfig;
  
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

function renderAction(action: ReactNode | ActionConfig | undefined, variant: 'primary' | 'secondary'): ReactNode {
  if (!action) return null;
  
  // 如果已经是 ReactNode，直接返回
  if (React.isValidElement(action)) {
    return action;
  }
  
  // 如果是对象配置，渲染为按钮或链接
  if (typeof action === 'object' && 'label' in action) {
    const baseClasses = variant === 'primary'
      ? 'px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors'
      : 'px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors';
    
    if (action.href) {
      return (
        <Link href={action.href} className={baseClasses}>
          {action.label}
        </Link>
      );
    }
    
    if (action.onClick) {
      return (
        <button onClick={action.onClick} className={baseClasses}>
          {action.label}
        </button>
      );
    }
  }
  
  return action;
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
        {renderAction(primaryAction, 'primary')}
        {secondaryAction && (
          <div className={verticalActions ? '' : 'ml-3'}>
            {renderAction(secondaryAction, 'secondary')}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;