'use client';

import Link from 'next/link';
import {
  Home,
  Sparkles,
  Clock,
  Mail,
  Package,
  RefreshCw,
  MapPin,
  Truck,
  FileText,
  Receipt,
  Container,
  ListChecks,
  BookOpen,
  Layers,
  TrendingUp,
  Landmark,
  CreditCard,
  ShoppingBag,
  Globe,
  Coffee,
  GraduationCap,
  Briefcase,
  Heart,
  Award,
  Users,
  Bell,
  Settings,
  Star,
  Calendar,
  Crown,
} from 'lucide-react';
import CheckinButton from '@/components/user/CheckinButton';

interface WorkspaceSidebarProps {
  user: any;
  displayName: string;
  levelLabel: string;
  todayChecked: boolean;
  userId: string;
  points: number;
  growthValue: number;
  checkinStreak: number;
  isMember: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  href: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: '工作台',
    items: [
      { id: 'home', label: '首页总览', icon: Home, href: '/workspace' },
      { id: 'documents', label: '我的单据', icon: FileText, href: '/workspace/documents' },
      { id: 'tasks', label: '任务清单', icon: ListChecks, href: '/workspace/tasks' },
      { id: 'favorites', label: '我的收藏', icon: Heart, href: '/workspace/favorites' },
    ],
  },
  {
    title: '高频工具',
    items: [
      { id: 'postcode', label: '邮编查询', icon: Mail, href: '/tools/postal-code' },
      { id: 'hs-code', label: 'HS 编码', icon: Package, href: '/tools/hs-code' },
      { id: 'currency', label: '汇率换算', icon: RefreshCw, href: '/tools/exchange-rate' },
      { id: 'shipping', label: '运费计算', icon: Truck, href: '/tools/shipping-calculator' },
      { id: 'invoice', label: '商业发票', icon: FileText, href: '/tools/commercial-invoice' },
      { id: 'quote', label: '报价单', icon: Receipt, href: '/tools/quote' },
    ],
  },
  {
    title: '资源',
    items: [
      { id: 'company', label: '公司资料', icon: Briefcase, href: '/workspace/company-profiles' },
      { id: 'products', label: '商品资料', icon: Package, href: '/workspace/products' },
      { id: 'templates', label: '模板设计', icon: Layers, href: '/tools/template-studio' },
    ],
  },
  {
    title: '平台',
    items: [
      { id: 'community', label: '社区', icon: Users, href: '/community' },
      { id: 'notifications', label: '通知', icon: Bell, href: '/workspace/notifications' },
      { id: 'settings', label: '设置', icon: Settings, href: '/workspace/settings' },
    ],
  },
];

export default function WorkspaceSidebar({
  user,
  displayName,
  levelLabel,
  todayChecked,
  userId,
  points,
  growthValue,
  checkinStreak,
  isMember,
}: WorkspaceSidebarProps) {
  return (
    <aside className="h-screen bg-white border-r border-[#E8ECF3] overflow-y-auto">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-[#E8ECF3]">
        <Link href="/" className="flex items-center gap-2.5">
          <img 
            src="/brand/jueshi-logo.png" 
            alt="绝世百宝箱" 
            className="h-8 w-auto"
          />
          <span className="font-semibold text-[#11142D] text-base">绝世百宝箱</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-[#E8ECF3]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] flex items-center justify-center text-white font-semibold text-base shadow-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#11142D] truncate">{displayName}</p>
            <p className="text-xs text-[#808191] truncate">{user?.email}</p>
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
      <nav className="overflow-y-auto h-[calc(100vh-18rem)] py-3 px-3">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-3">
            <div className="px-3 py-1 text-[11px] font-semibold text-[#808191] uppercase tracking-wider">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-[#808191] hover:bg-[#F3F5FA] hover:text-[#11142D]"
                  >
                    <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.8} />
                    <span className="text-[13px] font-normal truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom CTA */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#E8ECF3] bg-white">
        <CheckinButton
          userId={userId}
          lastCheckinDate={user?.lastCheckinDate}
          checkinStreak={user?.checkinStreak || 0}
        />
      </div>
    </aside>
  );
}
