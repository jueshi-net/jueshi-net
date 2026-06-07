"use client";

import Link from "next/link";
import { Heart, ExternalLink } from "lucide-react";

export default function FavoritesClient({ favorites }: { favorites: any[] }) {
  if (favorites.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Heart className="w-5 h-5 text-red-500 fill-red-500" /> 我的收藏</h1>
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Heart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium mb-2">还没有收藏任何资源</p>
          <p className="text-sm text-gray-400 mb-6">浏览工具中心和专题库，点击红心图标即可收藏</p>
          <Link href="/tools" className="inline-flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700">
            去发现工具 <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Heart className="w-5 h-5 text-red-500 fill-red-500" /> 我的收藏</h1>
      <div className="grid sm:grid-cols-2 gap-3">
        {favorites.map(f => (
          <Link key={f.id} href={f.resourceUrl} className="bg-white border rounded-xl p-4 hover:border-teal-200 hover:shadow-sm transition-all group min-h-[80px]">
            <div className="font-medium text-sm text-gray-900 group-hover:text-teal-700 truncate">{f.title}</div>
            <div className="text-xs text-gray-400 mt-1">{f.resourceType} · {new Date(f.createdAt).toLocaleDateString("zh-CN")}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
