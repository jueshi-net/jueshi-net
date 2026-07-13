/**
 * StickySidebar 组件
 * 用于创建粘性侧边栏布局
 */
import React, { FC, ReactNode } from 'react';

interface StickySidebarProps {
  /**
   * 侧边栏内容
   */
  sidebar: ReactNode;
  
  /**
   * 主内容区域
   */
  children: ReactNode;
  
  /**
   * 额外的类名
   */
  className?: string;
  
  /**
   * 是否在小屏幕上隐藏侧边栏
   */
  hideOnMobile?: boolean;
  
  /**
   * 侧边栏宽度（响应式）
   */
  sidebarWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const StickySidebar: FC<StickySidebarProps> = ({
  sidebar,
  children,
  className = '',
  hideOnMobile = false,
  sidebarWidth = 'md'
}) => {
  const widthClasses = {
    sm: 'w-48',
    md: 'w-64',
    lg: 'w-80',
    xl: 'w-96'
  };
  
  return (
    <div className={`flex flex-col lg:flex-row gap-8 ${className}`}>
      <aside 
        className={`${hideOnMobile ? 'hidden lg:block' : ''} sticky top-6 self-start ${widthClasses[sidebarWidth]}`}
      >
        {sidebar}
      </aside>
      
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default StickySidebar;