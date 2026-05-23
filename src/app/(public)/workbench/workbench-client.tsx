'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Home, ChevronRight, Crown, Zap, Globe, Shield, Settings,
  Package, Truck, Calculator, FileText, MapPin, Search,
  BarChart3, Bookmark, ExternalLink, Star,
} from 'lucide-react';
import WorkbenchCard from '@/components/workbench/WorkbenchCard';
import MemoWidget from '@/components/workbench/MemoWidget';
import QuickToolsWidget from '@/components/workbench/QuickToolsWidget';

// ===== MOCK DATA =====

const MOCK_INTERNAL_TOOLS = [
  {
    id: '1',
    title: '物流追踪',
    description: '支持 17TRACK / DHL / FedEx 等多平台查询',
    route: '/tracking',
    icon: <Truck className="w-5 h-5" />,
    tag: 'hot',
  },
  {
    id: '2',
    title: '邮编查询',
    description: '全球 200+ 国家/地区邮编精确查询',
    route: '/tools/postal-code',
    icon: <MapPin className="w-5 h-5" />,
    tag: 'recommended',
  },
  {
    id: '3',
    title: 'HS 编码查询',
    description: '海关编码分类查询与税率参考',
    route: '/tools/hs-code',
    icon: <FileText className="w-5 h-5" />,
    tag: 'free',
  },
  {
    id: '4',
    title: '汇率换算',
    description: '实时汇率转换，支持 30+ 货币对',
    route: '/tools/exchange-rate',
    icon: <Calculator className="w-5 h-5" />,
    tag: 'new',
  },
  {
    id: '5',
    title: '运费估算',
    description: '国际快递运费对比与时效预估',
    route: '/tools/shipping-calculator',
    icon: <Package className="w-5 h-5" />,
    tag: 'recommended',
  },
  {
    id: '6',
    title: '商业发票生成',
    description: '一键生成标准商业发票 PDF',
    route: '/tools/documents/commercial-invoice',
    icon: <FileText className="w-5 h-5" />,
    tag: 'paid',
  },
  {
    id: '7',
    title: '唛头标签',
    description: '生成标准化外箱唛头与标签',
    route: '/tools/shipping-mark',
    icon: <Bookmark className="w-5 h-5" />,
    tag: null,
  },
  {
    id: '8',
    title: '全局搜索',
    description: '一键搜索所有工具与资源',
    route: '/search',
    icon: <Search className="w-5 h-5" />,
    tag: null,
  },
];

const MOCK_EXTERNAL_URLS = [
  {
    id: 'e1',
    title: '17TRACK',
    description: '全球包裹追踪平台',
    url: 'https://www.17track.net',
    icon: <Globe className="w-5 h-5" />,
    tag: 'hot',
  },
  {
    id: 'e2',
    title: 'DHL Express',
    description: 'DHL 官方快递查询与下单',
    url: 'https://www.dhl.com',
    icon: <Truck className="w-5 h-5" />,
    tag: null,
  },
  {
    id: 'e3',
    title: 'Wise 跨境汇款',
    description: '低费率国际转账服务',
    url: 'https://wise.com',
    icon: <BarChart3 className="w-5 h-5" />,
    tag: 'recommended',
  },
];

// ===== ICON MAP FOR ROLE =====
const ROLE_ICONS: Record<string, React.ReactNode> = {
  admin: <Shield className="w-4 h-4" />,
  member: <Crown className="w-4 h-4" />,
  user: <Zap className="w-4 h-4" />,
  guest: <Globe className="w-4 h-4" />,
};

const ROLE_LABELS: Record<string, string> = {
  admin: '管理员',
  member: '会员',
  user: '普通用户',
  guest: '游客',
};

const ROLE_BADGE_STYLES: Record<string, string> = {
  admin: 'bg-purple-50 text-purple-700 border-purple-200',
  member: 'bg-amber-50 text-amber-700 border-amber-200',
  user: 'bg-gray-50 text-gray-600 border-gray-200',
  guest: 'bg-gray-50 text-gray-400 border-gray-100',
};

