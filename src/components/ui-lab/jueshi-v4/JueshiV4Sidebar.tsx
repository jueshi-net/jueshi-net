'use client';

import React from 'react';
import Link from 'next/link';

interface SidebarProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems = [
  { id: 'home', label: '首页总览', icon: '🏠' },
  { id: 'tools', label: '高频工具', icon: '🔧' },
  { id: 'checklist', label: '清单任务', icon: '📋' },
  { id: 'guides', label: '指南专题', icon: '📖' },
  { id: 'resources', label: '资源导航', icon: '🧭' },
  { id: 'workspace', label: '我的工作台', icon: '💼' },
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
      <div className="h-16 flex items-center px-6 border-b border-[#E8ECF3]">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🦀</span>
          <span className="font-bold text-[#11142D] text-lg">绝世百宝箱</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onNavChange(item.id);
              onMobileClose();
            }}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors
              ${activeNav === item.id
                ? 'bg-[#6C5DD3]/10 text-[#6C5DD3]'
                : 'text-[#808191] hover:bg-[#F3F5FA] hover:text-[#11142D]'
              }
            `}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom CTA */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#E8ECF3]">
        <button className="w-full py-3 bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] text-white rounded-xl font-medium hover:shadow-lg transition-shadow">
          今日签到 ✨
        </button>
      </div>
    </aside>
  );
}
