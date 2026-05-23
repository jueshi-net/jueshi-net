'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, CheckSquare, Crown, FileText, Settings,
  ArrowLeft,
} from 'lucide-react';

const USER_NAV = [
  { href: '/workbench', label: '我的工作台', icon: Home, emoji: '🏠' },
  { href: '/dashboard/tasks', label: '待办与任务', icon: CheckSquare, emoji: '✅' },
  { href: '/dashboard', label: '会员与权益', icon: Crown, emoji: '👑' },
  { href: '/dashboard/documents', label: '我的单据', icon: FileText, emoji: '📦' },
  { href: '/settings', label: '账号设置', icon: Settings, emoji: '⚙️' },
];

export function UserNavSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-100/80 min-h-[calc(100vh-3.5rem)] p-4 flex-shrink-0">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> 返回首页
        </Link>

        <nav className="space-y-1 flex-1">
          {USER_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 font-semibold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-teal-600' : 'text-gray-400'}`} />
                <span>{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-gray-100">
          <p className="text-[10px] text-gray-300 text-center">海外百宝箱 v1.29.0</p>
        </div>
      </aside>

      {/* Mobile Sticky Tabs */}
      <MobileStickyTabs />
    </>
  );
}

function MobileStickyTabs() {
  const pathname = usePathname();

  return (
      <div className="lg:hidden">
      <div className="sticky top-12 z-20 bg-white/90 backdrop-blur-xl border-b border-gray-100/80">
        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 py-2 gap-1.5">
          {USER_NAV.map((item) => {
            const ItemIcon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`snap-start flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all min-w-fit ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <ItemIcon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function UserNavBreadcrumb() {
  const pathname = usePathname();
  const active = USER_NAV.find(n => n.href === pathname);

  if (!active) return null;
  const Icon = active.icon;

  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4 text-teal-600" />
      <h1 className="text-base font-bold text-gray-900 tracking-tight">{active.label}</h1>
    </div>
  );
}
