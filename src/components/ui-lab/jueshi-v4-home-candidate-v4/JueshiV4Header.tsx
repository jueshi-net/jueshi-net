'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Bell, Menu, X, Sparkles } from 'lucide-react';
import { DEFAULT_BUTTONS, type NavItemConfig, type ButtonConfig } from './homepageConfig';

interface HeaderProps {
  onMenuClick: () => void;
  menuOpen: boolean;
}

// 图标映射
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Bell,
  Menu,
  X,
};

export default function JueshiV4Header({ onMenuClick, menuOpen }: HeaderProps) {
  const [activeNav, setActiveNav] = useState('home');
  
  // 从配置读取
  const config = DEFAULT_BUTTONS;
  const navItems = config.headerNav.filter(item => item.enabled).sort((a, b) => a.sortOrder - b.sortOrder);
  const searchPlaceholder = config.headerSearchPlaceholder;
  const checkinButton = config.headerCheckinButton;
  const loginButton = config.headerLoginButton;
  const notificationButton = config.headerNotificationButton;
  const brandLogo = config.defaultAssets.brandLogo;

  const coreNavItems = navItems.filter(item => item.priority === 'core');
  const extendedNavItems = navItems.filter(item => item.priority === 'extended');

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E8ECF3] shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[76px]">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-8">
              {/* Real Logo from config */}
              <Link href="/" className="flex items-center flex-shrink-0">
                <Image
                  src={brandLogo}
                  alt="绝世百宝箱"
                  width={160}
                  height={44}
                  className="h-[44px] w-auto object-contain"
                  priority
                />
              </Link>

              {/* Desktop Nav - Core items (always visible on lg) */}
              <nav className="hidden lg:flex items-center gap-1">
                {coreNavItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setActiveNav(item.key)}
                    data-tracking={item.trackingKey}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${activeNav === item.key
                        ? 'text-[#6C5DD3] bg-[#6C5DD3]/8'
                        : 'text-[#808191] hover:text-[#11142D] hover:bg-[#F3F5FA]'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              
              {/* Desktop Nav - Extended items (only on 2xl) */}
              <nav className="hidden 2xl:flex items-center gap-1">
                {extendedNavItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setActiveNav(item.key)}
                    data-tracking={item.trackingKey}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${activeNav === item.key
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
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F3F5FA] border border-transparent rounded-xl text-sm text-[#11142D] placeholder-[#808191] focus:outline-none focus:border-[#6C5DD3]/30 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Checkin */}
              {checkinButton.enabled && (
                <Link
                  href={checkinButton.href}
                  data-tracking={checkinButton.trackingKey}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-[#6C5DD3] hover:bg-[#6C5DD3]/8 rounded-lg transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">{checkinButton.label}</span>
                </Link>
              )}

              {/* Notifications */}
              {notificationButton.enabled && (
                <Link
                  href={notificationButton.href}
                  data-tracking={notificationButton.trackingKey}
                  className="relative p-2.5 text-[#808191] hover:bg-[#F3F5FA] rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF754C] rounded-full"></span>
                </Link>
              )}

              {/* Login */}
              {loginButton.enabled && (
                <Link
                  href={loginButton.href}
                  data-tracking={loginButton.trackingKey}
                  className="hidden sm:flex items-center px-4 py-2 bg-[#6C5DD3] text-white rounded-lg text-sm font-medium hover:bg-[#5A4FBF] transition-colors"
                >
                  {loginButton.label}
                </Link>
              )}

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
        <div className="fixed inset-0 z-40 bg-white lg:hidden pt-[76px]">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={onMenuClick}
                data-tracking={item.trackingKey}
                className={`
                  block px-4 py-3 rounded-xl text-base font-medium transition-colors
                  ${activeNav === item.key
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