export default function WorkbenchClient() {
  const [loading, setLoading] = useState(true);
  const [loginRequired, setLoginRequired] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    name: string;
    email: string;
    role: string;
    image?: string;
  }>({ name: '', email: '', role: 'guest' });

  // Collection / custom nav count (mock)
  const [totalCount, setTotalCount] = useState(5);
  const totalLimit = 20;

  // Favorites state (mock optimistic UI)
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [showWidgetManager, setShowWidgetManager] = useState(false);
  const [widgetsVisible, setWidgetsVisible] = useState<Record<string, boolean>>({
    memo: true,
    quickTools: true,
  });

  // Fetch user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch('/api/workbench/summary');
        if (res.status === 401) {
          setLoginRequired(true);
          setLoading(false);
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setUserInfo({
            name: data.user?.name || data.user?.email?.split('@')[0] || '用户',
            email: data.user?.email || '',
            role: data.user?.role || 'user',
            image: data.user?.image,
          });
          setTotalCount((data.limits?.usedCount || 0));
        }
      } catch {
        // Use mock data
        setUserInfo({ name: '澈', email: 'user@local.test', role: 'user' });
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleToggleFavorite = useCallback((id: string, title: string, isFav: boolean) => {
    setFavorites((prev) => {
      const next = { ...prev, [id]: !isFav };
      const newCount = isFav ? totalCount - 1 : totalCount + 1;
      if (!isFav && newCount > totalLimit) {
        setToast({ message: '收藏上限 20 个，请先取消其他收藏', type: 'info' });
        return prev; // Revert
      }
      setTotalCount(newCount);
      setToast({
        message: isFav ? `已取消收藏: ${title}` : `✅ 已添加到个人工作台 (${newCount}/${totalLimit})`,
        type: 'success',
      });
      return next;
    });
  }, [totalCount, totalLimit]);

  const toggleWidget = useCallback((key: string) => {
    setWidgetsVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-gray-200 border-t-gray-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (loginRequired) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-gray-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">请先登录</h1>
          <p className="text-sm text-gray-400 mb-6">工作台功能需要登录后使用</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors min-h-[44px] w-full"
          >
            前往登录 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round((totalCount / totalLimit) * 100);

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* ===== Toast ===== */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className={`px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg border ${
            toast.type === 'success'
              ? 'bg-white text-gray-900 border-gray-100'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            {toast.message}
          </div>
        </div>
      )}

      {/* ===== Top Bar: Breadcrumb + Title + Manage Widgets ===== */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-1.5">
                <Link href="/" className="hover:text-gray-600 transition-colors inline-flex items-center gap-1">
                  <Home className="w-3.5 h-3.5" /> 首页
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gray-700 font-medium">我的工作台</span>
              </nav>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">我的工作台</h1>
            </div>
            <button
              onClick={() => setShowWidgetManager(!showWidgetManager)}
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-600"
              title="管理挂件"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* ===== Identity & Quota ===== */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-100/50 p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Avatar + Name + Role */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-semibold text-sm">
                {userInfo.image ? (
                  <img src={userInfo.image} alt="" className="w-11 h-11 rounded-xl object-cover" />
                ) : (
                  userInfo.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{userInfo.name || '用户'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${ROLE_BADGE_STYLES[userInfo.role] || ROLE_BADGE_STYLES.user}`}>
                    {ROLE_ICONS[userInfo.role] || ROLE_ICONS.user}
                    {ROLE_LABELS[userInfo.role] || userInfo.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quota + Upgrade */}
            <div className="flex items-center gap-4">
              <div className="flex-1 md:flex-none md:w-48">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400">收藏与导航</span>
                  <span className="font-medium text-gray-700">{totalCount} / {totalLimit}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      progressPercent >= 80 ? 'bg-amber-400' : 'bg-teal-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-100 rounded-lg hover:bg-teal-100 transition-colors"
              >
                <Crown className="w-3.5 h-3.5" />
                解锁无上限
              </Link>
            </div>
          </div>
        </div>

        {/* ===== Widget Manager (collapsible) ===== */}
        {showWidgetManager && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2 animate-in fade-in slide-in-from-top-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">挂件管理</p>
            {[
              { key: 'memo', label: '备忘录' },
              { key: 'quickTools', label: '快捷工具箱' },
            ].map((w) => (
              <label key={w.key} className="flex items-center justify-between py-1.5 cursor-pointer">
                <span className="text-sm text-gray-700">{w.label}</span>
                <input
                  type="checkbox"
                  checked={widgetsVisible[w.key] ?? true}
                  onChange={() => toggleWidget(w.key)}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
              </label>
            ))}
          </div>
        )}

        {/* ===== Widget Section ===== */}
        <div className="grid md:grid-cols-2 gap-4">
          {widgetsVisible.memo !== false && <MemoWidget />}
          {widgetsVisible.quickTools !== false && <QuickToolsWidget />}
        </div>

        {/* ===== Section Title: 我的收藏 ===== */}
        <div className="flex items-center gap-3 pt-2">
          <div className="w-1 h-5 bg-teal-500 rounded-full" />
          <div>
            <h2 className="text-base font-bold text-gray-900">我的收藏</h2>
            <p className="text-xs text-gray-400">站内工具与外部网址，统一收藏管理</p>
          </div>
        </div>

        {/* ===== Mixed Card Grid ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {/* Internal tools */}
          {MOCK_INTERNAL_TOOLS.map((tool) => (
            <WorkbenchCard
              key={tool.id}
              title={tool.title}
              description={tool.description}
              route={tool.route}
              icon={tool.icon}
              isInternal={true}
              tag={tool.tag || undefined}
              isFavorite={!!favorites[tool.id]}
              onToggleFavorite={() => handleToggleFavorite(tool.id, tool.title, !!favorites[tool.id])}
            />
          ))}

          {/* External URLs */}
          {MOCK_EXTERNAL_URLS.map((ext) => (
            <WorkbenchCard
              key={ext.id}
              title={ext.title}
              description={ext.description}
              url={ext.url}
              icon={ext.icon}
              isInternal={false}
              tag={ext.tag || undefined}
              isFavorite={!!favorites[ext.id]}
              onToggleFavorite={() => handleToggleFavorite(ext.id, ext.title, !!favorites[ext.id])}
            />
          ))}
        </div>

        {/* ===== Empty state hint ===== */}
        <div className="text-center py-8">
          <p className="text-xs text-gray-300">更多工具将逐步接入，欢迎前往资源库发现</p>
          <Link
            href="/resources"
            className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 mt-1 transition-colors"
          >
            浏览严选资源 <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
