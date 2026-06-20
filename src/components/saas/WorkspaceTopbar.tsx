'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { Search, Bell, Menu } from 'lucide-react';

interface WorkspaceTopbarProps {
  /** 左侧搜索框 */
  searchable?: boolean;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;

  /** 右侧操作区 */
  actions?: ReactNode;

  /** 通知相关 */
  notificationCount?: number;
  onNotificationClick?: () => void;

  /** 移动端菜单按钮 */
  onMenuClick?: () => void;
  showMenuButton?: boolean;

  /** 用户头像/信息 */
  userAvatar?: ReactNode;
  userName?: string;

  className?: string;
}

/**
 * WorkspaceTopbar — SaaS 工作区顶部工具栏
 *
 * 包含搜索、通知、用户信息、操作按钮等。
 * 支持移动端响应式菜单按钮。
 */
export function WorkspaceTopbar({
  searchable = true,
  onSearch,
  searchPlaceholder = '搜索...',
  actions,
  notificationCount = 0,
  onNotificationClick,
  onMenuClick,
  showMenuButton = false,
  userAvatar,
  userName,
  className,
}: WorkspaceTopbarProps) {
  return (
    <header
      className={cn(
        'flex items-center gap-3 h-14 px-4 bg-white border-b border-gray-200 flex-shrink-0',
        className
      )}
    >
      {/* Mobile menu button */}
      {showMenuButton && (
        <button
          onClick={onMenuClick}
          className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
        >
          <Menu className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {/* Search */}
      {searchable && (
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-colors placeholder:text-gray-400"
          />
        </div>
      )}

      {/* Spacer when no search */}
      {!searchable && <div className="flex-1" />}

      {/* Actions */}
      {actions && (
        <div className="flex items-center gap-2">{actions}</div>
      )}

      {/* Notifications */}
      {onNotificationClick && (
        <button
          onClick={onNotificationClick}
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="通知"
        >
          <Bell className="w-4 h-4 text-gray-600" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>
      )}

      {/* User */}
      {(userAvatar || userName) && (
        <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
          {userAvatar && (
            <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {userAvatar}
            </div>
          )}
          {userName && (
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {userName}
            </span>
          )}
        </div>
      )}
    </header>
  );
}
