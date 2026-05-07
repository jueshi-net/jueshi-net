"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pin, PinOff, Save, Loader2, AlertCircle, CheckCircle, Search } from "lucide-react";

interface Memo {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function MemoPage() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Memo | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({ title: "", content: "", isPinned: false });

  useEffect(() => {
    fetchMemos();
  }, []);

  const fetchMemos = async () => {
    try {
      const res = await fetch("/api/memos");
      const data = await res.json();
      if (data.success) setMemos(data.data || []);
    } catch {
      console.error("Failed to fetch memos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() && !formData.content.trim()) {
      setMessage({ type: "error", text: "请输入标题或内容" });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      if (editing) {
        const res = await fetch(`/api/memos/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setMessage({ type: "success", text: "备忘录已更新" });
          fetchMemos();
          resetForm();
        }
      } else {
        const res = await fetch("/api/memos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setMessage({ type: "success", text: "备忘录已创建" });
          fetchMemos();
          resetForm();
        }
      }
    } catch {
      setMessage({ type: "error", text: "保存失败" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此备忘录？")) return;
    try {
      const res = await fetch(`/api/memos/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "success", text: "备忘录已删除" });
        fetchMemos();
      }
    } catch {
      setMessage({ type: "error", text: "删除失败" });
    }
  };

  const togglePin = async (memo: Memo) => {
    try {
      const res = await fetch(`/api/memos/${memo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...memo, isPinned: !memo.isPinned }),
      });
      if (res.ok) fetchMemos();
    } catch {
      console.error("Failed to toggle pin");
    }
  };

  const startEdit = (memo: Memo) => {
    setEditing(memo);
    setFormData({ title: memo.title, content: memo.content, isPinned: memo.isPinned });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setFormData({ title: "", content: "", isPinned: false });
  };

  const filteredMemos = memos.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500">加载中...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">云备忘录</h1>
          <p className="text-sm text-gray-500 mt-1">你的个人私密笔记，安全存储</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> 新建备忘
        </button>
      </div>

      {message.text && (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm mb-4 ${
          message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索备忘录..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editing ? "编辑备忘录" : "新建备忘录"}</h2>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded">✕</button>
            </div>
            <div className="space-y-4">
              <input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="标题"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="内容..."
                rows={10}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  />
                  置顶
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  保存
                </button>
                <button onClick={resetForm} className="px-6 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">取消</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Memo List */}
      <div className="space-y-4">
        {filteredMemos.map((memo) => (
          <div
            key={memo.id}
            className={`bg-white rounded-xl border p-5 hover:shadow-md transition-all ${
              memo.isPinned ? "border-yellow-200 bg-yellow-50/30" : "border-gray-100"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">{memo.title}</h3>
                {memo.isPinned && <Pin className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
              </div>
              <div className="flex gap-1">
                <button onClick={() => togglePin(memo)} className="p-1 text-gray-400 hover:text-yellow-500">
                  {memo.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                </button>
                <button onClick={() => startEdit(memo)} className="p-1 text-gray-400 hover:text-blue-600">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(memo.id)} className="p-1 text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-gray-600 whitespace-pre-wrap line-clamp-4">{memo.content}</p>
            <p className="text-xs text-gray-400 mt-3">
              更新于 {new Date(memo.updatedAt).toLocaleString("zh-CN")}
            </p>
          </div>
        ))}
        {filteredMemos.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
            {searchQuery ? "没有找到匹配的备忘录" : "还没有备忘录，点击上方按钮创建"}
          </div>
        )}
      </div>
    </div>
  );
}
