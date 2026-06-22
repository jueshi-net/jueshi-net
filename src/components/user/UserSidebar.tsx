'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Target, Crown, FileText, Building2, Heart, Settings, Bell, StickyNote, Package,
  ArrowLeft, Gift, Megaphone, GitBranch,
} from 'lucide-react';
import { useUserPreferences, getTheme } from './UserPreferencesContext';

const NAV_ITEMS = [
  { href: '/workspace', labelKey: 'workbench', icon: Home, emoji: '🏠' },
  { href: '/workspace/task-chains', labelKey: 'task-chains', icon: GitBranch, emoji: '🔗' },
  { href: '/workspace/tasks', labelKey: 'tasks', icon: Target, emoji: '✅' },
  { href: '/workspace/notifications', labelKey: 'notifications', icon: Bell, emoji: '🔔' },
  { href: '/workspace/memos', labelKey: 'memos', icon: StickyNote, emoji: '📝' },
  { href: '/workspace/member', labelKey: 'member', icon: Crown, emoji: '👑' },
  { href: '/workspace/member#rewards', labelKey: 'rewards', icon: Gift, emoji: '🎁' },
  { href: '/workspace/invites', labelKey: 'invites', icon: Gift, emoji: '🎁' },
  { href: '/workspace/ad-entitlements', labelKey: 'ad-entitlements', icon: Megaphone, emoji: '📢' },
  { href: '/workspace/documents', labelKey: 'documents', icon: FileText, emoji: '📦' },
  { href: '/workspace/products', labelKey: 'products', icon: Package, emoji: '🏷️' },
  { href: '/workspace/company-profiles', labelKey: 'profiles', icon: Building2, emoji: '🏢' },
  { href: '/workspace/favorites', labelKey: 'favorites', icon: Heart, emoji: '⭐' },
  { href: '/workspace/settings', labelKey: 'settings', icon: Settings, emoji: '⚙️' },
];

const LABELS: Record<string, string> = {
  workbench: '我的工作台',
  'task-chains': '任务链工作台',
  tasks: '签到与任务',
  notifications: '通知',
  memos: '备忘录',
  member: '会员权益',
  rewards: '积分兑换',
  invites: '邀请奖励',
  'ad-entitlements': '广告权益',
  documents: '我的单据',
  products: '商品资料',
  profiles: '公司资料',
  favorites: '我的收藏',
  settings: '账号设置',
};

export function UserNavSidebar({ className }: { className?: string }) {
  const { workspaceTitle } = useUserPreferences();
  const pathname = usePathname();
  const theme = getTheme();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`${className ?? 'hidden lg:flex'} flex-col w-60 bg-white border-r border-gray-100/80 h-full p-4 flex-shrink-0`}>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> 返回首页
        </Link>

        <nav className="space-y-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const label = item.labelKey === 'workbench' ? workspaceTitle : LABELS[item.labelKey];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? `${theme.bg} ${theme.text} font-semibold shadow-sm`
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? theme.text : 'text-gray-400'}`} />
                <span>{label}</span>
                {isActive && <div className={`ml-auto w-1.5 h-1.5 rounded-full ${theme.dot}`} />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-gray-100">
          <p className="text-[10px] text-gray-300 text-center">绝世百宝箱 v1.20.42.6.6</p>
        </div>
      </aside>
    </>
  );
}

/** Mobile sticky tabs — must be rendered INSIDE the main content area, not as a flex sibling */
export function MobileNavTabs() {
  return <MobileStickyTabs />;
}

function MobileStickyTabs() {
  const { workspaceTitle } = useUserPreferences();
  const pathname = usePathname();
  const theme = getTheme();

  return (
    <div className="lg:hidden">
      <div className="sticky top-12 z-20 bg-white/90 backdrop-blur-xl border-b border-gray-100/80">
        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 py-2 gap-1.5">
          {NAV_ITEMS.map((item) => {
            const ItemIcon = item.icon;
            const isActive = pathname === item.href;
            const label = item.labelKey === 'workbench' ? workspaceTitle : LABELS[item.labelKey];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`snap-start flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all min-w-fit ${
                  isActive
                    ? `${theme.bg} ${theme.text} shadow-sm`
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <ItemIcon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function UserNavBreadcrumb() {
  const { workspaceTitle } = useUserPreferences();
  const pathname = usePathname();
  const theme = getTheme();
  const active = NAV_ITEMS.find(n => n.href === pathname);

  if (!active) return null;
  const Icon = active.icon;
  const label = active.labelKey === 'workbench' ? workspaceTitle : LABELS[active.labelKey];

  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className={`w-4 h-4 ${theme.text}`} />
      <h1 className="text-base font-bold text-gray-900 tracking-tight">{label}</h1>
    </div>
  );
}
