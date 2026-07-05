'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, Wrench, CheckSquare, User } from 'lucide-react';
import { DEFAULT_BUTTONS, type MobileTabConfig } from './homepageConfig';

interface BottomTabProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// 图标映射
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Wrench,
  CheckSquare,
  User,
};

export default function JueshiV4BottomTab({ activeTab, onTabChange }: BottomTabProps) {
  // 从配置读取
  const config = DEFAULT_BUTTONS;
  const tabs = config.mobileTabs.filter(tab => tab.enabled).sort((a, b) => a.sortOrder - b.sortOrder);
  const centerImage = config.defaultAssets.mobileTabCenterImage;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E8ECF3] shadow-lg md:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          
          // 中心品牌按钮
          if (tab.isCenterAction) {
            return (
              <Link
                key={tab.key}
                href={tab.href}
                onClick={() => onTabChange(tab.key)}
                data-tracking={tab.trackingKey}
                className="relative flex flex-col items-center justify-center -mt-6"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                  {tab.imageUrl ? (
                    <Image
                      src={tab.imageUrl}
                      alt={tab.label}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-xl">🦀</span>
                  )}
                </div>
                <span className={`text-[11px] mt-1 font-medium ${isActive ? 'text-[#6C5DD3]' : 'text-[#808191]'}`}>
                  {tab.label}
                </span>
              </Link>
            );
          }

          // 普通 Tab
          const Icon = tab.icon ? iconMap[tab.icon] : Home;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              onClick={() => onTabChange(tab.key)}
              data-tracking={tab.trackingKey}
              className="flex flex-col items-center justify-center flex-1 py-2"
            >
              {Icon && <Icon className={`w-5 h-5 ${isActive ? 'text-[#6C5DD3]' : 'text-[#808191]'}`} />}
              <span className={`text-[11px] mt-1 ${isActive ? 'text-[#6C5DD3] font-medium' : 'text-[#808191]'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
