"use client";

import { useState, useEffect } from "react";
import { Star, ExternalLink, Trash2, FolderOpen, Loader2, Search, X, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FavoriteItem {
  id: string;
  linkId: string;
  title: string;
  url: string;
  description: string;
  icon: string;
  category: string;
  categoryIcon: string;
  clicks: number;
  createdAt: string;
}

export default function FavoritesClient({ userId, initialCount }: { userId: string; initialCount: number }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const [count, setCount] = useState(initialCount);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/favorites");
      const data = await res.json();
      if (data.success) {
        setFavorites(data.data || []);
        setCount(data.data?.length || 0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (linkId: string) => {
    setRemoving(linkId);
    try {
      const res = await fetch(`/api/favorites?linkId=${linkId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setFavorites((prev) => prev.filter((f) => f.linkId !== linkId));
        setCount((c) => c - 1);
      }
    } finally {
      setRemoving(null);
    }
  };

  const filtered = favorites.filter((f) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      f.title.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.url.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
    );
  });

  // Group by category
  const grouped: Record<string, FavoriteItem[]> = {};
  filtered.forEach((f) => {
    const cat = f.category || "未分类";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(f);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Star className="w-7 h-7 fill-current" />
              我的收藏
            </h1>
          </div>
          <p className="text-orange-100 text-lg">{count} 个收藏的网站和工具</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6 pb-10">
        {/* Search */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索收藏..."
              className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Favorites List */}
        {count === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无收藏</h3>
            <p className="text-gray-500 mb-6">去导航页点击 ⭐ 收藏喜欢的网站吧</p>
            <Link href="/nav" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600">
              浏览网址导航
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p>没有找到匹配的收藏</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {items[0]?.categoryIcon && <span>{items[0].categoryIcon}</span>}
                    {category}
                    <span className="text-xs font-normal text-gray-400">({items.length})</span>
                  </h2>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                    >
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 overflow-hidden">
                        {item.url.startsWith("http") ? (
                          <img
                            src={`https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(item.url)}&size=32`}
                            alt=""
                            className="w-7 h-7 object-contain"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <span className="text-xl hidden">{item.icon || "🔗"}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {item.title}
                          </h3>
                          <span className="text-xs text-yellow-500">⭐</span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">{item.description}</p>
                        )}
                        <p className="text-xs text-gray-300 dark:text-gray-600 truncate mt-0.5">{item.url}</p>
                      </div>

                      {/* Stats */}
                      <div className="hidden sm:flex items-center gap-3 text-xs text-gray-400 shrink-0">
                        <span>{item.clicks} 次点击</span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleDateString("zh-CN")}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="访问网站"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleRemove(item.linkId)}
                          disabled={removing === item.linkId}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                          title="取消收藏"
                        >
                          {removing === item.linkId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
