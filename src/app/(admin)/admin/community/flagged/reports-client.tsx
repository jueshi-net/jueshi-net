"use client";

import { useState } from "react";
import Link from "next/link";
import { Flag, Check, X } from "lucide-react";

interface ReportItem {
  id: string; reason: string; description: string | null; status: string; createdAt: string;
  reporter: { name: string | null; email: string };
  post: { title: string; slug: string; content: string } | null;
  comment: { content: string } | null;
}

export function AdminReportsManager({ reports }: { reports: ReportItem[] }) {
  const [list, setList] = useState(reports);
  const [message, setMessage] = useState("");

  async function resolve(id: string, resolution: string) {
    const res = await fetch(`/api/admin/community/flagged/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolution }),
    });
    if (res.ok) {
      setMessage(`✅ 举报已处理: ${resolution === "action_taken" ? "举报成立" : "驳回"}`);
      setList(prev => prev.filter(r => r.id !== id));
    } else { setMessage("❌ 操作失败"); }
  }

  const reasonLabels: Record<string, string> = {
    spam: "垃圾广告", abuse: "辱骂攻击", harassment: "骚扰", illegal: "违法内容", other: "其他",
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Flag className="w-6 h-6 text-red-500" /> 举报处理
      </h1>

      {message && <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm">{message}</div>}

      <div className="space-y-3">
        {list.map(r => (
          <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">{reasonLabels[r.reason] || r.reason}</span>
              <span className="text-sm text-gray-600">举报人: {r.reporter.name || r.reporter.email}</span>
              <span className="text-xs text-gray-400 ml-auto">{new Date(r.createdAt).toLocaleString("zh-CN")}</span>
            </div>

            {r.description && <p className="text-sm text-gray-500 mb-2">说明: {r.description}</p>}

            {r.post ? (
              <div className="rounded-lg bg-gray-50 p-3 mb-3">
                <div className="text-xs text-gray-400 mb-1">被举报帖子:</div>
                <Link href={`/community/t/${r.post.slug}`} className="font-medium text-gray-900 hover:underline">{r.post.title}</Link>
                <p className="text-sm text-gray-600 mt-1 line-clamp-3">{r.post.content}</p>
              </div>
            ) : r.comment ? (
              <div className="rounded-lg bg-gray-50 p-3 mb-3">
                <div className="text-xs text-gray-400 mb-1">被举报评论:</div>
                <p className="text-sm text-gray-600">{r.comment.content}</p>
              </div>
            ) : null}

            <div className="flex gap-2">
              <button onClick={() => resolve(r.id, "action_taken")} className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                <Check className="w-4 h-4" /> 举报成立
              </button>
              <button onClick={() => resolve(r.id, "no_action")} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                <X className="w-4 h-4" /> 驳回
              </button>
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="text-center py-8 text-gray-400">暂无待处理举报 🎉</div>}
      </div>
    </div>
  );
}
