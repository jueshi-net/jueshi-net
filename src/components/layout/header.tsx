"use client";

import Link from "next/link";
import {
  PackageSearch,
  User,
  LogIn,
  Settings,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Shield,
  Wrench,
  Sparkles,
  BookOpen,
  Library,
  Briefcase,
  LifeBuoy,
  Gem,
  ChevronDown,
  Target,
  MessageSquare,
  Bell,
  FileText,
  Search,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/theme-toggle";
import NotificationBell from "@/components/notification-bell";
import { useCommandMenu } from "@/components/command-palette";

/** Search trigger button for header */
function SearchTrigger() {
  const { setOpen } = useCommandMenu();
  return (
    <button
      onClick={() => setOpen(true)}
      className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors min-h-[44px] min-w-[140px] border border-gray-200 dark:border-gray-700 flex-shrink"
    >
      <Search className="w-4 h-4" />
      <span className="flex-1 text-left">搜索…</span>
      <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-[10px] font-mono text-gray-400">
        ⌘K
      </kbd>
    </button>
  );
}

const NAV_LINKS = [
  { href: "/", label: "首页", icon: PackageSearch },
  { href: "/tools", label: "全能工具", icon: Wrench },
  { href: "/tools/documents", label: "单据中心", icon: FileText },
  { href: "/topics", label: "专题库", icon: Target },
  { href: "/resources", label: "网址导航", icon: Library },
  { href: "https://bbs.jueshi.net", label: "社区", icon: MessageSquare, external: true },
];

export default function Header() {
  const { data: session, status } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close menus on route change (listen for popstate)
  useEffect(() => {
    const handlePop = () => {
      setShowUserMenu(false);
      setMobileMenuOpen(false);
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <PackageSearch className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-bold text-gray-900 dark:text-white">海外百宝箱</span>
              <span className="text-[11px] text-gray-400 ml-1.5">工具 · AI · 资源</span>
            </div>
          </Link>

          {/* Center: Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 flex-shrink-0">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const LinkComp = link.external ? "a" : Link;
              return (
                <LinkComp
                  key={link.href}
                  href={link.href}
                  {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[44px] whitespace-nowrap flex-shrink-0"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">{link.label}</span>
                </LinkComp>
              );
            })}
          </nav>

          {/* Right: Search + Theme + User / Login */}
          <div className="flex items-center gap-2">
            {/* Search trigger */}
            <SearchTrigger />
            <ThemeToggle />
            {status === "authenticated" && <NotificationBell />}

            {/* Desktop: User or Login */}
            <div className="hidden lg:block">
              {status === "authenticated" && session.user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px]"
                  >
                    <div className="w-7 h-7 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-teal-600 dark:text-teal-300" />
                    </div>
                    <span className="hidden lg:inline max-w-20 truncate">{session.user.name || "用户"}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50">
                        <Link
                          href="/workspace"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 min-h-[44px]"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          我的工作台
                        </Link>
                        <Link
                          href="/workspace"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 min-h-[44px]"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Target className="w-4 h-4 text-teal-500" />
                          成长任务
                        </Link>
                        <Link
                          href="/workspace"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 min-h-[44px]"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Bell className="w-4 h-4 text-amber-500" />
                          通知中心
                        </Link>
                        <Link
                          href="/favorites"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 min-h-[44px]"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          我的收藏
                        </Link>
                        <Link
                          href="/workspace"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 min-h-[44px]"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FileText className="w-4 h-4 text-blue-500" />
                          我的单据
                        </Link>
                        <Link
                          href="/workspace"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 min-h-[44px]"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Gem className="w-4 h-4 text-amber-500" />
                          积分与会员
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 min-h-[44px]"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="w-4 h-4" />
                          设置
                        </Link>
                        {["管理员", "admin"].includes((session.user as any)?.role) && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 min-h-[44px]"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Shield className="w-4 h-4" />
                            管理后台
                          </Link>
                        )}
                        <hr className="my-1 dark:border-gray-700" />
                        <button
                          onClick={() => { signOut({ callbackUrl: "/" }); setShowUserMenu(false); }}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left min-h-[44px]"
                        >
                          <LogOut className="w-4 h-4" />
                          退出登录
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors min-h-[44px] font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  登录
                </Link>
              )}
            </div>

            {/* Mobile: Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="菜单"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay + Panel */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className="fixed top-0 right-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl z-50 lg:hidden"
          >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <PackageSearch className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">菜单</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-57px)] py-4">
          {/* Main Nav Links */}
          <div className="px-4 mb-6">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">导航</div>
            <div className="space-y-0.5">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const LinkComp = link.external ? "a" : Link;
                return (
                  <LinkComp
                    key={link.href}
                    href={link.href}
                    {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[44px]"
                  >
                    <Icon className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">{link.label}</span>
                  </LinkComp>
                );
              })}
            </div>
          </div>

          {/* Community Forum */}
          <div className="px-4 mb-6">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">论坛</div>
            <div className="space-y-0.5">
              <a
                href="https://bbs.jueshi.net"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[44px]"
              >
                <MessageSquare className="w-5 h-5 text-violet-400" />
                <span className="font-medium">论坛</span>
              </a>
            </div>
          </div>

          {/* Tools Quick Links */}
          <div className="px-4 mb-6">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">常用工具</div>
            <div className="space-y-0.5">
              {[
                { href: "/tools/postal-code", label: "邮编查询" },
                { href: "/tools/documents", label: "单据中心" },
                { href: "/tools/documents/shipping-label", label: "唛头标签" },
                { href: "/ai-tools/translate-polish", label: "AI 翻译润色" },
                { href: "/ai-tools/document-summary", label: "AI 文件摘要" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[44px]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* User Actions */}
          <div className="px-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {status === "authenticated" ? "我的" : "账户"}
            </div>
            <div className="space-y-0.5">
              {status === "authenticated" ? (
                <>
                  <Link
                    href="/workspace"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[44px]"
                  >
                    <LayoutDashboard className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">我的工作台</span>
                  </Link>
                  <Link
                    href="/workspace"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[44px]"
                  >
                    <Target className="w-5 h-5 text-teal-400" />
                    <span className="font-medium">成长任务</span>
                  </Link>
                  <Link
                    href="/workspace"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[44px]"
                  >
                    <Bell className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">通知中心</span>
                  </Link>
                  <Link
                    href="/workspace"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[44px]"
                  >
                    <Gem className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">积分与会员</span>
                  </Link>
                  <Link
                    href="/favorites"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[44px]"
                  >
                    <Sparkles className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">我的收藏</span>
                  </Link>
                  <Link
                    href="/workspace"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[44px]"
                  >
                    <FileText className="w-5 h-5 text-blue-400" />
                    <span className="font-medium">我的单据</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[44px]"
                  >
                    <Settings className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">设置</span>
                  </Link>
                  {["管理员", "admin"].includes((session?.user as any)?.role) && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors min-h-[44px]"
                    >
                      <Shield className="w-5 h-5" />
                      <span className="font-medium">管理后台</span>
                    </Link>
                  )}
                  <hr className="my-2 dark:border-gray-700" />
                  <button
                    onClick={() => { signOut({ callbackUrl: "/" }); setMobileMenuOpen(false); }}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left min-h-[44px]"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">退出登录</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors min-h-[48px]"
                >
                  <LogIn className="w-5 h-5" />
                  登录 / 注册
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </header>
  );
}
