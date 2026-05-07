import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { FileText, CalendarDays, Eye, Clock, Search, Tag } from 'lucide-react';

export const metadata: Metadata = {
  title: '出海指南 - 跨境寄送、海外生活、出海经营实用文章',
  description: '汇集跨境物流、海外生活、出海经营的实用指南与经验文章，帮助出海华人高效解决实际问题。',
};

const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: '跨境寄送', label: '跨境寄送' },
  { key: '海外生活', label: '海外生活' },
  { key: '出海经营', label: '出海经营' },
];

function estimateReadingTime(content: string): number {
  // Chinese characters: ~500 chars per minute, English words: ~200 per minute
  const charCount = content.length;
  return Math.max(1, Math.ceil(charCount / 500));
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getCategoryColor(category: string | null): string {
  switch (category) {
    case '跨境寄送':
      return 'bg-blue-100 text-blue-700';
    case '海外生活':
      return 'bg-green-100 text-green-700';
    case '出海经营':
      return 'bg-purple-100 text-purple-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

interface GuidesPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function GuidesPage({ searchParams }: GuidesPageProps) {
  const { category } = await searchParams;
  const activeCategory = CATEGORIES.find(c => c.key === category)?.key ?? 'all';

  const articles = await prisma.article.findMany({
    where: {
      status: 'published',
      ...(activeCategory !== 'all' ? { category: activeCategory } : {}),
    },
    include: {
      tags: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-500 via-teal-600 to-blue-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="w-8 h-8" />
            <h1 className="text-3xl md:text-4xl font-bold">出海指南</h1>
          </div>
          <p className="text-lg text-teal-100 max-w-2xl mx-auto">
            汇集跨境物流、海外生活、出海经营的实用指南与经验文章
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-16">
        {/* Category Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <Link
                key={cat.key}
                href={`/guides${cat.key !== 'all' ? `?category=${cat.key}` : ''}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
          <div className="flex-1" />
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
            <Search className="w-4 h-4" />
            <span>{articles.length} 篇文章</span>
          </div>
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无文章</h3>
            <p className="text-gray-500">该分类下还没有发布的文章</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => {
              const readingTime = estimateReadingTime(article.content);
              const publishedDate = article.publishedAt ?? article.createdAt;

              return (
                <Link
                  key={article.id}
                  href={`/guides/${article.slug}`}
                  className="group bg-white rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all overflow-hidden flex flex-col"
                >
                  {/* Cover Image */}
                  {article.coverImage && (
                    <div className="w-full h-48 bg-gray-100 overflow-hidden">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-1">
                    {/* Category Badge */}
                    {article.category && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit mb-3 ${getCategoryColor(article.category)}`}>
                        {article.category}
                      </span>
                    )}

                    {/* Title */}
                    <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors line-clamp-2">
                      {article.title}
                    </h2>

                    {/* Excerpt */}
                    {article.excerpt && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-3 flex-1">
                        {article.excerpt}
                      </p>
                    )}

                    {/* Tags */}
                    {article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {article.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                          >
                            <Tag className="w-3 h-3" />
                            {tag.tag}
                          </span>
                        ))}
                        {article.tags.length > 3 && (
                          <span className="text-xs text-gray-400">+{article.tags.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 border-t border-gray-100">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {formatDate(publishedDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {readingTime} 分钟
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {article.views}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
