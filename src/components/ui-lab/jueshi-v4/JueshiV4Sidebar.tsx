'use client';

import React from 'react';
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
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: '总览',
    items: [
      { id: 'home', label: '首页总览', icon: Home },
      { id: 'today', label: '今日推荐', icon: Sparkles },
      { id: 'recent', label: '最近使用', icon: Clock },
    ],
  },
  {
    title: '高频工具',
    items: [
      { id: 'postcode', label: '邮编查询', icon: Mail },
      { id: 'hs-code', label: 'HS 编码', icon: Package },
      { id: 'currency', label: '汇率换算', icon: RefreshCw },
      { id: 'address', label: '地址格式化', icon: MapPin },
      { id: 'shipping', label: '运费计算', icon: Truck },
      { id: 'invoice', label: '商业发票', icon: FileText },
      { id: 'quote', label: '报价单', icon: Receipt },
      { id: 'container', label: '集装箱尺寸', icon: Container },
    ],
  },
  {
    title: '内容与任务',
    items: [
      { id: 'checklist', label: '清单任务', icon: ListChecks },
      { id: 'guides', label: '指南文章', icon: BookOpen },
      { id: 'topics', label: '专题聚合', icon: Layers },
      { id: 'task-chains', label: '热门任务链', icon: TrendingUp },
    ],
  },
  {
    title: '资源导航',
    items: [
      { id: 'official', label: '官方机构', icon: Landmark },
      { id: 'payment', label: '支付收款', icon: CreditCard },
      { id: 'ecommerce', label: '跨境电商', icon: ShoppingBag },
      { id: 'logistics', label: '物流查询', icon: Truck },
      { id: 'overseas', label: '海外生活', icon: Coffee },
      { id: 'education', label: '留学教育', icon: GraduationCap },
    ],
  },
  {
    title: '用户',
    items: [
      { id: 'workspace', label: '我的工作台', icon: Briefcase },
      { id: 'favorites', label: '我的收藏', icon: Heart },
      { id: 'checkin', label: '签到中心', icon: Award },
      { id: 'badges', label: '等级勋章', icon: Award },
    ],
  },
  {
    title: '平台',
    items: [
      { id: 'community', label: '社区', icon: Users },
      { id: 'notifications', label: '通知', icon: Bell },
      { id: 'settings', label: '设置', icon: Settings },
    ],
  },
];

export default function JueshiV4Sidebar({
  activeNav,
  onNavChange,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  return (
    <aside
      className={`
        fixed top-0 left-0 h-full w-60 bg-white border-r border-[#E8ECF3] z-50
        transform transition-transform duration-200
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-[#E8ECF3]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-[#6C5DD3] to-[#3F8CFF] rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">绝</span>
          </div>
          <span className="font-semibold text-[#11142D] text-base">绝世百宝箱</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="overflow-y-auto h-[calc(100vh-14rem)] py-3 px-3">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-4">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-[#808191] uppercase tracking-wider">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavChange(item.id);
                      onMobileClose();
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all
                      ${isActive
                        ? 'bg-[#6C5DD3]/8 text-[#6C5DD3]'
                        : 'text-[#808191] hover:bg-[#F3F5FA] hover:text-[#11142D]'
                      }
                    `}
                  >
                    <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-[#6C5DD3]' : ''}`} strokeWidth={isActive ? 2.2 : 1.8} />
                    <span className={`text-sm truncate ${isActive ? 'font-medium' : 'font-normal'}`}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom CTA */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#E8ECF3] bg-white">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#6C5DD3] to-[#3F8CFF] text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-[#6C5DD3]/20 transition-shadow">
          <Sparkles className="w-4 h-4" />
          今日签到
        </button>
      </div>
    </aside>
  );
}
