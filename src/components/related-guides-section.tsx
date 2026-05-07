'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';

interface Guide {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
}

export function RelatedGuidesSection({ slugs }: { slugs: string[] }) {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/guides?slugs=${slugs.join(',')}`)
      .then(res => res.json())
      .then(data => {
        setGuides(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slugs]);

  if (loading || guides.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-5 h-5 text-teal-600" />
        <h2 className="text-xl font-bold text-gray-900">相关教程</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-teal-300 transition-all group"
          >
            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">
              {guide.title}
            </h3>
            {guide.excerpt && (
              <p className="text-sm text-gray-500 line-clamp-3 mb-3">
                {guide.excerpt}
              </p>
            )}
            <div className="flex items-center gap-1 text-teal-600 text-sm font-medium">
              阅读教程 <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
