/**
 * Tool History Panel — shows document version history with restore capability.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, RotateCcw, Loader2 } from "lucide-react";

interface HistoryEntry {
  id: string;
  snapshotJson: string;
  action: string;
  createdAt: string;
}

interface ToolHistoryPanelProps {
  documentId: string;
  toolKey: string;
  onRestore: (snapshotJson: string) => void;
}

export default function ToolHistoryPanel({ documentId, toolKey, onRestore }: ToolHistoryPanelProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/me/tool-documents/${documentId}/history`);
      if (res.ok) {
        const json = await res.json();
        setHistory(json.data || []);
        setOpen(true);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [documentId]);

  const handleRestore = useCallback(async (historyId: string) => {
    try {
      const res = await fetch(`/api/me/tool-documents/${documentId}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ historyId }),
      });
      if (res.ok) {
        const json = await res.json();
        // Restore the actual dataJson from history snapshot
        const historyEntry = history.find(h => h.id === historyId);
        if (historyEntry) {
          onRestore(historyEntry.snapshotJson);
        }
        setOpen(false);
      }
    } catch { /* ignore */ }
  }, [documentId, history, onRestore]);

  if (!open) {
    return (
      <button
        onClick={loadHistory}
        disabled={loading}
        className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 min-h-[44px]"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Clock className="w-4 h-4" /> 历史版本</>}
      </button>
    );
  }

  return (
    <div className="relative">
      <div className="absolute right-0 top-full mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
        <div className="p-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">历史版本</span>
          <button onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">关闭</button>
        </div>
        {history.length === 0 ? (
          <div className="p-4 text-sm text-gray-400 text-center">暂无历史版本</div>
        ) : (
          history.map((h) => (
            <div key={h.id} className="px-3 py-2 border-b border-gray-50 hover:bg-gray-50 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-gray-700">
                  {h.action === "create" ? "创建" : h.action === "update" ? "更新" : "恢复"}
                </div>
                <div className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleString("zh-CN")}</div>
              </div>
              <button
                onClick={() => handleRestore(h.id)}
                className="p-1 text-teal-600 hover:text-teal-700"
                title="恢复到此版本"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
