"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  PackageSearch, Menu, X, Search, LogIn, Bell,
  Home, Wrench, FileText, Users, BookOpen, Crown, User, LogOut, LayoutDashboard, ShieldCheck,
  ListChecks, ChevronDown, Sparkles, Mail, Hash, DollarSign, MapPin
} from "lucide-react";

const TOOL_CATEGORIES = [
  { href: "/tools", label: "全部工具", icon: Wrench, desc: "浏览所有工具" },
  { href: "/tools?cat=documents", label: "外贸单据", icon: FileText, desc: "发票/报价/合同" },
  { href: "/tools?cat=logistics", label: "物流工具", icon: PackageSearch, desc: "运费/唛头/追踪" },
  { href: "/tools?cat=general", label: "编码查询", icon: Hash, desc: "邮编/HS编码" },
  { href: "/tools?cat=exchange", label: "汇率金融", icon: DollarSign, desc: "汇率换算" },
  { href: "/tools?cat=ai-content", label: "AI 内容", icon: Sparkles, desc: "文案/翻译/摘要" },
];

const NAV_LINKS = [
  { href: "/", label: "首页", icon: Home },
  { href: "/tools/documents", label: "单据", icon: FileText },
  { href: "/tools/hs-code", label: "HS编码", icon: FileText },
  { href: "/tools/exchange-rate", label: "汇率", icon: DollarSign },
  { href: "/tools/postal-code", label: "邮编", icon: MapPin },
  { href: "/guides", label: "百科指南", icon: BookOpen },
  { href: "/resources", label: "网址导航", icon: BookOpen },
  { href: "/checklists", label: "清单", icon: ListChecks },
  { href: "/topics", label: "专题", icon: BookOpen },
  { href: "/bbs", label: "社区", icon: Users },
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
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [branding, setBranding] = useState({
    logoUrl: "/brand/jueshi-logo-header.png",
    logoAlt: "绝世百宝箱 jueshi.net",
    logoWidth: 97,
    logoHeight: 40,
  });
  const userMenuRef = useRef<HTMLDivElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  // 读取品牌配置
  useEffect(() => {
    fetch("/api/branding")
      .then(res => res.json())
      .then(setBranding)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const closeOnResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node))
        setToolsMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Body scroll lock and Escape key for mobile menu
  useEffect(() => {
    if (mobileOpen) {
      // Lock body scroll
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      
      // Handle Escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMobileOpen(false);
        }
      };
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        // Restore body scroll
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
        
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [mobileOpen]);

  const handleSearch = useCallback(() => {
    const q = searchQuery.trim();
    if (!q) return;
    window.location.href = `/tools?q=${encodeURIComponent(q)}`;
  }, [searchQuery]);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  }, [handleSearch]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label={branding.logoAlt}>
            {/* Logo image container */}
            <img
              src={branding.logoUrl}
              alt={branding.logoAlt}
              className="h-10 w-auto object-contain hidden sm:block"
              width={branding.logoWidth}
              height={branding.logoHeight}
            />
            {/* Mobile fallback: icon + short text */}
            <div className="flex items-center gap-1.5 sm:hidden">
              <img
                src={branding.logoUrl}
                alt={branding.logoAlt}
                className="h-8 w-auto object-contain"
                width={78}
                height={32}
              />
            </div>
          </Link>

          {/* Center: Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-sm text-slate-700 hover:text-teal-600 transition-colors rounded-lg whitespace-nowrap"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            
            {/* Tools Dropdown */}
            <div ref={toolsMenuRef} className="relative">
              <button 
                onClick={() => setToolsMenuOpen(!toolsMenuOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-sm text-slate-700 hover:text-teal-600 transition-colors rounded-lg"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>工具</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${toolsMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {toolsMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 p-2">
                  {TOOL_CATEGORIES.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      onClick={() => setToolsMenuOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-teal-50 transition-colors"
                    >
                      <tool.icon className="w-4 h-4 text-teal-600 shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-gray-800">{tool.label}</div>
                        <div className="text-[10px] text-slate-600">{tool.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right: Search + Bell + Login */}
          <div className="flex items-center gap-2">
            {/* Search bar */}
            <div className="hidden md:flex items-center relative">
              <Search className="absolute left-3 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="搜索工具…"
                className="pl-9 pr-14 h-9 w-32 lg:w-44 bg-gray-100 rounded-lg text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all placeholder:text-slate-500"
              />
              <button
                onClick={handleSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 bg-teal-600 text-white text-[10px] font-medium rounded hover:bg-teal-700 transition-colors min-h-[24px]"
              >
                搜索
              </button>
            </div>

            {/* Notification bell */}
            {isLoggedIn ? (
              <Link
                href="/workspace/notifications"
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="通知"
              >
                <Bell className="w-4 h-4 text-slate-700" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Link>
            ) : (
              <Link
                href="/login?callbackUrl=/workspace/notifications"
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="通知（需登录）"
              >
                <Bell className="w-4 h-4 text-slate-700" />
              </Link>
            )}

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
                      <p className="text-sm font-semibold text-slate-900 truncate">{userEmail}</p>
                      <p className="text-xs text-slate-600">{isAdmin ? '管理员' : '注册用户'}</p>
                    </div>
                    <Link href="/workbench" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <LayoutDashboard className="w-4 h-4" /> 工作台
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <ShieldCheck className="w-4 h-4" /> 管理后台
                      </Link>
                    )}
                    <button onClick={async () => { await signOut({ redirect: false }); window.location.href = '/'; }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="w-4 h-4" /> 退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors min-h-[36px] shrink-0 whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" /> <span className="hidden sm:inline">登录 / 免费注册</span><span className="sm:hidden">登录</span>
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

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-[60] lg:hidden transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          
          {/* Drawer panel */}
          <div className="fixed top-0 right-0 h-dvh w-[86vw] max-w-[360px] bg-white shadow-2xl z-[70] lg:hidden flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
              <span className="font-bold text-slate-900 text-lg">菜单</span>
              <button 
                onClick={() => setMobileOpen(false)} 
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="关闭菜单"
              >
                <X className="w-5 h-5 text-slate-700" />
              </button>
            </div>
            
            {/* Drawer content - scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="py-4">
                {/* Navigation links */}
                <div className="px-4 space-y-1 mb-4">
                  {NAV_LINKS.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link 
                        key={link.href} 
                        href={link.href} 
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-900 hover:bg-gray-50 transition-colors min-h-[48px]"
                      >
                        <Icon className="w-5 h-5 text-slate-600 shrink-0" />
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
                
                {/* Tool categories accordion */}
                <div className="px-4 mb-4">
                  <details className="group">
                    <summary className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-900 hover:bg-gray-50 transition-colors min-h-[48px] cursor-pointer list-none">
                      <Wrench className="w-5 h-5 text-slate-600 shrink-0" />
                      <span className="font-medium">工具分类</span>
                      <ChevronDown className="w-4 h-4 ml-auto text-slate-500 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="pl-11 pr-2 pb-2 pt-1 space-y-0.5">
                      {TOOL_CATEGORIES.map((tool) => (
                        <Link 
                          key={tool.href} 
                          href={tool.href} 
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px] text-sm"
                        >
                          <tool.icon className="w-4 h-4 text-slate-500 shrink-0" />
                          <span>{tool.label}</span>
                        </Link>
                      ))}
                    </div>
                  </details>
                </div>

                {/* Search */}
                <div className="px-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-slate-500 shrink-0" />
                    <input
                      type="text"
                      placeholder="搜索工具…"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      className="flex-1 bg-gray-100 rounded-lg text-sm px-3 py-2.5 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all placeholder:text-slate-500 min-h-[44px]"
                    />
                    <button
                      onClick={() => { handleSearch(); setMobileOpen(false); }}
                      className="px-4 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors min-h-[44px] shrink-0"
                    >
                      搜索
                    </button>
                  </div>
                </div>

                <hr className="my-4 border-gray-200 mx-4" />

                {/* User section */}
                {isLoggedIn ? (
                  <div className="px-4 space-y-1">
                    <div className="px-3 py-3 border-b border-gray-100 mb-2">
                      <p className="text-sm font-semibold text-slate-900 truncate">{userEmail}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{isAdmin ? '管理员' : '注册用户'}</p>
                    </div>
                    <Link 
                      href="/workbench" 
                      onClick={() => setMobileOpen(false)} 
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-900 hover:bg-gray-50 transition-colors min-h-[48px]"
                    >
                      <LayoutDashboard className="w-5 h-5 text-slate-600 shrink-0" /> 
                      <span className="font-medium">工作台</span>
                    </Link>
                    <Link 
                      href="/workspace/notifications" 
                      onClick={() => setMobileOpen(false)} 
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-900 hover:bg-gray-50 transition-colors min-h-[48px]"
                    >
                      <Bell className="w-5 h-5 text-slate-600 shrink-0" /> 
                      <span className="font-medium">通知中心</span>
                    </Link>
                    {isAdmin && (
                      <Link 
                        href="/admin" 
                        onClick={() => setMobileOpen(false)} 
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-900 hover:bg-gray-50 transition-colors min-h-[48px]"
                      >
                        <ShieldCheck className="w-5 h-5 text-slate-600 shrink-0" /> 
                        <span className="font-medium">管理后台</span>
                      </Link>
                    )}
                    <button 
                      onClick={async () => { await signOut({ redirect: false }); window.location.href = '/'; }} 
                      className="flex w-full items-center gap-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors min-h-[48px]"
                    >
                      <LogOut className="w-5 h-5 shrink-0" /> 
                      <span className="font-medium">退出登录</span>
                    </button>
                  </div>
                ) : (
                  <div className="px-4">
                    <Link 
                      href="/login" 
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-lg font-medium min-h-[48px] hover:bg-teal-700 transition-colors"
                    >
                      <LogIn className="w-5 h-5" /> 
                      <span>登录 / 免费注册</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
