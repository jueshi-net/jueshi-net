'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Home, ChevronRight, Crown, Zap, Globe, Shield, Settings,
  Package, Truck, Calculator, FileText, MapPin, Search,
  BarChart3, Bookmark, ArrowUpRight, Clock, Star, StarOff,
  GripVertical, Plus,
} from 'lucide-react';

// ===== MOCK DATA =====

const MOCK_CARDS = [
  { id: '1', title: '物流追踪', desc: '支持 17TRACK / DHL / FedEx 多平台', route: '/tracking', icon: <Truck className="w-5 h-5" />, tag: 'hot', isInternal: true },
  { id: '2', title: '邮编查询', desc: '全球 200+ 国家邮编精确查询', route: '/tools/postal-code', icon: <MapPin className="w-5 h-5" />, tag: 'recommended', isInternal: true },
  { id: '3', title: 'HS 编码查询', desc: '海关编码分类查询与税率参考', route: '/tools/hs-code', icon: <FileText className="w-5 h-5" />, tag: 'free', isInternal: true },
  { id: '4', title: '汇率换算', desc: '实时汇率转换，30+ 货币对', route: '/tools/exchange-rate', icon: <Calculator className="w-5 h-5" />, tag: 'new', isInternal: true },
  { id: '5', title: '运费估算', desc: '国际快递运费对比与时效预估', route: '/tools/shipping-calculator', icon: <Package className="w-5 h-5" />, tag: null, isInternal: true },
  { id: '6', title: '商业发票', desc: '一键生成标准商业发票 PDF', route: '/tools/documents/commercial-invoice', icon: <FileText className="w-5 h-5" />, tag: 'paid', isInternal: true },
  { id: '7', title: '唛头标签', desc: '标准化外箱唛头与标签生成', route: '/tools/shipping-mark', icon: <Bookmark className="w-5 h-5" />, tag: null, isInternal: true },
  { id: '8', title: '全局搜索', desc: '搜索所有工具与资源', route: '/search', icon: <Search className="w-5 h-5" />, tag: null, isInternal: true },
  { id: 'e1', title: '17TRACK', desc: '全球包裹追踪平台', url: 'https://www.17track.net', icon: <Globe className="w-5 h-5" />, tag: 'hot', isInternal: false },
  { id: 'e2', title: 'DHL Express', desc: 'DHL 官方快递查询', url: 'https://www.dhl.com', icon: <Truck className="w-5 h-5" />, tag: null, isInternal: false },
  { id: 'e3', title: 'Wise 跨境汇款', desc: '低费率国际转账服务', url: 'https://wise.com', icon: <BarChart3 className="w-5 h-5" />, tag: 'recommended', isInternal: false },
];

const TAG_MAP: Record<string, { label: string; cls: string }> = {
  hot: { label: '热门', cls: 'bg-red-50 text-red-600 ring-1 ring-red-100' },
  new: { label: 'NEW', cls: 'bg-blue-50 text-blue-600 ring-1 ring-blue-100' },
  recommended: { label: '推荐', cls: 'bg-teal-50 text-teal-600 ring-1 ring-teal-100' },
  free: { label: '免费', cls: 'bg-green-50 text-green-600 ring-1 ring-green-100' },
  paid: { label: '付费', cls: 'bg-amber-50 text-amber-600 ring-1 ring-amber-100' },
};

