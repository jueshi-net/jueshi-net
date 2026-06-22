"use client";

import { useState } from "react";
import Link from "next/link";
import { Pin, Star, EyeOff, Eye, Lock, Unlock, Flag, MessageSquare } from "lucide-react";

interface PostItem {
  id: string; slug: string; title: string; status: string; isPinned: boolean; isLocked: boolean;
  viewCount: number; createdAt: string;
  user: { name: string | null; email: string; image: string | null };
  category: { name: string; key: string };
  _count: { comments: number; reports: number };
}

export function AdminPostsManager({ posts, currentStatus }: { posts: PostItem[]; currentStatus: string }) {
  const [postList, setPostList] = useState(posts);
  const [message, setMessage] = useState("");

  async function moderate(id: string, action: string) {
    const res = await fetch(`/api/admin/community/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      setMessage(`✅ 操作成功: ${action}`);
      // Update local state
      setPostList(prev => prev.map(p => {
        if (p.id !== id) return p;
        switch (action) {
          case "publish": return { ...p, status: "published" };
          case "hide": return { ...p, status: "hidden" };
          case "pin": return { ...p, isPinned: !p.isPinned };
          case "lock": return { ...p, isLocked: !p.isLocked };
          default: return p;
        }
      }));
    } else { setMessage("❌ 操作失败"); }
  }

  const statusColors: Record<string, string> = {
    published: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    hidden: "bg-red-100 text-red-700",
    deleted: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">帖子管理</h1>
        <div className="flex gap-2">
          <Link href="/admin/community/posts" className={`px-3 py-1.5 rounded-lg text-sm ${!currentStatus ? "bg-teal-600 text-white" : "bg-gray-100"}`}>全部</Link>
          {["pending", "published", "hidden"].map(s => (
            <Link key={s} href={`/admin/community/posts?status=${s}`} className={`px-3 py-1.5 rounded-lg text-sm ${currentStatus === s ? "bg-teal-600 text-white" : "bg-gray-100"}`}>{s}</Link>
          ))}
        </div>
      </div>

      {message && <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm">{message}</div>}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">标题</th>
              <th className="text-left px-4 py-3 font-medium">作者</th>
              <th className="text-left px-4 py-3 font-medium">状态</th>
              <th className="text-center px-4 py-3 font-medium">评论</th>
              <th className="text-center px-4 py-3 font-medium">举报</th>
              <th className="text-left px-4 py-3 font-medium">时间</th>
              <th className="text-center px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {postList.map(p => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {p.isPinned && <Pin className="w-3 h-3 text-amber-500" />}
                    <Link href={`/community/t/${p.slug}`} className="font-medium text-gray-900 hover:underline truncate max-w-xs">{p.title}</Link>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{p.user.name || p.user.email}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${statusColors[p.status]}`}>{p.status}</span></td>
                <td className="px-4 py-3 text-center">{p._count.comments}</td>
                <td className="px-4 py-3 text-center">{p._count.reports > 0 ? <span className="text-red-500">{p._count.reports}</span> : 0}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString("zh-CN")}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-center">
                    {p.status === "pending" && <button onClick={() => moderate(p.id, "publish")} title="通过" className="p-1 text-green-600 hover:bg-green-50 rounded"><Eye className="w-4 h-4" /></button>}
                    {p.status === "published" && <button onClick={() => moderate(p.id, "hide")} title="隐藏" className="p-1 text-red-500 hover:bg-red-50 rounded"><EyeOff className="w-4 h-4" /></button>}
                    {p.status === "hidden" && <button onClick={() => moderate(p.id, "publish")} title="恢复" className="p-1 text-green-600 hover:bg-green-50 rounded"><Eye className="w-4 h-4" /></button>}
                    <button onClick={() => moderate(p.id, "pin")} title="置顶" className={`p-1 rounded hover:bg-amber-50 ${p.isPinned ? "text-amber-500" : "text-gray-400"}`}><Pin className="w-4 h-4" /></button>
                    <button onClick={() => moderate(p.id, "feature")} title="加精" className="p-1 text-purple-500 hover:bg-purple-50 rounded"><Star className="w-4 h-4" /></button>
                    <button onClick={() => moderate(p.id, "lock")} title="锁定" className={`p-1 rounded hover:bg-red-50 ${p.isLocked ? "text-red-500" : "text-gray-400"}`}><Lock className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {postList.length === 0 && <div className="text-center py-8 text-gray-400">暂无帖子</div>}
      </div>
    </div>
  );
}
