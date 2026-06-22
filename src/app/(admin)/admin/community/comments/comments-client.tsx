"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

interface CommentItem {
  id: string; content: string; status: string; createdAt: string;
  user: { name: string | null; email: string };
  post: { title: string; slug: string };
}

export function AdminCommentsManager({ comments, currentStatus }: { comments: CommentItem[]; currentStatus: string }) {
  const [list, setList] = useState(comments);
  const [message, setMessage] = useState("");

  async function moderate(id: string, action: string) {
    const res = await fetch(`/api/admin/community/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      setMessage(`✅ 操作成功`);
      setList(prev => prev.map(c => c.id === id ? { ...c, status: action === "publish" ? "published" : "hidden" } : c));
    } else { setMessage("❌ 操作失败"); }
  }

  const statusColors: Record<string, string> = {
    published: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    hidden: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">评论管理</h1>
        <div className="flex gap-2">
          <Link href="/admin/community/comments" className={`px-3 py-1.5 rounded-lg text-sm ${!currentStatus ? "bg-teal-600 text-white" : "bg-gray-100"}`}>全部</Link>
          {["pending", "published", "hidden"].map(s => (
            <Link key={s} href={`/admin/community/comments?status=${s}`} className={`px-3 py-1.5 rounded-lg text-sm ${currentStatus === s ? "bg-teal-600 text-white" : "bg-gray-100"}`}>{s}</Link>
          ))}
        </div>
      </div>

      {message && <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm">{message}</div>}

      <div className="space-y-2">
        {list.map(c => (
          <div key={c.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-sm text-gray-900">{c.user.name || c.user.email}</span>
              <span className={`px-2 py-0.5 rounded text-xs ${statusColors[c.status]}`}>{c.status}</span>
              <Link href={`/community/t/${c.post.slug}`} className="text-xs text-teal-600 hover:underline">回复: {c.post.title}</Link>
              <span className="text-xs text-gray-400 ml-auto">{new Date(c.createdAt).toLocaleString("zh-CN")}</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">{c.content}</p>
            <div className="flex gap-2">
              {c.status === "pending" && <button onClick={() => moderate(c.id, "publish")} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100"><Eye className="w-3 h-3" />通过</button>}
              {c.status !== "hidden" && <button onClick={() => moderate(c.id, "hide")} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100"><EyeOff className="w-3 h-3" />隐藏</button>}
              {c.status === "hidden" && <button onClick={() => moderate(c.id, "publish")} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100"><Eye className="w-3 h-3" />恢复</button>}
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="text-center py-8 text-gray-400">暂无评论</div>}
      </div>
    </div>
  );
}
