'use client';

import React from 'react';
import { Home, Wrench, CheckSquare, Search, UserCircle } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'tools', label: '工具', icon: Wrench },
  { id: 'checklist', label: '清单', icon: CheckSquare },
  { id: 'search', label: '搜索', icon: Search },
  { id: 'profile', label: '我的', icon: UserCircle },
];

export default function JueshiV4TopNavBottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E8ECF3] md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors
                ${isActive ? 'text-[#6C5DD3]' : 'text-[#808191]'}
              `}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.8} />
              <span className={`text-xs ${isActive ? 'font-medium' : 'font-normal'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
