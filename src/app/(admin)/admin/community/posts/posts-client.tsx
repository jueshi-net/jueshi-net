"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Pin,
  Star,
  EyeOff,
  Eye,
  Lock,
  Unlock,
  Search,
  MessageSquare,
  Flag,
} from "lucide-react";

interface PostItem {
  id: string;
  slug: string;
  title: string;
  status: string;
  isPinned: boolean;
  isLocked: boolean;
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
  user: { name: string | null; email: string; image: string | null };
  category: { name: string; key: string };
  _count: { comments: number; reports: number };
}

interface CategoryOption {
  id: string;
  name: string;
  key: string;
}

const STATUS_FILTERS = [
  { value: "", label: "全部" },
  { value: "pending", label: "待审核" },
  { value: "published", label: "已发布" },
  { value: "hidden", label: "已隐藏" },
];

const STATUS_COLORS: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  hidden: "bg-red-100 text-red-700",
  deleted: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<string, string> = {
  published: "已发布",
  pending: "待审核",
  hidden: "已隐藏",
  deleted: "已删除",
};

export function AdminPostsManager({
  posts,
  currentStatus,
  currentCategory,
  currentQ,
  categories,
}: {
  posts: PostItem[];
  currentStatus: string;
  currentCategory: string;
  currentQ: string;
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [postList, setPostList] = useState(posts);
  const [message, setMessage] = useState("");
  const [searchInput, setSearchInput] = useState(currentQ);

  // Build a URL preserving sibling filters while overriding one.
  function buildHref(override: { q?: string; category?: string; status?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if ("q" in override) {
      override.q ? params.set("q", override.q) : params.delete("q");
    }
    if ("category" in override) {
      override.category
        ? params.set("category", override.category)
        : params.delete("category");
    }
    if ("status" in override) {
      override.status ? params.set("status", override.status) : params.delete("status");
    }
    const qs = params.toString();
    return qs ? `/admin/community/posts?${qs}` : "/admin/community/posts";
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildHref({ q: searchInput.trim() }));
  }

  function handleCategoryChange(value: string) {
    router.push(buildHref({ category: value }));
  }

  async function moderate(id: string, action: string) {
    const res = await fetch(`/api/admin/community/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      setMessage(`✅ 操作成功: ${action}`);
      setPostList((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          switch (action) {
            case "publish":
              return { ...p, status: "published" };
            case "hide":
              return { ...p, status: "hidden" };
            case "pin":
              return { ...p, isPinned: !p.isPinned };
            case "feature":
              return { ...p, isFeatured: !p.isFeatured };
            case "lock":
              return { ...p, isLocked: !p.isLocked };
            default:
              return p;
          }
        })
      );
    } else {
      setMessage("❌ 操作失败");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">帖子管理</h1>
        {/* 状态筛选 */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <Link
              key={s.value}
              href={buildHref({ status: s.value })}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                currentStatus === s.value
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {/* 搜索 + 分类筛选 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="按标题搜索..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </form>
        <select
          value={currentCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white min-w-[160px]"
        >
          <option value="">全部分类</option>
          {categories.map((c) => (
            <option key={c.id} value={c.key}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {message && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm">
          {message}
        </div>
      )}

      {/* 帖子列表 - 桌面表格 */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">标题</th>
              <th className="text-left px-4 py-3 font-medium">作者</th>
              <th className="text-left px-4 py-3 font-medium">分类</th>
              <th className="text-left px-4 py-3 font-medium">状态</th>
              <th className="text-left px-4 py-3 font-medium">时间</th>
              <th className="text-center px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {postList.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {p.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                    {p.isFeatured && (
                      <Star className="w-3.5 h-3.5 text-purple-500 shrink-0 fill-purple-500" />
                    )}
                    {p.isLocked && <Lock className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                    <Link
                      href={`/community/t/${p.slug}`}
                      className="font-medium text-gray-900 hover:underline truncate max-w-[220px]"
                    >
                      {p.title}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span className="inline-flex items-center gap-0.5">
                      <MessageSquare className="w-3 h-3" /> {p._count.comments}
                    </span>
                    {p._count.reports > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-red-500">
                        <Flag className="w-3 h-3" /> {p._count.reports}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {p.user.name || p.user.email}
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {p.category.name}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      STATUS_COLORS[p.status] || "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {STATUS_LABELS[p.status] || p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                  {new Date(p.createdAt).toLocaleDateString("zh-CN")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-center">
                    {p.status === "pending" && (
                      <button
                        onClick={() => moderate(p.id, "publish")}
                        title="通过"
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    {p.status === "published" && (
                      <button
                        onClick={() => moderate(p.id, "hide")}
                        title="隐藏"
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                    )}
                    {p.status === "hidden" && (
                      <button
                        onClick={() => moderate(p.id, "publish")}
                        title="恢复"
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => moderate(p.id, "pin")}
                      title={p.isPinned ? "取消置顶" : "置顶"}
                      className={`p-1 rounded hover:bg-amber-50 ${
                        p.isPinned ? "text-amber-500" : "text-gray-400"
                      }`}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moderate(p.id, "feature")}
                      title={p.isFeatured ? "取消加精" : "加精"}
                      className={`p-1 rounded hover:bg-purple-50 ${
                        p.isFeatured ? "text-purple-500" : "text-gray-400"
                      }`}
                    >
                      <Star className={`w-4 h-4 ${p.isFeatured ? "fill-purple-500" : ""}`} />
                    </button>
                    <button
                      onClick={() => moderate(p.id, "lock")}
                      title={p.isLocked ? "解锁" : "锁定"}
                      className={`p-1 rounded hover:bg-red-50 ${
                        p.isLocked ? "text-red-500" : "text-gray-400"
                      }`}
                    >
                      {p.isLocked ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <Unlock className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {postList.length === 0 && (
          <div className="text-center py-8 text-gray-400">暂无帖子</div>
        )}
      </div>

      {/* 帖子列表 - 移动端卡片 */}
      <div className="md:hidden space-y-3">
        {postList.map((p) => (
          <div key={p.id} className="rounded-lg border border-gray-200 p-3 bg-white">
            <div className="flex items-start gap-1.5 mb-1.5">
              {p.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />}
              {p.isFeatured && (
                <Star className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5 fill-purple-500" />
              )}
              {p.isLocked && <Lock className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />}
              <Link
                href={`/community/t/${p.slug}`}
                className="font-medium text-gray-900 hover:underline text-sm flex-1 min-w-0"
              >
                {p.title}
              </Link>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap mb-2">
              <span className="text-gray-600">{p.user.name || p.user.email}</span>
              <span>·</span>
              <span>{p.category.name}</span>
              <span>·</span>
              <span
                className={`px-1.5 py-0.5 rounded ${
                  STATUS_COLORS[p.status] || "bg-gray-100 text-gray-500"
                }`}
              >
                {STATUS_LABELS[p.status] || p.status}
              </span>
              <span>·</span>
              <span>{new Date(p.createdAt).toLocaleDateString("zh-CN")}</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {p.status === "pending" && (
                <button
                  onClick={() => moderate(p.id, "publish")}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs text-green-700 bg-green-50 rounded hover:bg-green-100"
                >
                  <Eye className="w-3 h-3" /> 通过
                </button>
              )}
              {p.status === "published" && (
                <button
                  onClick={() => moderate(p.id, "hide")}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100"
                >
                  <EyeOff className="w-3 h-3" /> 隐藏
                </button>
              )}
              {p.status === "hidden" && (
                <button
                  onClick={() => moderate(p.id, "publish")}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs text-green-700 bg-green-50 rounded hover:bg-green-100"
                >
                  <Eye className="w-3 h-3" /> 恢复
                </button>
              )}
              <button
                onClick={() => moderate(p.id, "pin")}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${
                  p.isPinned
                    ? "text-amber-700 bg-amber-50"
                    : "text-gray-500 bg-gray-50"
                }`}
              >
                <Pin className="w-3 h-3" /> {p.isPinned ? "取消置顶" : "置顶"}
              </button>
              <button
                onClick={() => moderate(p.id, "feature")}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${
                  p.isFeatured
                    ? "text-purple-700 bg-purple-50"
                    : "text-gray-500 bg-gray-50"
                }`}
              >
                <Star className="w-3 h-3" /> {p.isFeatured ? "取消加精" : "加精"}
              </button>
              <button
                onClick={() => moderate(p.id, "lock")}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${
                  p.isLocked ? "text-red-600 bg-red-50" : "text-gray-500 bg-gray-50"
                }`}
              >
                {p.isLocked ? (
                  <Lock className="w-3 h-3" />
                ) : (
                  <Unlock className="w-3 h-3" />
                )}
                {p.isLocked ? "解锁" : "锁定"}
              </button>
            </div>
          </div>
        ))}
        {postList.length === 0 && (
          <div className="text-center py-8 text-gray-400">暂无帖子</div>
        )}
      </div>
    </div>
  );
}
