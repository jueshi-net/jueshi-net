'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Wrench, ListChecks, BookOpen, Compass, Briefcase, Sparkles } from 'lucide-react';

interface SidebarProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems = [
  { id: 'home', label: '首页总览', icon: Home },
  { id: 'tools', label: '高频工具', icon: Wrench },
  { id: 'checklist', label: '清单任务', icon: ListChecks },
  { id: 'guides', label: '指南专题', icon: BookOpen },
  { id: 'resources', label: '资源导航', icon: Compass },
  { id: 'workspace', label: '我的工作台', icon: Briefcase },
];

export default function JueshiV4Sidebar({ activeNav, onNavChange, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <aside
      className={`
        fixed top-0 left-0 h-full w-60 bg-white border-r border-[#E8ECF3] z-50
        transform transition-transform duration-200
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-[#E8ECF3]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">绝</span>
          </div>
          <span className="font-semibold text-[#11142D] text-base">绝世百宝箱</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavChange(item.id);
                onMobileClose();
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all
                ${isActive
                  ? 'bg-[#6C5DD3]/8 text-[#6C5DD3]'
                  : 'text-[#808191] hover:bg-[#F3F5FA] hover:text-[#11142D]'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#6C5DD3]' : ''}`} strokeWidth={isActive ? 2.2 : 1.8} />
              <span className={`text-sm ${isActive ? 'font-medium' : 'font-normal'}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom CTA */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#E8ECF3] bg-white">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-[#6C5DD3]/20 transition-shadow">
          <Sparkles className="w-4 h-4" />
          今日签到
        </button>
      </div>
    </aside>
  );
}
