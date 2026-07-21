import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { LucideIcon } from 'lucide-react';
import {
  ExternalLink, Tag, Globe, BookOpen, AlertCircle,
  Star, Calendar, MapPin, Clock, TrendingUp, Link2,
  Package, Briefcase, Wrench, FileText, GraduationCap,
  Landmark, CreditCard, ShoppingCart, ChevronRight, Home,
  Flame, Sparkles, Flag, Share2, BadgeCheck, Megaphone,
} from 'lucide-react';
import FavoriteButton from '@/components/favorite-button';
import { TrackedResourceLink } from '@/components/tracked-resource-link';

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * 分类元信息：使用 lucide-react 图标（非 emoji），搭配彩色背景。
 */
const CATEGORY_META: Record<
  string,
  { name: string; icon: LucideIcon; badge: string; dot: string; gradient: string }
> = {
  life: { name: '海外生活', icon: Globe, badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', gradient: 'from-blue-500 to-indigo-600' },
  logistics: { name: '跨境物流', icon: Package, badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', gradient: 'from-orange-500 to-amber-600' },
  business: { name: '出海经营', icon: Briefcase, badge: 'bg-green-100 text-green-700', dot: 'bg-green-500', gradient: 'from-green-500 to-emerald-600' },
  tools: { name: '实用工具', icon: Wrench, badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500', gradient: 'from-purple-500 to-violet-600' },
  templates: { name: '模板资源', icon: FileText, badge: 'bg-pink-100 text-pink-700', dot: 'bg-pink-500', gradient: 'from-pink-500 to-rose-600' },
  education: { name: '教育培训', icon: GraduationCap, badge: 'bg-teal-100 text-teal-700', dot: 'bg-teal-500', gradient: 'from-teal-500 to-cyan-600' },
  official: { name: '官方网站', icon: Landmark, badge: 'bg-red-100 text-red-700', dot: 'bg-red-500', gradient: 'from-red-500 to-rose-600' },
  payment: { name: '支付收款', icon: CreditCard, badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', gradient: 'from-emerald-500 to-green-600' },
  ecommerce: { name: '电商平台', icon: ShoppingCart, badge: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500', gradient: 'from-indigo-500 to-violet-600' },
};

const FALLBACK_CATEGORY: { name: string; icon: LucideIcon; badge: string; dot: string; gradient: string } = {
  name: '资源',
  icon: Globe,
  badge: 'bg-gray-100 text-gray-700',
  dot: 'bg-gray-500',
  gradient: 'from-gray-500 to-slate-600',
};

const SOURCE_TYPE_CONFIG: Record<string, { label: string; badge: string }> = {
  official: { label: '官方', badge: 'bg-green-100 text-green-700 border-green-200' },
  'third-party': { label: '第三方', badge: 'bg-gray-100 text-gray-600 border-gray-200' },
  internal: { label: '内部', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
};

function getCategoryMeta(category: string) {
  return CATEGORY_META[category] || FALLBACK_CATEGORY;
}

function languageLabel(lang?: string | null) {
  if (!lang) return '未知';
  if (lang === 'en') return '英文';
  if (lang === 'zh') return '中文';
  if (lang === 'ja') return '日文';
  if (lang === 'ko') return '韩文';
  return lang;
}

/** 判断推荐位是否在有效时间窗口内 */
function isFeatureActive(
  r: { isFeatured: boolean; featuredStartAt: Date | null; featuredEndAt: Date | null },
  now: Date,
) {
  if (!r.isFeatured) return false;
  const { featuredStartAt: start, featuredEndAt: end } = r;
  if (!start && !end) return true;
  if (start && !end) return now >= start;
  if (!start && end) return now <= end;
  return now >= start! && now <= end!;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) return { title: '资源未找到' };
  return {
    title: `${resource.name} - 绝世百宝箱`,
    description: resource.description || `查看 ${resource.name} 的详细信息`,
    openGraph: {
      title: `${resource.name} - 绝世百宝箱`,
      description: resource.description || `查看 ${resource.name} 的详细信息`,
      type: 'website',
      url: resource.url,
    },
  };
}

async function getRelatedResources(category: string, excludeId: string, limit = 6) {
  return prisma.resource.findMany({
    where: { category, isActive: true, isAd: false, id: { not: excludeId } },
    orderBy: { qualityScore: 'desc' },
    take: limit,
  });
}

async function getHotResources(excludeId: string, limit = 8) {
  return prisma.resource.findMany({
    where: { isActive: true, isAd: false, id: { not: excludeId } },
    orderBy: [{ qualityScore: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  });
}

async function getLatestResources(excludeId: string, limit = 5) {
  return prisma.resource.findMany({
    where: { isActive: true, isAd: false, id: { not: excludeId } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

async function getAdResource(excludeId: string) {
  return prisma.resource.findFirst({
    where: { isActive: true, isAd: true, id: { not: excludeId } },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
}

export default async function ResourceDetailPage({ params }: Props) {
  const { id } = await params;
  const now = new Date();

  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) notFound();

  const catMeta = getCategoryMeta(resource.category);
  const CatIcon = catMeta.icon;
  const sourceConfig = SOURCE_TYPE_CONFIG[resource.sourceType] || SOURCE_TYPE_CONFIG['third-party'];

  const [relatedResources, hotResources, latestResources, adResource] = await Promise.all([
    getRelatedResources(resource.category, resource.id),
    getHotResources(resource.id),
    getLatestResources(resource.id),
    getAdResource(resource.id),
  ]);

  const logoSrc = resource.iconUrl || resource.favicon || null;
  const initial = resource.name.charAt(0).toUpperCase();
  const featuredActive = isFeatureActive(resource, now);
  const qualityPct = Math.max(0, Math.min(100, resource.qualityScore));

  return (
    <div className="min-h-screen bg-bg">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-subtitle overflow-hidden">
            <Link href="/" className="inline-flex items-center gap-1 hover:text-brand transition-colors shrink-0">
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">首页</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
            <Link href="/resources" className="hover:text-brand transition-colors shrink-0">
              资源库
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
            <Link
              href={`/resources/${resource.category}`}
              className="hover:text-brand transition-colors shrink-0"
            >
              {catMeta.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
            <span className="text-title font-medium truncate">{resource.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Layout: two columns */}
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Main Content (~65%) */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Title Card */}
            <div
              className={
                'bg-white rounded-xl border border-border shadow-card p-6 ' +
                (featuredActive ? 'ring-2 ring-amber-200' : '')
              }
            >
              <div className="flex flex-col sm:flex-row items-start gap-5">
                {/* Logo */}
                <div className="shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-border flex items-center justify-center overflow-hidden">
                  {logoSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoSrc} alt={resource.name} className="w-14 h-14 object-contain" />
                  ) : (
                    <span className="text-3xl font-bold text-gray-400">{initial}</span>
                  )}
                </div>

                {/* Title + Status + Meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold text-title">{resource.name}</h1>
                    {resource.sourceType === 'official' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                        <BadgeCheck className="w-3 h-3" /> 官方
                      </span>
                    )}
                    {featuredActive && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                        <Sparkles className="w-3 h-3" /> 精选
                      </span>
                    )}
                    {resource.isAd && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Megaphone className="w-3 h-3" /> 广告
                      </span>
                    )}
                  </div>

                  {/* Meta info row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-subtitle mb-3">
                    <Link
                      href={`/resources/${resource.category}`}
                      className={'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ' + catMeta.badge}
                    >
                      <CatIcon className="w-3.5 h-3.5" />
                      {catMeta.name}
                    </Link>
                    <span className="inline-flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      {languageLabel(resource.language)}
                    </span>
                    {resource.qualityScore > 0 && (
                      <span className="inline-flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-medium text-title">{resource.qualityScore}</span>
                        <span className="text-xs">/ 100</span>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(resource.createdAt).toLocaleDateString('zh-CN')} 收录
                    </span>
                    {resource.domainAge ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        域龄 {Math.floor(resource.domainAge / 365)} 年
                      </span>
                    ) : null}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <TrackedResourceLink
                      href={resource.url}
                      isExternal
                      isTemplate={false}
                      category={resource.category}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-medium hover:bg-brand-dark transition-colors text-sm shadow-card"
                    >
                      <ExternalLink className="w-4 h-4" />
                      打开网站
                    </TrackedResourceLink>
                    <FavoriteButton
                      resourceUrl={resource.url}
                      title={resource.name}
                      resourceType="url"
                      size="md"
                    />
                    <a
                      href={`mailto:?subject=${encodeURIComponent(resource.name)}&body=${encodeURIComponent(resource.url)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-subtitle rounded-xl text-sm hover:bg-gray-50 border border-border transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      分享
                    </a>
                    <Link
                      href="/feedback"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-subtitle rounded-xl text-sm hover:bg-gray-50 border border-border transition-colors"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      举报
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Screenshot / Preview */}
            <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
                <Globe className="w-4 h-4 text-accent" />
                <h2 className="text-base font-bold text-title">网站预览</h2>
              </div>
              <div className="bg-bg p-5">
                <div className="bg-white rounded-xl border border-border overflow-hidden">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-border">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 bg-white rounded-md border border-border px-3 py-1 text-xs text-gray-400 truncate">
                      {resource.url}
                    </div>
                  </div>
                  {/* Preview placeholder */}
                  <div className="h-60 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    {logoSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoSrc} alt={resource.name} className="w-16 h-16 object-contain mb-3 opacity-60" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gray-200 flex items-center justify-center mb-3">
                        <span className="text-2xl font-bold text-gray-400">{initial}</span>
                      </div>
                    )}
                    <p className="text-sm text-subtitle font-medium">{resource.name}</p>
                    <p className="text-xs text-gray-400 mt-1">点击「打开网站」访问完整页面</p>
                    <TrackedResourceLink
                      href={resource.url}
                      isExternal
                      isTemplate={false}
                      category={resource.category}
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent-dark transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      访问网站
                    </TrackedResourceLink>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed description */}
            {resource.description && (
              <div className="bg-white rounded-xl border border-border shadow-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-accent" />
                  <h2 className="text-base font-bold text-title">网站介绍</h2>
                </div>
                <p className="text-subtitle leading-relaxed text-sm whitespace-pre-line">{resource.description}</p>
              </div>
            )}

            {/* Usage notes */}
            {resource.usage && (
              <div className="bg-white rounded-xl border border-border shadow-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-accent" />
                  <h2 className="text-base font-bold text-title">使用场景</h2>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-subtitle leading-relaxed text-sm whitespace-pre-line">{resource.usage}</p>
                </div>
              </div>
            )}

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="bg-white rounded-xl border border-border shadow-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4 text-accent" />
                  <h2 className="text-base font-bold text-title">标签</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-100 hover:bg-purple-100 transition-colors"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related resources grid */}
            {relatedResources.length > 0 && (
              <div className="bg-white rounded-xl border border-border shadow-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-accent" />
                    <h2 className="text-base font-bold text-title">相关资源</h2>
                  </div>
                  <Link
                    href={`/resources/${resource.category}`}
                    className="text-xs text-brand hover:underline inline-flex items-center gap-1"
                  >
                    查看更多 <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {relatedResources.slice(0, 6).map((r) => {
                    const rMeta = getCategoryMeta(r.category);
                    const RIcon = rMeta.icon;
                    const rLogo = r.iconUrl || r.favicon || null;
                    const rInitial = r.name.charAt(0).toUpperCase();
                    return (
                      <Link
                        key={r.id}
                        href={`/resources/site/${r.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-accent hover:bg-accent/5 transition-all group"
                      >
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-gray-50 border border-border flex items-center justify-center overflow-hidden">
                          {rLogo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={rLogo} alt={r.name} className="w-6 h-6 object-contain" />
                          ) : (
                            <RIcon className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-title truncate group-hover:text-brand transition-colors">{r.name}</p>
                          <p className="text-xs text-subtitle truncate">{r.description || rMeta.name}</p>
                        </div>
                        {r.qualityScore > 0 && (
                          <span className="shrink-0 inline-flex items-center gap-0.5 text-xs text-amber-500 font-medium">
                            <Star className="w-3 h-3" />
                            {r.qualityScore}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1 text-sm">
                    {resource.disclaimer ? '特别声明' : '免责声明'}
                  </h3>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {resource.disclaimer ||
                      '本站为中立第三方工具平台，所展示的资源均由网络收集或用户提交，仅供学习参考使用。本站不对任何第三方网站的内容、服务质量或安全性承担责任。使用外部链接时请自行判断风险。'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar (~35%, sticky) */}
          <aside className="w-full lg:w-[420px] xl:w-[460px] shrink-0 lg:self-start lg:sticky lg:top-24 space-y-5">
            {/* Hot resources ranking (top 8 by qualityScore) */}
            {hotResources.length > 0 && (
              <div className="bg-white rounded-xl border border-border shadow-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <h3 className="text-sm font-bold text-title">热门资源榜</h3>
                  <span className="ml-auto text-[10px] text-subtitle">按质量评分</span>
                </div>
                <div className="space-y-1">
                  {hotResources.map((r, i) => {
                    const rMeta = getCategoryMeta(r.category);
                    const RIcon = rMeta.icon;
                    return (
                      <Link
                        key={r.id}
                        href={`/resources/site/${r.id}`}
                        className="flex items-center gap-3 py-2 group rounded-lg hover:bg-bg px-1.5 -mx-1.5 transition-colors"
                      >
                        <span
                          className={
                            'shrink-0 w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ' +
                            (i < 3 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500')
                          }
                        >
                          {i + 1}
                        </span>
                        <div className="shrink-0 w-6 h-6 rounded bg-gray-50 border border-border flex items-center justify-center overflow-hidden">
                          {r.iconUrl || r.favicon ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={r.iconUrl || r.favicon || ''} alt={r.name} className="w-4 h-4 object-contain" />
                          ) : (
                            <RIcon className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-title truncate group-hover:text-brand transition-colors">{r.name}</p>
                          <p className="text-[10px] text-subtitle truncate">{rMeta.name}</p>
                        </div>
                        <span className="shrink-0 inline-flex items-center gap-0.5 text-xs text-amber-500 font-medium">
                          <Star className="w-3 h-3" />
                          {r.qualityScore}
                        </span>
                      </Link>
                    );
                  })}
                </div>
                <Link
                  href="/resources"
                  className="block text-center mt-3 text-xs text-brand hover:underline py-2 border-t border-border"
                >
                  查看全部资源
                </Link>
              </div>
            )}

            {/* Latest additions (5 most recent) */}
            {latestResources.length > 0 && (
              <div className="bg-white rounded-xl border border-border shadow-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <h3 className="text-sm font-bold text-title">最新收录</h3>
                </div>
                <div className="space-y-1">
                  {latestResources.map((r) => {
                    const rMeta = getCategoryMeta(r.category);
                    return (
                      <Link
                        key={r.id}
                        href={`/resources/site/${r.id}`}
                        className="flex items-center gap-3 py-2 group rounded-lg hover:bg-bg px-1.5 -mx-1.5 transition-colors"
                      >
                        <span className={'shrink-0 w-1.5 h-1.5 rounded-full ' + rMeta.dot} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-title truncate group-hover:text-brand transition-colors">{r.name}</p>
                          <p className="text-[10px] text-subtitle truncate">
                            {rMeta.name} · {new Date(r.createdAt).toLocaleDateString('zh-CN')}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ad slot */}
            {adResource && (
              <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-border">
                  <Megaphone className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-xs font-medium text-indigo-600">推广资源</span>
                  <span className="ml-auto text-[10px] text-gray-400">广告</span>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-gray-50 border border-border flex items-center justify-center overflow-hidden">
                      {adResource.iconUrl || adResource.favicon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={adResource.iconUrl || adResource.favicon || ''} alt={adResource.name} className="w-6 h-6 object-contain" />
                      ) : (
                        <span className="text-sm font-bold text-gray-400">{adResource.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-title truncate">{adResource.name}</p>
                      <p className="text-xs text-subtitle truncate">{adResource.description}</p>
                    </div>
                  </div>
                  <TrackedResourceLink
                    href={adResource.url}
                    isExternal
                    isTemplate={false}
                    category={adResource.category}
                    className="block text-center py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" />
                      访问网站
                    </span>
                  </TrackedResourceLink>
                </div>
              </div>
            )}

            {/* Back to category */}
            <div className="bg-white rounded-xl border border-border shadow-card p-5">
              <h3 className="text-sm font-bold text-title mb-3">快捷操作</h3>
              <div className="space-y-2">
                <Link
                  href={`/resources/${resource.category}`}
                  className="flex items-center gap-2 w-full px-3 py-2 bg-bg text-subtitle rounded-lg text-sm hover:bg-gray-100 transition-colors"
                >
                  <CatIcon className="w-3.5 h-3.5" />
                  返回 {catMeta.name}
                </Link>
                <Link
                  href="/resources"
                  className="flex items-center gap-2 w-full px-3 py-2 bg-bg text-subtitle rounded-lg text-sm hover:bg-gray-100 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  浏览全部资源
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