const ROLE_META: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  admin: { label: '管理员', icon: <Shield className="w-3.5 h-3.5" />, cls: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200' },
  member: { label: '会员', icon: <Crown className="w-3.5 h-3.5" />, cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  user: { label: '普通用户', icon: <Zap className="w-3.5 h-3.5" />, cls: 'bg-slate-50 text-slate-600 ring-1 ring-slate-200' },
  guest: { label: '游客', icon: <Globe className="w-3.5 h-3.5" />, cls: 'bg-slate-50 text-slate-400 ring-1 ring-slate-100' },
};

// ===== WorkbenchCard =====

function WBCard({ card, isFav, onToggle }: { card: typeof MOCK_CARDS[0]; isFav: boolean; onToggle: () => void }) {
  const [hovered, setHovered] = useState(false);
  const tag = card.tag ? TAG_MAP[card.tag] : null;
  const href = card.isInternal ? card.route : card.url;
  const Wrapper = card.isInternal ? Link : 'a';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative bg-white rounded-xl border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-gray-200 transition-all duration-300 hover:-translate-y-[2px]"
    >
      <Wrapper
        href={href || '#'}
        {...(!card.isInternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="block p-3.5"
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
            hovered
              ? 'bg-teal-50 text-teal-600 ring-1 ring-teal-100 scale-105'
              : 'bg-gray-50 text-gray-400 ring-1 ring-gray-100'
          }`}>
            {card.icon}
          </div>

          {/* Title + desc */}
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{card.title}</h3>
              {tag && (
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase ${tag.cls}`}>
                  {tag.label}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5 truncate leading-relaxed">{card.desc}</p>
          </div>

          {/* External link icon */}
          {!card.isInternal && <ArrowUpRight className="w-3 h-3 text-gray-300 flex-shrink-0 mt-0.5" />}
        </div>
      </Wrapper>

      {/* Hover overlay: favorite + drag */}
      <div className={`absolute top-2 right-2 flex items-center gap-0.5 transition-all duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(); }}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
        >
          {isFav
            ? <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            : <StarOff className="w-3.5 h-3.5 text-gray-300 hover:text-amber-400" />
          }
        </button>
        <div className="p-1 rounded cursor-grab" title="拖拽">
          <GripVertical className="w-3.5 h-3.5 text-gray-200 hover:text-gray-400" />
        </div>
      </div>
    </div>
  );
}

// ===== Add Placeholder Card =====

function AddCard() {
  return (
    <button
      className="rounded-xl border-2 border-dashed border-gray-200 hover:border-teal-300 hover:bg-teal-50/30 transition-all duration-300 flex flex-col items-center justify-center gap-2 py-6 sm:py-8 group cursor-pointer"
      onClick={() => {}}
    >
      <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
        <Plus className="w-5 h-5 text-gray-300 group-hover:text-teal-600 transition-colors" />
      </div>
      <span className="text-xs font-medium text-gray-300 group-hover:text-teal-600 transition-colors text-center leading-snug">
        添加自定义网址<br className="sm:hidden" />或工具
      </span>
    </button>
  );
}

// ===== Main Page =====

export default function WorkbenchClient() {
  const [loading, setLoading] = useState(true);
  const [loginRequired, setLoginRequired] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', email: '', role: 'user', image: '' });
  const [totalCount, setTotalCount] = useState(11); // Mock: 11/20
  const totalLimit = 20;
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [memoText, setMemoText] = useState('');
  const [memoSavedAt, setMemoSavedAt] = useState<Date | null>(null);
  const [widgets, setWidgets] = useState({ memo: true, clock: true });
  const [showManager, setShowManager] = useState(false);

  // Load user
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/workbench/summary');
        if (res.status === 401) { setLoginRequired(true); setLoading(false); return; }
        if (res.ok) {
          const d = await res.json();
          setUserInfo({ name: d.user?.name || d.user?.email?.split('@')[0] || '用户', email: d.user?.email || '', role: d.user?.role || 'user', image: d.user?.image || '' });
          setTotalCount(d.limits?.usedCount || 11);
        }
      } catch {
        setUserInfo({ name: '澈', email: 'user@local.test', role: 'user', image: '' });
      } finally { setLoading(false); }
    })();
  }, []);

  // Load memo
  useEffect(() => {
    try {
      const saved = localStorage.getItem('wb:memo');
      const t = localStorage.getItem('wb:memo:ts');
      if (saved) setMemoText(saved);
      if (t) setMemoSavedAt(new Date(t));
    } catch {}
  }, []);

  // Auto-save memo
  const handleMemoChange = (v: string) => {
    setMemoText(v);
    try { localStorage.setItem('wb:memo', v); } catch {}
    const now = new Date();
    localStorage.setItem('wb:memo:ts', now.toISOString());
    setMemoSavedAt(now);
  };

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t); }
  }, [toast]);

  const toggleFav = useCallback((id: string, title: string, was: boolean) => {
    const next = was ? totalCount - 1 : totalCount + 1;
    if (!was && next > totalLimit) { setToast({ message: '收藏上限 20 个', type: 'info' }); return; }
    setTotalCount(next);
    setFavorites(p => ({ ...p, [id]: !was }));
    setToast({ message: was ? `已取消: ${title}` : `✅ 已收藏 ${title} (${next}/${totalLimit})`, type: 'success' });
  }, [totalCount, totalLimit]);

  const now = new Date();
  const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
  const pct = Math.round((totalCount / totalLimit) * 100);
  const role = ROLE_META[userInfo.role] || ROLE_META.user;
  const initial = userInfo.name?.[0]?.toUpperCase() || 'U';

  const fmtMemo = (d: Date | null) => {
    if (!d) return '尚未保存';
    const m = Math.floor((Date.now() - d.getTime()) / 60000);
    if (m < 1) return '刚刚保存';
    if (m < 60) return `${m} 分钟前`;
    return `${Math.floor(m / 60)} 小时前`;
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
        <p className="text-xs text-gray-400 font-medium">加载中...</p>
      </div>
    </div>
  );

  if (loginRequired) return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 max-w-sm w-full text-center">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Shield className="w-7 h-7 text-slate-300" />
        </div>
        <h1 className="text-lg font-bold text-gray-900 mb-1.5 tracking-tight">请先登录</h1>
        <p className="text-sm text-gray-400 mb-6">工作台功能需要登录后使用</p>
        <Link href="/login" className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors">
          前往登录 <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className={`px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg backdrop-blur-xl border ${
            toast.type === 'success' ? 'bg-white/90 text-gray-900 border-gray-100' : 'bg-amber-50/90 text-amber-800 border-amber-200'
          }`}>{toast.message}</div>
        </div>
      )}

      {/* ===== Header Bar ===== */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-gray-600 transition-colors inline-flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> 首页
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-gray-700 font-medium">工作台</span>
          </div>
          <button
            onClick={() => setShowManager(!showManager)}
            className="p-2 rounded-lg hover:bg-gray-100/60 transition-colors text-gray-300 hover:text-gray-500"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 space-y-5">

        {/* ===== 1. Identity & Quota ===== */}
        <div className="bg-white rounded-2xl border border-gray-100/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left: Avatar + Name + Role */}
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                userInfo.image
                  ? 'overflow-hidden'
                  : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500'
              }`}>
                {userInfo.image
                  ? <img src={userInfo.image} alt="" className="w-full h-full object-cover" />
                  : initial
                }
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 tracking-tight">{userInfo.name || '用户'}</p>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold mt-0.5 ${role.cls}`}>
                  {role.icon}
                  {role.label}
                </span>
              </div>
            </div>

            {/* Right: Quota + Upgrade */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="min-w-[140px]">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">收藏容量</span>
                  <span className="text-sm font-bold text-gray-800 tabular-nums">
                    <span className={pct >= 80 ? 'text-amber-500' : ''}>{totalCount}</span>
                    <span className="text-gray-300 font-normal mx-0.5">/</span>
                    {totalLimit}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      pct >= 80
                        ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                        : 'bg-gradient-to-r from-teal-400 to-emerald-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <Link
                href="/pricing"
                className="group inline-flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30 transition-all whitespace-nowrap"
              >
                <Crown className="w-3 h-3 group-hover:rotate-12 transition-transform" />
                解锁无上限
              </Link>
            </div>
          </div>
        </div>

        {/* ===== Widget Manager ===== */}
        {showManager && (
          <div className="bg-white rounded-xl border border-gray-100/80 p-4 animate-in fade-in slide-in-from-top-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">挂件管理</p>
            {[
              { key: 'memo' as const, label: '备忘录' },
              { key: 'clock' as const, label: '时钟' },
            ].map(w => (
              <label key={w.key} className="flex items-center justify-between py-2 cursor-pointer">
                <span className="text-sm font-medium text-gray-700">{w.label}</span>
                <div className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${widgets[w.key] ? 'bg-teal-500' : 'bg-gray-200'}`}
                  onClick={() => setWidgets(p => ({ ...p, [w.key]: !p[w.key] }))}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${widgets[w.key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
              </label>
            ))}
          </div>
        )}

        {/* ===== 2. Section: 我的收藏 ===== */}
        <div className="flex items-center gap-2">
          <span className="text-sm">📌</span>
          <div>
            <h2 className="text-sm font-bold text-gray-900 tracking-tight">我的快捷工具与导航</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">{totalCount} 个已收藏</p>
          </div>
        </div>

        {/* ===== 2. Mixed Card Grid ===== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {MOCK_CARDS.map(card => (
            <WBCard
              key={card.id}
              card={card}
              isFav={!!favorites[card.id]}
              onToggle={() => toggleFav(card.id, card.title, !!favorites[card.id])}
            />
          ))}
          <AddCard />
        </div>

        {/* ===== 3. Section: 效率组件 ===== */}
        {(widgets.memo || widgets.clock) && (
          <>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-sm">💡</span>
              <div>
                <h2 className="text-sm font-bold text-gray-900 tracking-tight">效率组件</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">备忘录 · 时钟</p>
              </div>
            </div>

            {/* Horizontal scroll on mobile, grid on desktop */}
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:snap-none sm:pb-0 sm:-mx-0">
              {/* Memo */}
              {widgets.memo && (
                <div className="min-w-[260px] sm:min-w-0 snap-start shrink-0 sm:shrink bg-white rounded-xl border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-3.5 transition-all hover:shadow-md hover:border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-md bg-amber-50 ring-1 ring-amber-100 flex items-center justify-center">
                        <svg className="w-3 h-3 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M14 2v6h6"/></svg>
                      </div>
                      <h3 className="text-xs font-semibold text-gray-900">备忘录</h3>
                    </div>
                    <span className="text-[10px] text-gray-400">{fmtMemo(memoSavedAt)}</span>
                  </div>
                  <textarea
                    value={memoText}
                    onChange={e => handleMemoChange(e.target.value)}
                    placeholder="快速记录..."
                    rows={3}
                    className="w-full text-xs text-gray-700 placeholder:text-gray-300 bg-amber-50/20 rounded-lg border-0 resize-none focus:outline-none focus:ring-2 focus:ring-amber-100 p-2.5"
                    spellCheck={false}
                  />
                </div>
              )}

              {/* Clock */}
              {widgets.clock && (
                <div className="min-w-[200px] sm:min-w-0 snap-start shrink-0 sm:shrink bg-white rounded-xl border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-3.5 transition-all hover:shadow-md hover:border-gray-200">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-6 h-6 rounded-md bg-teal-50 ring-1 ring-teal-100 flex items-center justify-center">
                      <Clock className="w-3 h-3 text-teal-500" />
                    </div>
                    <h3 className="text-xs font-semibold text-gray-900">时钟</h3>
                  </div>
                  <div className="text-center py-1">
                    <p className="text-2xl font-bold text-gray-900 tracking-tight tabular-nums">{timeStr}</p>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">{dateStr}</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer hint */}
        <div className="text-center py-4 border-t border-gray-100/50">
          <p className="text-[11px] text-gray-300">更多工具将逐步接入</p>
          <Link href="/resources" className="inline-flex items-center gap-1 text-[11px] text-teal-600 hover:text-teal-700 mt-0.5 transition-colors font-medium">
            浏览网址导航 <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
