'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, Wrench, CheckSquare, UserCircle } from 'lucide-react';

interface BottomTabProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: '首页', icon: Home, href: '/' },
  { id: 'tools', label: '工具', icon: Wrench, href: '/tools' },
  { id: 'brand', label: '百宝箱', href: '/', isBrand: true },
  { id: 'checklist', label: '清单', icon: CheckSquare, href: '/checklists' },
  { id: 'profile', label: '我的', icon: UserCircle, href: '/workspace' },
];

export default function JueshiV4HomeCandidateV2BottomTab({ activeTab, onTabChange }: BottomTabProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8ECF3] lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16 relative">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          // Brand center button
          if (tab.isBrand) {
            return (
              <Link
                key={tab.id}
                href={tab.href}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center justify-center -mt-6"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] flex items-center justify-center shadow-lg shadow-[#6C5DD3]/30 border-4 border-white">
                  <Image
                    src="/images/brand/jueshi-logo-crab.jpg"
                    alt="绝世百宝箱"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </div>
                <span className="text-[11px] font-medium text-[#6C5DD3] mt-0.5">
                  {tab.label}
                </span>
              </Link>
            );
          }

          const Icon = tab.icon!;
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
