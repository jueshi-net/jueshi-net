import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ExternalLink, Tag, Globe, BookOpen, AlertCircle,
  Star, Calendar, MapPin, Clock, Heart, Share2, Flag, Smartphone,
  Eye, MessageCircle, ThumbsUp, TrendingUp, Link2,
} from 'lucide-react';
import FavoriteButton from '@/components/favorite-button';
import JueshiV4PublicShell from '@/components/layout/JueshiV4PublicShell';

interface Props {
  params: Promise<{ id: string }>;
}

const CATEGORY_CONFIG: Record<string, { name: string; icon: string; gradient: string }> = {
  life: { name: '海外生活', icon: '🌍', gradient: 'from-teal-500 to-blue-600' },
  logistics: { name: '跨境物流', icon: '📦', gradient: 'from-blue-500 to-indigo-600' },
  business: { name: '出海经营', icon: '💼', gradient: 'from-purple-500 to-pink-600' },
  tools: { name: '实用工具', icon: '🔧', gradient: 'from-amber-500 to-orange-600' },
  templates: { name: '模板资源', icon: '', gradient: 'from-orange-500 to-red-600' },
  education: { name: '教育培训', icon: '🎓', gradient: 'from-emerald-500 to-teal-600' },
  official: { name: '官方网站', icon: '🏛️', gradient: 'from-red-500 to-rose-600' },
  payment: { name: '支付收款', icon: '💳', gradient: 'from-green-500 to-emerald-600' },
  ecommerce: { name: '电商平台', icon: '🛒', gradient: 'from-indigo-500 to-violet-600' },
};

const SOURCE_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  official: { label: '官方', color: 'bg-green-100 text-green-700 border-green-200' },
  'third-party': { label: '第三方', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  internal: { label: '内部', color: 'bg-blue-100 text-blue-700 border-blue-200' },
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) return { title: '资源未找到' };
  return {
    title: `${resource.name} - 绝世百宝箱`,
    description: resource.description || `查看 ${resource.name} 的详细信息`,
  };
}

async function getRelatedResources(category: string, excludeId: string, limit = 6) {
  return prisma.resource.findMany({
    where: { category, isActive: true, id: { not: excludeId } },
    orderBy: { qualityScore: 'desc' },
    take: limit,
  });
}

async function getTopResources(limit = 8) {
  return prisma.resource.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: [{ sortOrder: 'asc' }, { qualityScore: 'desc' }],
    take: limit,
  });
}

