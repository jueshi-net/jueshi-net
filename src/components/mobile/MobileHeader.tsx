'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  showBackButton?: boolean;
  onBackClick?: () => void;
  children?: React.ReactNode;
}

export default function MobileHeader({
  showBackButton = false,
  onBackClick,
  children
}: MobileHeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 关闭菜单当路由变化时
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // 锁定 body 滚动当菜单打开时
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        'lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-50 h-14',
        scrolled ? 'border-gray-200' : 'border-transparent',
        'transition-colors duration-200'
      )}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center space-x-2">
          {showBackButton ? (
            <button
              onClick={onBackClick}
              className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
              aria-label="打开菜单"
            >
              {menuOpen ? <Menu className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
          <Link href="/" className="text-xl font-bold text-gray-900">
            觉世
          </Link>
        </div>

        <div className="flex items-center">
          {children}
        </div>
      </div>

      {/* 移动端菜单 */}
      {menuOpen && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
          
          {/* 菜单面板 */}
          <div className="fixed top-14 left-0 right-0 bg-white border-b border-gray-200 z-50 lg:hidden shadow-lg">
            <nav className="flex flex-col px-2 py-4">
              <Link
                href="/"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/'
                    ? 'bg-teal-100 text-teal-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                首页
              </Link>
              <Link
                href="/tools"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium mt-1 ${
                  pathname.startsWith('/tools')
                    ? 'bg-teal-100 text-teal-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                工具
              </Link>
              <Link
                href="/workspace"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium mt-1 ${
                  pathname.startsWith('/workspace')
                    ? 'bg-teal-100 text-teal-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                工作台
              </Link>
              <Link
                href="/bbs"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium mt-1 ${
                  pathname.startsWith('/bbs')
                    ? 'bg-teal-100 text-teal-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                社区
              </Link>
              <Link
                href="/workspace/member"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium mt-1 ${
                  pathname.startsWith('/workspace/member')
                    ? 'bg-teal-100 text-teal-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                我的
              </Link>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
