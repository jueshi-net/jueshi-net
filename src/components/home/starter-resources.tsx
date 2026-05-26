'use client';

import { starterResources, starterCategories, getResourcesByCategory } from '@/lib/data/starter-resources';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export function StarterResourcesSection() {
  const [activeCategory, setActiveCategory] = useState<string>('starter');

  const resources = getResourcesByCategory(activeCategory);
  const category = starterCategories.find(c => c.slug === activeCategory);

  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">
            刚能访问外网？先看这个
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            常用软件、学习资源、AI 工具、视频平台、信息渠道，一次整理清楚。
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {starterCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.slug
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Category Description */}
        {category && (
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500">{category.description}</p>
          </div>
        )}

        {/* Resource Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-200 hover:border-primary/30"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{resource.icon}</span>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {resource.title}
                  </h3>
                </div>
                {resource.isRecommended && (
                  <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                    推荐
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                {resource.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {resource.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action */}
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                前往使用
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-10">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            浏览更多资源
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
