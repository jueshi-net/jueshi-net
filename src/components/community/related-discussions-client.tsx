"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, ArrowRight, Loader2 } from "lucide-react";

interface RelatedPost {
  id: string;
  slug: string;
  title: string;
  userName: string;
  commentCount: number;
  categoryName: string;
}

export function RelatedDiscussionsClient({ tool }: { tool: string }) {
  const [posts, setPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/forum/related-discussions?tool=${encodeURIComponent(tool)}`)
      .then((r) => r.json())
      .then((data) => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tool]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto mt-8 px-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          <span className="text-sm text-gray-400">加载相关讨论…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 px-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">相关讨论</h3>
          <Link
            href={`/community/new?tool=${encodeURIComponent(tool)}`}
            className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700"
          >
            发起讨论 <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {posts.length === 0 ? (
          <div>
            <p className="text-xs text-gray-400 mb-3">还没有相关讨论</p>
            <Link
              href={`/community/new?tool=${encodeURIComponent(tool)}`}
              className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700"
            >
              发起相关讨论 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/community/t/${post.slug}`}
                className="block rounded-lg hover:bg-gray-50 p-2 transition"
              >
                <div className="text-sm font-medium text-gray-900 truncate">
                  {post.title}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <span>{post.userName}</span>
                  <span className="inline-flex items-center gap-0.5">
                    <MessageSquare className="w-3 h-3" />
                    {post.commentCount}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-gray-100">
                    {post.categoryName}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
