/**
 * PageCTA 组件
 * 用于展示页面底部的行动号召区
 */
import React, { FC, ReactNode } from 'react';

interface PageCTAProps {
  /**
   * 标题
   */
  title: string;
  
  /**
   * 描述文本
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
   * 是否使用浅色背景
   */
  lightBackground?: boolean;
}

export const PageCTA: FC<PageCTAProps> = ({
  title,
  description,
  actions,
  className = '',
  lightBackground = false
}) => {
  const backgroundClass = lightBackground 
    ? 'bg-gray-50 dark:bg-gray-800' 
    : 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700';
  
  const textClass = lightBackground 
    ? 'text-gray-900 dark:text-white' 
    : 'text-white';
    
  return (
    <div className={`py-12 px-4 sm:px-6 lg:px-8 rounded-lg ${backgroundClass} ${className}`}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className={`text-3xl font-bold ${textClass} mb-4`}>
          {title}
        </h2>
        
        <p className={`text-lg ${lightBackground ? 'text-gray-600 dark:text-gray-300' : 'text-blue-100'} mb-8`}>
          {description}
        </p>
        
        <div className="flex justify-center">
          {actions}
        </div>
      </div>
    </div>
  );
};

export default PageCTA;