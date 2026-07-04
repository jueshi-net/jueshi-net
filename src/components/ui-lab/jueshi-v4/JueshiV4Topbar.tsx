'use client';

import React from 'react';
import Link from 'next/link';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function JueshiV4Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E8ECF3]">
      <div className="flex items-center h-16 px-6 gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-[#808191] hover:bg-[#F3F5FA] rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#808191]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="搜索工具、指南、资源..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F3F5FA] border border-transparent rounded-xl text-[#11142D] placeholder-[#808191] focus:outline-none focus:border-[#6C5DD3] focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button className="relative p-2.5 text-[#808191] hover:bg-[#F3F5FA] rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF754C] rounded-full"></span>
          </button>

          {/* Login */}
          <Link
            href="/login"
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#6C5DD3] text-white rounded-xl font-medium hover:bg-[#5A4FBF] transition-colors"
          >
            登录
          </Link>
        </div>
      </div>
    </header>
  );
}
