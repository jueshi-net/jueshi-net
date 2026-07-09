/**
 * PageHero 组件 - 统一公共页面 Hero 样式
 * 用于展示页面标题和副标题等介绍性内容
 * 
 * 规范：docs/ui-acceptance/public-mobile-visual-system.md
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
   * 顶部徽章/标签（可选）
   */
  badge?: ReactNode;
  
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
  
  /**
   * 背景变体
   * - gradient: 统一渐变背景（推荐）
   * - light: 浅色背景
   * - none: 无背景
   */
  variant?: 'gradient' | 'light' | 'none';
}

export const PageHero: FC<PageHeroProps> = ({
  title,
  subtitle,
  badge,
  actions,
  className = '',
  headingLevel: HeadingLevel = 'h1',
  variant = 'gradient'
}) => {
  // 根据变体选择样式
  const bgStyles = {
    gradient: 'bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white',
    light: 'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900',
    none: 'bg-white text-gray-900'
  };

  const titleStyles = {
    gradient: 'text-white',
    light: 'text-gray-900',
    none: 'text-gray-900'
  };

  const subtitleStyles = {
    gradient: 'text-white/90',
    light: 'text-gray-600',
    none: 'text-gray-600'
  };

  const badgeStyles = {
    gradient: 'bg-white/20 backdrop-blur-sm text-white',
    light: 'bg-blue-100 text-blue-700',
    none: 'bg-blue-100 text-blue-700'
  };

  return (
    <section className={`py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-8 ${bgStyles[variant]} ${className}`}>
      <div className="max-w-[1440px] mx-auto">
        {/* Badge/Eyebrow */}
        {badge && (
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${badgeStyles[variant]}`}>
            {badge}
          </div>
        )}
        
        {/* Title */}
        <HeadingLevel className={`text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4 ${titleStyles[variant]}`}>
          {title}
        </HeadingLevel>
        
        {/* Subtitle */}
        {subtitle && (
          <p className={`text-lg sm:text-xl leading-relaxed max-w-2xl mt-2 ${subtitleStyles[variant]}`}>
            {subtitle}
          </p>
        )}
        
        {/* Actions */}
        {actions && (
          <div className="mt-6 flex gap-3 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
};

export default PageHero;
