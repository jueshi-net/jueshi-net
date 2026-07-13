'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Target, Crown, FileText, Building2, Heart, Settings, Bell, StickyNote, Package,
  Gift, Megaphone, GitBranch, Star, Zap, Calendar, TrendingUp,
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

const levelLabels: Record<string, string> = {
  lv1: 'Lv.1 新手',
  lv2: 'Lv.2 进阶',
  lv3: 'Lv.3 精英',
  lv4: 'Lv.4 大师',
  lv5: 'Lv.5 传奇',
};

interface UserAssetData {
  displayName: string;
  email: string;
  levelLabel: string;
  points: number;
  growthValue: number;
  checkinStreak: number;
  isMember: boolean;
}

export function UserNavSidebar({ className, userAsset }: { className?: string; userAsset?: UserAssetData }) {
  const { workspaceTitle } = useUserPreferences();
  const pathname = usePathname();
  const theme = getTheme();

  // Use props if provided, otherwise fallback defaults
  const displayName = userAsset?.displayName || '用户';
  const email = userAsset?.email || '';
  const levelLabel = userAsset?.levelLabel || 'Lv.1 新手';
  const points = userAsset?.points ?? 0;
  const growthValue = userAsset?.growthValue ?? 0;
  const checkinStreak = userAsset?.checkinStreak ?? 0;
  const isMember = userAsset?.isMember ?? false;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`${className ?? 'hidden lg:flex'} flex-col w-60 bg-white border-r border-gray-100/80 h-full flex-shrink-0`}>
        {/* Brand Logo */}
        <div className="h-14 flex items-center px-5 border-b border-gray-100/80">
          <Link href="/" className="flex items-center gap-2.5">
            <img 
              src="/images/brand/jueshi-logo-crab.jpg" 
              alt="绝世百宝箱" 
              className="h-10 w-auto object-contain"
              width={97}
              height={40}
            />
          </Link>
        </div>

        {/* User Asset Card */}
        <div className="p-4 border-b border-gray-100/80">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] flex items-center justify-center text-white font-semibold text-base shadow-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#11142D] truncate">{displayName}</p>
              <p className="text-xs text-[#808191] truncate">{email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs mb-2">
            <div className="flex items-center gap-1.5 bg-[#6C5DD3]/10 text-[#6C5DD3] rounded-md px-2.5 py-1.5">
              <Star className="w-3.5 h-3.5" />
              <span className="font-medium text-xs">{levelLabel}</span>
            </div>
            {isMember && (
              <div className="flex items-center gap-1.5 bg-[#FF754C]/10 text-[#FF754C] rounded-md px-2.5 py-1.5">
                <Crown className="w-3.5 h-3.5" />
                <span className="font-medium text-xs">会员</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1 text-center">
            <div className="bg-[#F6F8FC] rounded-md py-1.5 px-1">
              <p className="text-[13px] font-bold text-[#11142D]">{points}</p>
              <p className="text-[10px] text-[#808191]">积分</p>
            </div>
            <div className="bg-[#F6F8FC] rounded-md py-1.5 px-1">
              <p className="text-[13px] font-bold text-[#11142D]">{growthValue}</p>
              <p className="text-[10px] text-[#808191]">成长值</p>
            </div>
            <div className="bg-[#F6F8FC] rounded-md py-1.5 px-1">
              <p className="text-[13px] font-bold text-[#11142D]">{checkinStreak}</p>
              <p className="text-[10px] text-[#808191]">连续签到</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 flex-1 overflow-y-auto p-4">
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

        <div className="mt-auto pt-4 border-t border-gray-100 px-4">
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
