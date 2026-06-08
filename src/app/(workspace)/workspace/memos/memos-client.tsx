"use client";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, X, Pin, PinOff } from "lucide-react";

interface Memo {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function MemosClient() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchMemos = async () => {
    try {
      const res = await fetch("/api/workspace/memos");
      if (res.ok) setMemos(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMemos(); }, []);

  const handleCreate = async () => {
    const res = await fetch("/api/workspace/memos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle || "无标题备忘", content: newContent }),
    });
    if (res.ok) {
      setNewTitle(""); setNewContent(""); setShowForm(false);
      fetchMemos();
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Memo>) => {
    const res = await fetch(`/api/workspace/memos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) fetchMemos();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这条备忘吗？")) return;
    const res = await fetch(`/api/workspace/memos/${id}`, { method: "DELETE" });
    if (res.ok) fetchMemos();
  };

  const sorted = [...memos].sort((a, b) => (Number(b.isPinned) - Number(a.isPinned)) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  if (loading) return <div className="p-8 text-center text-gray-400">加载中...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">备忘录</h1>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700">
          <Plus className="w-4 h-4" /> 新建备忘
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <input type="text" placeholder="标题" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          <textarea placeholder="内容..." value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 rounded-lg">取消</button>
            <button onClick={handleCreate} className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700">保存</button>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {sorted.length === 0 ? (
          <div className="col-span-full bg-white border border-gray-100 rounded-xl p-12 text-center">
            <Pin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">暂无备忘录</p>
            <p className="text-xs text-gray-400">点击新建备忘开始记录</p>
          </div>
        ) : sorted.map(memo => (
          <MemoCard key={memo.id} memo={memo} isEditing={editingId === memo.id} onEdit={() => setEditingId(memo.id)} onDelete={() => handleDelete(memo.id)} onUpdate={handleUpdate} />
        ))}
      </div>
    </div>
  );
}

function MemoCard({ memo, isEditing, onEdit, onDelete, onUpdate }: { memo: Memo; isEditing: boolean; onEdit: () => void; onDelete: () => void; onUpdate: (id: string, u: Partial<Memo>) => void }) {
  const [title, setTitle] = useState(memo.title);
  const [content, setContent] = useState(memo.content);

  useEffect(() => { setTitle(memo.title); setContent(memo.content); }, [memo]);

  if (isEditing) {
    return (
      <div className="bg-white border-2 border-teal-200 rounded-xl p-4 space-y-2">
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-2 py-1 border border-gray-200 rounded text-sm font-medium focus:outline-none focus:ring-1 focus:ring-teal-500" />
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500" />
        <div className="flex gap-2 justify-end">
          <button onClick={() => onUpdate(memo.id, { title, content })} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-teal-600 text-white rounded hover:bg-teal-700"><Check className="w-3 h-3" /> 保存</button>
          <button onClick={onEdit} className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 rounded"><X className="w-3 h-3" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-all ${memo.isPinned ? 'border-amber-200 bg-amber-50/30' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-sm text-gray-900 truncate flex-1">{memo.title}</h3>
        <div className="flex items-center gap-1 ml-2 shrink-0">
          <button onClick={() => onUpdate(memo.id, { isPinned: !memo.isPinned })} className="p-1 text-gray-400 hover:text-amber-500 rounded">
            {memo.isPinned ? <Pin className="w-3.5 h-3.5 text-amber-500" /> : <PinOff className="w-3.5 h-3.5" />}
          </button>
          <button onClick={onEdit} className="p-1 text-gray-400 hover:text-teal-600 rounded"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <p className="text-xs text-gray-500 whitespace-pre-wrap line-clamp-4 mb-2">{memo.content}</p>
      <div className="text-[10px] text-gray-400">{new Date(memo.updatedAt).toLocaleDateString("zh-CN")}</div>
    </div>
  );
}
