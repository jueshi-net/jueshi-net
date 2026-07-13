'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Bell, Menu, Plus, ChevronRight } from 'lucide-react';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function JueshiV4Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-[#E8ECF3]">
      <div className="flex items-center h-14 px-4 md:px-6 gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-[#808191] hover:bg-[#F3F5FA] rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb - desktop only */}
        <div className="hidden lg:flex items-center gap-1.5 text-sm">
          <span className="text-[#808191]">UI V4</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#808191]" />
          <span className="text-[#11142D] font-medium">首页总览</span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808191]" />
            <input
              type="text"
              placeholder="搜索工具、指南、资源、国家、城市..."
              className="w-full pl-9 pr-4 py-2 bg-[#F3F5FA] border border-transparent rounded-xl text-sm text-[#11142D] placeholder-[#808191] focus:outline-none focus:border-[#6C5DD3]/30 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Quick add */}
          <button className="hidden sm:flex p-2 text-[#808191] hover:bg-[#F3F5FA] rounded-lg transition-colors">
            <Plus className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-[#808191] hover:bg-[#F3F5FA] rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF754C] rounded-full"></span>
          </button>

          {/* Login */}
          <Link
            href="/login"
            className="hidden sm:flex items-center px-3.5 py-1.5 bg-[#6C5DD3] text-white rounded-lg text-sm font-medium hover:bg-[#5A4FBF] transition-colors"
          >
            登录
          </Link>
        </div>
      </div>
    </header>
  );
}
