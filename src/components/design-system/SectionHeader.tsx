/**
 * SectionHeader 组件
 * 用于展示区块标题和描述
 */
import React, { FC } from 'react';

interface SectionHeaderProps {
  /**
   * 区块标题
   */
  title: string;
  
  /**
   * 区块描述
   */
  description?: string;
  
  /**
   * 额外的类名
   */
  className?: string;
  
  /**
   * 操作按钮区域
   */
  actions?: React.ReactNode;
  
  /**
   * 标题级别
   */
  headingLevel?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const SectionHeader: FC<SectionHeaderProps> = ({
  title,
  description,
  className = '',
  actions,
  headingLevel: HeadingLevel = 'h2'
}) => {
  return (
    <header className={`mb-6 sm:mb-8 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <HeadingLevel className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </HeadingLevel>
          
          {description && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="self-start sm:self-auto">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};

export default SectionHeader;