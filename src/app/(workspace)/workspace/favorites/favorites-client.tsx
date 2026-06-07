"use client";

import { useState } from "react";
import { Heart, ExternalLink, Star, Trash2 } from "lucide-react";
import Link from "next/link";

export default function FavoritesClient({ favorites }: { favorites: any[] }) {
  const [filter, setFilter] = useState<"all" | "tool" | "topic" | "article">("all");

  const filtered = filter === "all" ? favorites : favorites.filter(f => f.resourceType === filter);
  const types = [...new Set(favorites.map(f => f.resourceType))];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-red-500" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">我的收藏</h1>
            <p className="text-sm text-gray-500">收藏的工具、专题和资源</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      {types.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === "all" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            全部 ({favorites.length})
          </button>
          {types.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === t ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {t === "tool" ? "工具" : t === "topic" ? "专题" : "文章"} ({favorites.filter(f => f.resourceType === t).length})
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
          <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-1">还没有收藏任何资源</p>
          <p className="text-sm text-gray-400 mb-4">浏览工具中心和专题库，点击收藏按钮即可添加</p>
          <Link href="/tools" className="inline-flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700">
            去发现工具 <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(fav => (
            <div key={fav.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:border-teal-200 hover:shadow-sm transition-all group">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl shrink-0">
                  {fav.resourceType === "topic" ? "📚" : fav.resourceType === "article" ? "📝" : "🔧"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-gray-900 group-hover:text-teal-700 truncate">{fav.title}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {fav.resourceType} · {new Date(fav.createdAt).toLocaleDateString("zh-CN")}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={fav.resourceUrl} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-medium hover:bg-teal-100 transition-colors">
                  查看 <ExternalLink className="w-3 h-3" />
                </Link>
                <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
