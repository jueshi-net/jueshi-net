/**
 * StatusBadge 组件
 * 用于展示状态徽章
 */
import React, { FC } from 'react';

interface StatusBadgeProps {
  /**
   * 状态文本
   */
  children: string;
  
  /**
   * 状态类型
   */
  status: 'success' | 'warning' | 'error' | 'info' | 'default' | 'processing';
  
  /**
   * 额外的类名
   */
  className?: string;
  
  /**
   * 是否为圆形徽章
   */
  circular?: boolean;
  
  /**
   * 是否包含图标
   */
  withIcon?: boolean;
}

export const StatusBadge: FC<StatusBadgeProps> = ({
  children,
  status,
  className = '',
  circular = false,
  withIcon = false
}) => {
  const statusClasses = {
    success: 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300',
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300 animate-pulse'
  };
  
  const iconMap = {
    success: (
      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    default: null,
    processing: (
      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    )
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      statusClasses[status]
    } ${circular ? '!rounded-full' : ''} ${className}`}>
      {withIcon && iconMap[status]}
      {children}
    </span>
  );
};

export default StatusBadge;