'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Wrench, CheckSquare, Search, UserCircle } from 'lucide-react';

interface BottomTabProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: '首页', icon: Home, href: '/' },
  { id: 'tools', label: '工具', icon: Wrench, href: '/tools' },
  { id: 'checklist', label: '清单', icon: CheckSquare, href: '/checklists' },
  { id: 'search', label: '搜索', icon: Search, href: '/search' },
  { id: 'profile', label: '我的', icon: UserCircle, href: '/workspace' },
];

export default function JueshiV4HomeCandidateBottomTab({ activeTab, onTabChange }: BottomTabProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8ECF3] lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
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
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
