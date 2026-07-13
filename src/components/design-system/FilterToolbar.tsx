/**
 * FilterToolbar 组件
 * 用于展示过滤器工具栏
 */
import React, { FC, ReactNode } from 'react';

interface FilterToolbarProps {
  /**
   * 过滤器控件
   */
  filters: ReactNode;
  
  /**
   * 额外的操作按钮
   */
  actions?: ReactNode;
  
  /**
   * 额外的类名
   */
  className?: string;
  
  /**
   * 是否显示分隔线
   */
  showSeparator?: boolean;
  
  /**
   * 对齐方式
   */
  align?: 'left' | 'center' | 'right';
}

export const FilterToolbar: FC<FilterToolbarProps> = ({
  filters,
  actions,
  className = '',
  showSeparator = true,
  align = 'left'
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className={`flex flex-wrap items-center gap-4 ${alignClasses[align]}`}>
        {filters}
        
        {actions && (
          <div className="ml-auto">
            {actions}
          </div>
        )}
      </div>
      
      {showSeparator && (
        <hr className="border-t border-gray-200 dark:border-gray-700" />
      )}
    </div>
  );
};

export default FilterToolbar;