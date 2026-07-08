/**
 * PageHero 组件
 * 用于展示页面标题和副标题等介绍性内容
 */
import React, { FC, ReactNode } from 'react';

interface PageHeroProps {
  /**
   * 主标题
   */
  title: string;
  
  /**
   * 副标题或描述
   */
  subtitle?: string;
  
  /**
   * 操作按钮区域
   */
  actions?: ReactNode;
  
  /**
   * 额外的类名
   */
  className?: string;
  
  /**
   * 标题级别的标签 (h1, h2, h3 等)
   */
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const PageHero: FC<PageHeroProps> = ({
  title,
  subtitle,
  actions,
  className = '',
  headingLevel: HeadingLevel = 'h1'
}) => {
  return (
    <section className={`mb-8 sm:mb-12 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <HeadingLevel className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </HeadingLevel>
          
          {subtitle && (
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {subtitle}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="self-start sm:self-auto">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
};

export default PageHero;