/**
 * ContentSection 组件
 * 用于展示内容区块，包含标题、描述和内容区域
 */
import React, { FC, ReactNode } from 'react';
import { SectionHeader } from './SectionHeader';

interface ContentSectionProps {
  /**
   * 区块标题
   */
  title?: string;
  
  /**
   * 区块描述
   */
  description?: string;
  
  /**
   * 内容主体
   */
  children: ReactNode;
  
  /**
   * 额外的类名
   */
  className?: string;
  
  /**
   * 头部操作按钮
   */
  actions?: ReactNode;
  
  /**
   * 标题级别
   */
  headingLevel?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const ContentSection: FC<ContentSectionProps> = ({
  title,
  description,
  children,
  className = '',
  actions,
  headingLevel = 'h2'
}) => {
  return (
    <section className={`py-8 sm:py-12 ${className}`}>
      {(title || description || actions) && (
        <SectionHeader
          title={title || ''}
          description={description}
          actions={actions}
          headingLevel={headingLevel}
        />
      )}
      
      <div className="mt-6">
        {children}
      </div>
    </section>
  );
};

export default ContentSection;