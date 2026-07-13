'use client';

import { ArrowLeft, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackClick}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col h-full pt-12">
                  <nav className="flex-1 px-2 py-4">
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
              </SheetContent>
            </Sheet>
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
    </header>
  );
}