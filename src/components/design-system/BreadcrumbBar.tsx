/**
 * BreadcrumbBar 组件
 * 用于展示面包屑导航
 */
import React, { FC } from 'react';

interface BreadcrumbItem {
  /**
   * 链接文字
   */
  title: string;
  
  /**
   * 链接地址
   */
  href?: string;
  
  /**
   * 是否为当前页面
   */
  current?: boolean;
}

interface BreadcrumbBarProps {
  /**
   * 面包屑项数组
   */
  items: BreadcrumbItem[];
  
  /**
   * 额外的类名
   */
  className?: string;
}

export const BreadcrumbBar: FC<BreadcrumbBarProps> = ({
  items,
  className = ''
}) => {
  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg
                className="flex-shrink-0 w-5 h-5 text-gray-400 dark:text-gray-500 mx-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            
            {item.href && !item.current ? (
              <a
                href={item.href}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {item.title}
              </a>
            ) : (
              <span className={`font-medium ${
                item.current 
                  ? 'text-gray-900 dark:text-white' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {item.title}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbBar;