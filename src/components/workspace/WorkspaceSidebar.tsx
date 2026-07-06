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
} from 'lucide-react';
import CheckinButton from '@/components/user/CheckinButton';

interface WorkspaceSidebarProps {
  user: any;
  displayName: string;
  levelLabel: string;
  todayChecked: boolean;
  userId: string;
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
}: WorkspaceSidebarProps) {
  return (
    <aside className="fixed top-0 left-0 h-full w-60 bg-white border-r border-[#E8ECF3] z-50 hidden lg:block">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-[#E8ECF3]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">绝</span>
          </div>
          <span className="font-semibold text-[#11142D] text-base">绝世百宝箱</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-[#E8ECF3]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] flex items-center justify-center text-white font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#11142D] truncate">{displayName}</p>
            <p className="text-xs text-[#808191] truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-[#6C5DD3]/8 text-[#6C5DD3] rounded px-2 py-1">
            <Star className="w-3 h-3" />
            <span className="font-medium">{levelLabel}</span>
          </div>
          <div className="flex items-center gap-1 bg-[#3F8CFF]/8 text-[#3F8CFF] rounded px-2 py-1">
            <Calendar className="w-3 h-3" />
            <span className="font-medium">{todayChecked ? '已签到' : '未签到'}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="overflow-y-auto h-[calc(100vh-18rem)] py-3 px-3">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-4">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-[#808191] uppercase tracking-wider">
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
                    <Icon className="w-4.5 h-4.5 flex-shrink-0" strokeWidth={1.8} />
                    <span className="text-sm font-normal truncate">{item.label}</span>
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
