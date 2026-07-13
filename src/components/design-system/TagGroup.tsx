/**
 * TagGroup 组件
 * 用于展示标签组
 */
import React, { FC } from 'react';

interface TagItem {
  /**
   * 标签文本
   */
  text: string;
  
  /**
   * 标签类型（影响颜色）
   */
  type?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';
  
  /**
   * 是否为圆角样式
   */
  rounded?: boolean;
}

interface TagGroupProps {
  /**
   * 标签数组
   */
  tags: TagItem[];
  
  /**
   * 额外的类名
   */
  className?: string;
  
  /**
   * 最大显示数量
   */
  maxCount?: number;
}

export const TagGroup: FC<TagGroupProps> = ({
  tags,
  className = '',
  maxCount
}) => {
  const limitedTags = maxCount ? tags.slice(0, maxCount) : tags;
  const overflowCount = maxCount && tags.length > maxCount ? tags.length - maxCount : 0;
  
  const typeClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300',
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300'
  };
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {limitedTags.map((tag, index) => (
        <span
          key={index}
          className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
            typeClasses[tag.type || 'default']
          } ${tag.rounded ? '!rounded-full' : ''}`}
        >
          {tag.text}
        </span>
      ))}
      
      {overflowCount > 0 && (
        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
          +{overflowCount}
        </span>
      )}
    </div>
  );
};

export default TagGroup;