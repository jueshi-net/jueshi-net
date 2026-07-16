'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, PlusCircle, Target, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/workspace', label: '概览', icon: Home },
  { href: '/workspace/documents', label: '文档', icon: FileText },
  { href: '/tools/documents', label: '新建', icon: PlusCircle, isCenter: true },
  { href: '/workspace/tasks', label: '任务', icon: Target },
  { href: '/workspace/settings', label: '我的', icon: User },
];

export default function WorkspaceMobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/workspace') {
      return pathname === '/workspace';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-14 px-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center -mt-4"
              >
                <div className="w-12 h-12 bg-[#0A1D6B] rounded-full flex items-center justify-center shadow-lg border-[3px] border-white">
                  <PlusCircle className="w-5 h-5 text-white" />
                </div>
                <span className={cn(
                  'text-[10px] mt-0.5 font-medium',
                  active ? 'text-[#0A1D6B]' : 'text-gray-500'
                )}>
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-1.5',
              )}
            >
              <Icon className={cn(
                'w-5 h-5',
                active ? 'text-[#0A1D6B]' : 'text-gray-400'
              )} />
              <span className={cn(
                'text-[10px] mt-0.5',
                active ? 'text-[#0A1D6B] font-medium' : 'text-gray-500'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
