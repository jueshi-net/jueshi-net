import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Tag, Globe, BookOpen, AlertCircle, Star, Calendar, MapPin } from 'lucide-react';
import FavoriteButton from '@/components/favorite-button';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const resource = await prisma.resource.findUnique({
    where: { id },
  });

  if (!resource) {
    return {
      title: '资源未找到',
    };
  }

  return {
    title: `${resource.name} - 绝世百宝箱`,
    description: resource.description || `查看 ${resource.name} 的详细信息`,
  };
}

export default async function ResourceDetailPage({ params }: Props) {
  const { id } = await params;
  
  const resource = await prisma.resource.findUnique({
    where: { id },
  });

  if (!resource) {
    notFound();
  }

  const categoryLabels: Record<string, string> = {
    life: '海外生活',
    logistics: '跨境物流',
    business: '商业服务',
    tools: '实用工具',
    templates: '模板资源',
    education: '教育培训',
    official: '官方网站',
    payment: '支付收款',
    ecommerce: '电商平台',
  };

  const categoryLabel = categoryLabels[resource.category] || resource.category;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回资源导航
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8">
            <div className="flex items-start gap-6">
              {/* Logo */}
              <div className="shrink-0 w-20 h-20 rounded-2xl bg-white border-2 border-purple-200 flex items-center justify-center shadow-sm">
                {resource.iconUrl || resource.favicon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resource.iconUrl || resource.favicon || ''}
                    alt={resource.name}
                    className="w-14 h-14 object-contain"
                  />
                ) : (
                  <span className="text-3xl font-bold text-purple-600">
                    {resource.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Title & Meta */}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {resource.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    <Tag className="w-3.5 h-3.5" />
                    {categoryLabel}
                  </span>
                  
                  {resource.qualityScore > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                      <Star className="w-3.5 h-3.5" />
                      质量评分 {resource.qualityScore}/100
                    </span>
                  )}

                  {resource.language && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      <Globe className="w-3.5 h-3.5" />
                      {resource.language === 'en' ? '英文' : resource.language === 'zh' ? '中文' : resource.language}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    访问网站
                  </a>
                  
                  <FavoriteButton
                    resourceUrl={resource.url}
                    title={resource.name}
                    resourceType="url"
                    size="md"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="p-8 space-y-6">
            {/* Description */}
            {resource.description && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  网站介绍
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {resource.description}
                </p>
              </section>
            )}

            {/* Usage */}
            {resource.usage && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  使用场景
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">
                    {resource.usage}
                  </p>
                </div>
              </section>
            )}

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-purple-600" />
                  标签
                </h2>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-purple-100 hover:text-purple-700 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Metadata */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                资源信息
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">资源类型</span>
                  <span className="text-gray-900 font-medium">
                    {resource.sourceType === 'official' ? '官方网站' : 
                     resource.sourceType === 'third-party' ? '第三方资源' : 
                     resource.sourceType === 'internal' ? '内部资源' : resource.sourceType}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">收录时间</span>
                  <span className="text-gray-900 font-medium">
                    {new Date(resource.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                {resource.domainAge && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">域名年龄</span>
                    <span className="text-gray-900 font-medium">
                      {Math.floor(resource.domainAge / 365)} 年
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">最后更新</span>
                  <span className="text-gray-900 font-medium">
                    {new Date(resource.updatedAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>
            </section>

            {/* Disclaimer */}
            {resource.disclaimer && (
              <section>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="font-semibold text-amber-900 mb-1">免责声明</h3>
                      <p className="text-sm text-amber-800 leading-relaxed">
                        {resource.disclaimer}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* CTA */}
            <section className="pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-gray-600 text-sm">
                  觉得这个资源有用？收藏它方便下次访问
                </p>
                <div className="flex items-center gap-3">
                  <FavoriteButton
                    resourceUrl={resource.url}
                    title={resource.name}
                    resourceType="url"
                    size="md"
                  />
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    立即访问
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
