'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, Menu, X, Sparkles } from 'lucide-react';

interface TopNavHeaderProps {
  onMenuClick: () => void;
  menuOpen: boolean;
}

const navItems = [
  { id: 'home', label: '首页', href: '/' },
  { id: 'tools', label: '工具', href: '/tools' },
  { id: 'checklist', label: '清单', href: '/checklists' },
  { id: 'guides', label: '指南', href: '/guides' },
  { id: 'topics', label: '专题', href: '/topics' },
  { id: 'resources', label: '资源', href: '/resources' },
  { id: 'community', label: '社区', href: '/community' },
];

export default function JueshiV4TopNavHeader({ onMenuClick, menuOpen }: TopNavHeaderProps) {
  const [activeNav, setActiveNav] = useState('home');

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-[#E8ECF3]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
                <div className="w-9 h-9 bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] rounded-lg flex items-center justify-center">
                  <span className="text-white text-base font-bold">绝</span>
                </div>
                <span className="font-semibold text-[#11142D] text-lg hidden sm:block">绝世百宝箱</span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setActiveNav(item.id)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${activeNav === item.id
                        ? 'text-[#6C5DD3] bg-[#6C5DD3]/8'
                        : 'text-[#808191] hover:text-[#11142D] hover:bg-[#F3F5FA]'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Center: Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808191]" />
                <input
                  type="text"
                  placeholder="搜索工具、指南、资源、国家、城市..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F3F5FA] border border-transparent rounded-xl text-sm text-[#11142D] placeholder-[#808191] focus:outline-none focus:border-[#6C5DD3]/30 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Checkin */}
              <button className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-[#6C5DD3] hover:bg-[#6C5DD3]/8 rounded-lg transition-colors">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">签到</span>
              </button>

              {/* Notifications */}
              <button className="relative p-2.5 text-[#808191] hover:bg-[#F3F5FA] rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF754C] rounded-full"></span>
              </button>

              {/* Login */}
              <Link
                href="/login"
                className="hidden sm:flex items-center px-4 py-2 bg-[#6C5DD3] text-white rounded-lg text-sm font-medium hover:bg-[#5A4FBF] transition-colors"
              >
                登录
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 text-[#808191] hover:bg-[#F3F5FA] rounded-lg transition-colors"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white lg:hidden pt-[72px]">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={onMenuClick}
                className={`
                  block px-4 py-3 rounded-xl text-base font-medium transition-colors
                  ${activeNav === item.id
                    ? 'text-[#6C5DD3] bg-[#6C5DD3]/8'
                    : 'text-[#11142D] hover:bg-[#F3F5FA]'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
