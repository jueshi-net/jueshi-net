'use client';

import React from 'react';
import { Megaphone } from 'lucide-react';

interface AdSlotProps {
  slotKey: string;
  variant?: 'banner' | 'card' | 'inline' | 'mobile' | 'footer';
  title?: string;
  description?: string;
  cta?: string;
  imageUrl?: string;
  className?: string;
}

// Mock 广告数据（仅 UI Lab 演示）
const mockAds: Record<string, { title: string; description: string; cta: string }> = {
  home_after_hero_banner: {
    title: '跨境服务推荐',
    description: '专业国际物流解决方案，首单立减 50 元',
    cta: '立即咨询',
  },
  home_tools_inline: {
    title: '集运线路推广',
    description: '欧美专线，时效稳定，价格透明',
    cta: '查看详情',
  },
  home_task_chain_inline: {
    title: '留学服务推荐',
    description: '一站式留学申请指导，免费评估',
    cta: '免费评估',
  },
  home_community_sidebar: {
    title: '外贸工具会员',
    description: '解锁高级功能，提升工作效率',
    cta: '升级会员',
  },
  home_before_footer_banner: {
    title: '官方合作推荐',
    description: '资源合作位，欢迎洽谈',
    cta: '联系我们',
  },
  mobile_home_mid_card: {
    title: '资源合作位',
    description: '移动端中部广告位',
    cta: '了解更多',
  },
  mobile_home_before_footer: {
    title: '跨境服务',
    description: '移动端 Footer 前广告位',
    cta: '查看详情',
  },
};

export default function JueshiV4AdSlot({
  slotKey,
  variant = 'banner',
  title,
  description,
  cta,
  className = '',
}: AdSlotProps) {
  const adData = mockAds[slotKey] || {
    title: title || '广告位',
    description: description || '广告内容占位',
    cta: cta || '了解更多',
  };

  const variantStyles = {
    banner: 'w-full p-6 md:p-8',
    card: 'w-full p-5',
    inline: 'w-full p-4 md:p-5',
    mobile: 'w-full p-4',
    footer: 'w-full p-6 md:p-10',
  };

  return (
    <div
      className={`relative bg-gradient-to-r from-[#F8F9FC] to-[#F3F5FA] border border-[#E8ECF3] rounded-xl ${variantStyles[variant]} ${className}`}
      data-ad-slot={slotKey}
    >
      {/* 广告标识 */}
      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/80 backdrop-blur-sm border border-[#E8ECF3] rounded-md">
        <Megaphone className="w-3 h-3 text-[#808191]" />
        <span className="text-[10px] font-medium text-[#808191]">广告</span>
      </div>

      {/* 广告内容 */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1">
          <h3 className="text-base md:text-lg font-bold text-[#11142D] mb-2">
            {adData.title}
          </h3>
          <p className="text-sm text-[#808191] mb-3">{adData.description}</p>
        </div>
        <button className="px-5 py-2.5 bg-[#6C5DD3] text-white rounded-lg text-sm font-medium hover:bg-[#5A4FBF] transition-colors whitespace-nowrap">
          {adData.cta}
        </button>
      </div>

      {/* UI Lab 提示（仅开发环境） */}
      <div className="absolute bottom-2 right-3 text-[9px] text-[#808191]/60">
        slotKey: {slotKey}
      </div>
    </div>
  );
}
