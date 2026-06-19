"use client";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, X, Pin, PinOff, StickyNote, Search } from "lucide-react";
import PageHeader from "@/components/workspace/PageHeader";
import EmptyState from "@/components/workspace/EmptyState";

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
  const [searchQuery, setSearchQuery] = useState("");

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

  const sorted = [...memos]
    .filter(m => 
      searchQuery === "" || 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (Number(b.isPinned) - Number(a.isPinned)) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  if (loading) return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        icon={<StickyNote className="w-5 h-5" />}
        title="备忘录"
        description="记录重要事项、客户资料、物流备注"
      />
      <div className="p-8 text-center text-gray-400">加载中...</div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        icon={<StickyNote className="w-5 h-5" />}
        title="备忘录"
        description="记录重要事项、客户资料、物流备注"
        action={
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> 新建备忘
          </button>
        }
      />

      {/* 工具栏 */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索备忘..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          {/* 统计 */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>共 {memos.length} 条</span>
            <span>置顶 {memos.filter(m => m.isPinned).length} 条</span>
          </div>
        </div>
      </div>

      {/* 新建表单 */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 mb-6">
          <input 
            type="text" 
            placeholder="标题" 
            value={newTitle} 
            onChange={e => setNewTitle(e.target.value)} 
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
          />
          <textarea 
            placeholder="内容..." 
            value={newContent} 
            onChange={e => setNewContent(e.target.value)} 
            rows={4} 
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" 
          />
          <div className="flex gap-2 justify-end">
            <button 
              onClick={() => setShowForm(false)} 
              className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
            >
              取消
            </button>
            <button 
              onClick={handleCreate} 
              className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      )}

      {/* 备忘列表 */}
      {sorted.length === 0 ? (
        searchQuery ? (
          <EmptyState
            icon={<Search className="w-8 h-8" />}
            title="没有找到匹配的备忘"
            description="尝试使用不同的关键词搜索"
            primaryAction={{ label: "清除搜索", onClick: () => setSearchQuery("") }}
          />
        ) : (
          <EmptyState
            icon={<StickyNote className="w-8 h-8" />}
            title="还没有备忘录"
            description="记录客户资料、物流备注、常用链接、灵感想法。置顶重要备忘，方便快速查找。"
            primaryAction={{ label: "新建第一条备忘", onClick: () => setShowForm(true) }}
          />
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map(memo => (
            <MemoCard 
              key={memo.id} 
              memo={memo} 
              isEditing={editingId === memo.id} 
              onEdit={() => setEditingId(memo.id)} 
              onDelete={() => handleDelete(memo.id)} 
              onUpdate={handleUpdate} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MemoCard({ memo, isEditing, onEdit, onDelete, onUpdate }: { 
  memo: Memo; 
  isEditing: boolean; 
  onEdit: () => void; 
  onDelete: () => void; 
  onUpdate: (id: string, u: Partial<Memo>) => void 
}) {
  const [title, setTitle] = useState(memo.title);
  const [content, setContent] = useState(memo.content);

  useEffect(() => { setTitle(memo.title); setContent(memo.content); }, [memo]);

  if (isEditing) {
    return (
      <div className="bg-white border-2 border-teal-200 rounded-xl p-4 space-y-2">
        <input 
          type="text" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          className="w-full px-2 py-1 border border-gray-200 rounded text-sm font-medium focus:outline-none focus:ring-1 focus:ring-teal-500" 
        />
        <textarea 
          value={content} 
          onChange={e => setContent(e.target.value)} 
          rows={4} 
          className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none" 
        />
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => onUpdate(memo.id, { title, content })} 
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
          >
            <Check className="w-3 h-3" /> 保存
          </button>
          <button 
            onClick={onEdit} 
            className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 rounded transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-xl p-4 hover:shadow-sm transition-all ${
      memo.isPinned ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100'
    }`}>
      <div className="flex items-start justify-between mb-2 gap-2">
        <h3 className="font-medium text-sm text-gray-900 truncate flex-1">
          {memo.isPinned && <span className="text-amber-500 mr-1">📌</span>}
          {memo.title}
        </h3>
        <div className="flex items-center gap-1 ml-2 shrink-0">
          <button 
            onClick={() => onUpdate(memo.id, { isPinned: !memo.isPinned })} 
            className="p-1.5 text-gray-400 hover:text-amber-500 rounded hover:bg-gray-50 transition-colors"
            title={memo.isPinned ? "取消置顶" : "置顶"}
          >
            {memo.isPinned ? <Pin className="w-3.5 h-3.5 text-amber-500" /> : <PinOff className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={onEdit} 
            className="p-1.5 text-gray-400 hover:text-teal-600 rounded hover:bg-gray-50 transition-colors"
            title="编辑"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={onDelete} 
            className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-gray-50 transition-colors"
            title="删除"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500 whitespace-pre-wrap line-clamp-4 mb-3">
        {memo.content || "无内容"}
      </p>
      <div className="text-[10px] text-gray-400">
        更新于 {new Date(memo.updatedAt).toLocaleDateString("zh-CN")}
      </div>
    </div>
  );
}
