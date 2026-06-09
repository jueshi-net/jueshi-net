"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  PackageSearch, Menu, X, Search, LogIn, Bell,
  Home, Wrench, FileText, Users, BookOpen, Crown, User, LogOut, LayoutDashboard, ShieldCheck,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "首页", icon: Home },
  { href: "/tools", label: "工具中心", icon: Wrench },
  { href: "/tools/documents", label: "单据模板", icon: FileText },
  { href: "/bbs", label: "社区论坛", icon: Users },
  { href: "/topics", label: "专题内容", icon: BookOpen },
  { href: "/pricing", label: "会员中心", icon: Crown },
];

export default function Header() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const userRole = (session?.user as any)?.role;
  const isAdmin = ["管理员", "ADMIN", "admin"].includes(userRole);
  const userEmail = session?.user?.email || "User";
  const userInitial = userEmail.charAt(0).toUpperCase();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-teal-600 rounded-[12px] flex items-center justify-center">
              <PackageSearch className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-gray-900 hidden sm:inline">
              海外百宝箱
            </span>
          </Link>

          {/* Center: Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-teal-600 transition-colors rounded-lg"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Search + Bell + Login */}
          <div className="flex items-center gap-2">
            <button
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-500 hover:bg-gray-200 transition-colors border border-gray-200 w-44"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="flex-1 text-left">搜索工具…</span>
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[10px] font-mono text-gray-500">
                ⌘K
              </kbd>
            </button>

            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-4 h-4 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {isLoggedIn ? (
              <div ref={userMenuRef} className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors min-h-[36px]">
                  <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-teal-700">{userInitial}</span>
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{userEmail}</p>
                      <p className="text-xs text-gray-500">{isAdmin ? '管理员' : '注册用户'}</p>
                    </div>
                    <Link href="/workbench" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <LayoutDashboard className="w-4 h-4" /> 工作台
                    </Link>
                    {isAdmin && (
                      <Link href="/admin/homepage" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <ShieldCheck className="w-4 h-4" /> 管理后台
                      </Link>
                    )}
                    <button onClick={() => { signOut({ callbackUrl: '/' }); setUserMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="w-4 h-4" /> 退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors min-h-[36px]"
              >
                <LogIn className="w-3.5 h-3.5" /> 登录 / 免费注册
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 min-h-[36px] min-w-[36px]"
              aria-label="菜单"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 lg:hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <span className="font-bold text-gray-900">菜单</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 min-h-[40px] min-w-[40px]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto py-4">
              <div className="px-4 space-y-0.5">
                {NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-900 hover:bg-gray-50 min-h-[44px]">
                      <Icon className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
              <hr className="my-4 border-gray-200 mx-4" />
              {isLoggedIn ? (
                <>
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">{userEmail}</p>
                    <p className="text-xs text-gray-500">{isAdmin ? '管理员' : '注册用户'}</p>
                  </div>
                  <Link href="/workbench" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-900 hover:bg-gray-50 min-h-[44px]">
                    <LayoutDashboard className="w-5 h-5 text-gray-500" /> <span className="font-medium">工作台</span>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin/homepage" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-900 hover:bg-gray-50 min-h-[44px]">
                      <ShieldCheck className="w-5 h-5 text-gray-500" /> <span className="font-medium">管理后台</span>
                    </Link>
                  )}
                  <button onClick={() => { signOut({ callbackUrl: '/' }); setMobileOpen(false); }} className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 min-h-[44px]">
                    <LogOut className="w-5 h-5" /> <span className="font-medium">退出登录</span>
                  </button>
                </>
              ) : (
                <div className="px-4">
                  <Link href="/login" onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-lg font-medium min-h-[48px]">
                    <LogIn className="w-5 h-5" /> 登录 / 免费注册
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
