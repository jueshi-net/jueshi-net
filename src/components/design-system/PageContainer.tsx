/**
 * PageContainer 组件
 * 用于包裹整个页面内容，提供标准化的布局容器
 */
import React, { FC, ReactNode } from 'react';

interface PageContainerProps {
  /**
   * 页面主体内容
   */
  children: ReactNode;
  
  /**
   * 额外的类名
   */
  className?: string;
  
  /**
   * 是否添加顶部边距
   */
  paddingTop?: boolean;
  
  /**
   * 是否添加底部边距
   */
  paddingBottom?: boolean;
}

export const PageContainer: FC<PageContainerProps> = ({
  children,
  className = '',
  paddingTop = true,
  paddingBottom = true
}) => {
  const baseClasses = 'w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8';
  const paddingClasses = `${paddingTop ? 'pt-6 sm:pt-8 lg:pt-12' : ''} ${paddingBottom ? 'pb-6 sm:pb-8 lg:pb-12' : ''}`;
  
  return (
    <div className={`${baseClasses} ${paddingClasses} ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;