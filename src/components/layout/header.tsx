"use client";

import Link from "next/link";
import { PackageSearch, User, LogIn, Settings, LayoutDashboard, LogOut, Bell, Search, SlidersHorizontal, Shield, Star, Briefcase, Wrench, LifeBuoy, Globe } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import ThemeToggle from "@/components/theme-toggle";
import NotificationBell from "@/components/notification-bell";

export default function Header() {
  const { data: session, status } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <PackageSearch className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              海外百宝箱 <span className="text-gray-400 font-normal text-sm hidden sm:inline">| 海外华人的常用工具与资源平台</span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden xl:flex items-center gap-5 text-sm text-gray-600 dark:text-gray-300">
            <Link href="/tools" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">工具中心</Link>
            <Link href="/shipping" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">跨境寄送</Link>
            <Link href="/resources" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">生活资源</Link>
            <Link href="/business" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">出海经营</Link>
            <Link href="/nav" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">网址导航</Link>
            <Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">我的工作台</Link>
          </nav>

          {/* Theme Toggle + User */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {status === "authenticated" && <NotificationBell />}
            <div className="relative">
              {status === "authenticated" && session.user ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                    </div>
                    <span className="hidden sm:inline">{session.user.name || "用户"}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                    <Link
                      href="/favorites"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Star className="w-4 h-4 text-amber-500" />
                      我的收藏
                    </Link>
                    <Link
                      href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        我的工作台
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        设置
                      </Link>
                      {(session.user as any)?.role === "admin" && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Shield className="w-4 h-4" />
                          管理后台
                        </Link>
                      )}
                      <hr className="my-1 dark:border-gray-700" />
                      <button
                        onClick={() => { signOut({ callbackUrl: "/" }); setShowUserMenu(false); }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        退出登录
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  登录 / 注册
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
