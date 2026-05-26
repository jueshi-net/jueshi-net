"use client";

import { useState, useEffect } from "react";
import { History, Undo2, Clock, X, Loader2 } from "lucide-react";

interface HistoryEntry {
  id: string;
  action: string;
  snapshotJson: string;
  createdAt: string;
}

interface ToolHistoryPanelProps {
  documentId: string;
  toolKey: string;
  onRestore: (snapshotJson: string) => void;
}

export default function ToolHistoryPanel({ documentId, toolKey, onRestore }: ToolHistoryPanelProps) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    if (!documentId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/me/tool-documents/${documentId}/history`);
      if (res.ok) {
        const d = await res.json();
        setHistory(d.data || []);
      } else {
        setError("获取历史失败");
      }
    } catch { setError("网络错误"); }
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchHistory();
  }, [open, documentId]);

  const handleRestore = async (entry: HistoryEntry) => {
    if (!confirm("确定要恢复到此历史版本吗？当前未保存的修改将被覆盖。")) return;
    setRestoring(entry.id);
    setError("");
    try {
      const res = await fetch(`/api/me/tool-documents/${documentId}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ historyId: entry.id }),
      });
      if (res.ok) {
        const d = await res.json();
        // Extract dataJson from the restored document
        if (d.data?.dataJson) {
          onRestore(d.data.dataJson);
        }
        setError("");
        setOpen(false);
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "恢复失败");
      }
    } catch { setError("网络错误"); }
    setRestoring(null);
  };

  const actionLabel = (action: string) => {
    switch (action) {
      case "create": return "创建";
      case "update": return "编辑";
      case "restore": return "恢复";
      default: return action;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 min-h-[44px]"
      >
        <History className="w-4 h-4" /> 历史
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <h4 className="text-sm font-bold">历史版本</h4>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded min-h-[32px] min-w-[32px] flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            {loading && <div className="px-4 py-8 text-center text-sm text-gray-400"><Loader2 className="w-4 h-4 animate-spin inline mr-2" />加载中...</div>}
            {!loading && error && <div className="px-4 py-3 text-sm text-red-600">{error}</div>}
            {!loading && history.length === 0 && <div className="px-4 py-8 text-center text-sm text-gray-400">暂无历史记录</div>}
            {!loading && history.map((entry, idx) => (
              <div key={entry.id} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">{actionLabel(entry.action)}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(entry.createdAt).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div className="text-xs text-gray-500 mb-2 truncate">
                  {entry.snapshotJson ? (() => {
                    try { const d = JSON.parse(entry.snapshotJson); return d.items?.length ? `${d.items.length} 个商品` : d.title || "已保存"; } catch { return "已保存"; }
                  })() : "已保存"}
                </div>
                <button
                  onClick={() => handleRestore(entry)}
                  disabled={restoring === entry.id}
                  className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 disabled:opacity-50 min-h-[32px]"
                >
                  {restoring === entry.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Undo2 className="w-3 h-3" />}
                  恢复此版本
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