export default async function ResourceDetailPage({ params }: Props) {
  const { id } = await params;

  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) notFound();

  const catConfig = CATEGORY_CONFIG[resource.category] || CATEGORY_CONFIG.tools;
  const sourceConfig = SOURCE_TYPE_CONFIG[resource.sourceType] || SOURCE_TYPE_CONFIG['third-party'];
  const relatedResources = await getRelatedResources(resource.category, resource.id);
  const topResources = await getTopResources();

  const logoSrc = resource.iconUrl || resource.favicon || null;
  const initial = resource.name.charAt(0).toUpperCase();

  return (
    <JueshiV4PublicShell>
    <div className="min-h-screen bg-gray-50">
      {/* Main Layout: Two columns */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Main Content */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Title Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start gap-5">
                {/* Logo */}
                <div className="shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                  {logoSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoSrc} alt={resource.name} className="w-14 h-14 object-contain" />
                  ) : (
                    <span className="text-3xl font-bold text-gray-400">{initial}</span>
                  )}
                </div>

                {/* Title + Meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{resource.name}</h1>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${sourceConfig.color}`}>
                      {sourceConfig.label}
                    </span>
                    {resource.isFeatured && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                        <Star className="w-3 h-3" /> 精选
                      </span>
                    )}
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(resource.updatedAt).toLocaleDateString('zh-CN')} 更新
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      收录于 {new Date(resource.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                    {resource.domainAge && (
                      <span className="inline-flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" />
                        域名 {Math.floor(resource.domainAge / 365)} 年
                      </span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors shadow-sm text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      打开网站
                    </a>
                    <FavoriteButton
                      resourceUrl={resource.url}
                      title={resource.name}
                      resourceType="url"
                      size="md"
                    />
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                      <Smartphone className="w-3.5 h-3.5" />
                      手机查看
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                      <Flag className="w-3.5 h-3.5" />
                      举报
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Website Preview */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-600" />
                <h2 className="text-base font-bold text-gray-900">网站预览</h2>
              </div>
              <div className="bg-gray-100 p-6">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-inner">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 bg-white rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-400 truncate">
                      {resource.url}
                    </div>
                  </div>
                  {/* Preview placeholder */}
                  <div className="h-64 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    {logoSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoSrc} alt={resource.name} className="w-16 h-16 object-contain mb-3 opacity-60" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gray-200 flex items-center justify-center mb-3">
                        <span className="text-2xl font-bold text-gray-400">{initial}</span>
                      </div>
                    )}
                    <p className="text-sm text-gray-500 font-medium">{resource.name}</p>
                    <p className="text-xs text-gray-400 mt-1">点击「打开网站」访问完整页面</p>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      访问网站
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Info Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-teal-600" />
                <h2 className="text-base font-bold text-gray-900">基础信息</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow label="所属分类" value={
                  <Link href={`/resources/${resource.category}`} className="text-teal-600 hover:underline">
                    {catConfig.icon} {catConfig.name}
                  </Link>
                } />
                <InfoRow label="资源类型" value={
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${sourceConfig.color}`}>
                    {sourceConfig.label}
                  </span>
                } />
                {resource.language && (
                  <InfoRow label="站点语言" value={
                    <span>{resource.language === 'en' ? '🇬🇧 英文' : resource.language === 'zh' ? '🇨🇳 中文' : resource.language}</span>
                  } />
                )}
                {resource.domainAge && (
                  <InfoRow label="域名年龄" value={<span>约 {Math.floor(resource.domainAge / 365)} 年</span>} />
                )}
                <InfoRow label="收录时间" value={<span>{new Date(resource.createdAt).toLocaleDateString('zh-CN')}</span>} />
                <InfoRow label="最后更新" value={<span>{new Date(resource.updatedAt).toLocaleDateString('zh-CN')}</span>} />
                {resource.qualityScore > 0 && (
                  <InfoRow label="质量评分" value={
                    <span className="inline-flex items-center gap-1">
                      <span className="text-amber-500">{'★'.repeat(Math.min(Math.round(resource.qualityScore / 20), 5))}</span>
                      <span className="text-gray-400">{'☆'.repeat(5 - Math.min(Math.round(resource.qualityScore / 20), 5))}</span>
                      <span className="text-xs text-gray-500 ml-1">{resource.qualityScore}/100</span>
                    </span>
                  } />
                )}
              </div>
            </div>

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4 text-teal-600" />
                  <h2 className="text-base font-bold text-gray-900">标签</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-100 hover:bg-purple-100 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {resource.description && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-teal-600" />
                  <h2 className="text-base font-bold text-gray-900">网站介绍</h2>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">{resource.description}</p>
              </div>
            )}

            {/* Usage */}
            {resource.usage && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <h2 className="text-base font-bold text-gray-900">使用场景</h2>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-gray-700 leading-relaxed text-sm">{resource.usage}</p>
                </div>
              </div>
            )}

            {/* Related Navigation */}
            {relatedResources.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-teal-600" />
                    <h2 className="text-base font-bold text-gray-900">相关导航</h2>
                  </div>
                  <Link href={`/resources/${resource.category}`} className="text-xs text-teal-600 hover:underline">
                    查看更多 →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {relatedResources.slice(0, 6).map((r) => {
                    const rLogo = r.iconUrl || r.favicon || null;
                    const rInitial = r.name.charAt(0).toUpperCase();
                    return (
                      <Link
                        key={r.id}
                        href={`/resources/site/${r.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50/50 transition-all group"
                      >
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                          {rLogo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={rLogo} alt={r.name} className="w-6 h-6 object-contain" />
                          ) : (
                            <span className="text-sm font-bold text-gray-400">{rInitial}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-teal-700">{r.name}</p>
                          <p className="text-xs text-gray-400 truncate">{r.description || r.category}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            {resource.disclaimer && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-1 text-sm">特别声明</h3>
                    <p className="text-xs text-amber-800 leading-relaxed">{resource.disclaimer}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Default disclaimer if none provided */}
            {!resource.disclaimer && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-1 text-sm">免责声明</h3>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      本站为中立第三方工具平台，所展示的资源均由网络收集或用户提交，仅供学习参考使用。
                      本站不对任何第三方网站的内容、服务质量或安全性承担责任。使用外部链接时请自行判断风险。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-80 shrink-0 space-y-5">
            {/* Site Info Card */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className={`bg-gradient-to-r ${catConfig.gradient} p-5 text-white`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                    {logoSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoSrc} alt={resource.name} className="w-8 h-8 object-contain" />
                    ) : (
                      <span className="text-xl font-bold">{initial}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{resource.name}</h3>
                    <p className="text-white/80 text-xs">{catConfig.name}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4 inline mr-1.5" />
                  打开网站
                </a>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-lg font-bold text-gray-900">{catConfig.icon}</p>
                    <p className="text-[10px] text-gray-500">{catConfig.name}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-lg font-bold text-gray-900">
                      {resource.sourceType === 'official' ? '🏛️' : resource.sourceType === 'internal' ? '📋' : '🌐'}
                    </p>
                    <p className="text-[10px] text-gray-500">{sourceConfig.label}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-lg font-bold text-gray-900">
                      {resource.language === 'en' ? '🇬' : resource.language === 'zh' ? '🇳' : '🌍'}
                    </p>
                    <p className="text-[10px] text-gray-500">{resource.language || '未知'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Resources */}
            {topResources.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-gray-900">精选推荐</h3>
                </div>
                <div className="space-y-2.5">
                  {topResources.slice(0, 6).map((r, i) => (
                    <Link
                      key={r.id}
                      href={`/resources/site/${r.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <span className={`shrink-0 w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${
                        i < 3 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate group-hover:text-teal-600 transition-colors">{r.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{r.description || r.category}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/resources"
                  className="block text-center mt-3 text-xs text-teal-600 hover:underline py-2 border-t border-gray-100"
                >
                  查看全部资源 →
                </Link>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-3">快捷操作</h3>
              <div className="space-y-2">
                <FavoriteButton
                  resourceUrl={resource.url}
                  title={resource.name}
                  resourceType="url"
                  size="md"
                />
                <Link
                  href={`/resources/${resource.category}`}
                  className="flex items-center gap-2 w-full px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  返回 {catConfig.name}
                </Link>
                <Link
                  href="/resources"
                  className="flex items-center gap-2 w-full px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  浏览全部资源
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </JueshiV4PublicShell>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-900 font-medium">{value}</span>
    </div>
  );
}
