'use client';

import { Home, Wrench, LayoutDashboard, Users, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: '首页', icon: Home },
  { href: '/tools', label: '工具', icon: Wrench },
  { href: '/workspace', label: '工作台', icon: LayoutDashboard },
  { href: '/bbs', label: '社区', icon: Users },
  { href: '/workspace/member', label: '我的', icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  // 检查路径是否匹配，考虑子路径的情况
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div
        className="flex justify-around items-center px-1 py-2"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {NAV_ITEMS.map((item) => {
          const isActiveRoute = isActive(item.href);
          const IconComponent = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center h-14 w-16 rounded-lg transition-colors duration-150',
                'min-h-[44px] min-w-[44px]', // 最小点击区域
                isActiveRoute
                  ? 'text-teal-600'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <IconComponent
                size={24}
                className={isActiveRoute ? 'text-teal-600' : 'text-gray-600'}
              />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}