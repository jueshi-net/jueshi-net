"use client";
import { useState } from "react";
import Link from "next/link";
import { FileText, Plus, Edit2, Trash2, Save, X, Loader2, Eye, Video, AlertCircle, CheckCircle } from "lucide-react";

type Topic = {
  id: string; slug: string; title: string; subtitle: string | null;
  status: string; templateType: string; coverEmoji: string | null;
  youtubeUrl: string | null; youtubeVideoId: string | null; publishedAt: string | null;
  createdAt: string; updatedAt: string;
  _count: { items: number; sections: number };
};

const STATUS_OPTIONS = [
  { value: "draft", label: "草稿", color: "bg-gray-100 text-gray-600" },
  { value: "published", label: "已发布", color: "bg-green-100 text-green-700" },
  { value: "archived", label: "已归档", color: "bg-amber-100 text-amber-700" },
];

export default function TopicsListClient({ topics: initialTopics }: { topics: Topic[] }) {
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [editing, setEditing] = useState<Topic | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    slug: "", title: "", subtitle: "", summary: "", status: "draft",
    templateType: "rating_list", coverEmoji: "", seoTitle: "", seoDescription: "", youtubeUrl: "",
  });

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/topics");
      const data = await res.json();
      if (data.success) setTopics(data.data || []);
    } catch {
      // Keep current data, don't overwrite with empty
    }
  };

  const handleSubmit = async () => {
    if (!formData.slug.trim() || !formData.title.trim()) {
      setMessage({ type: "error", text: "slug 和标题必填" }); return;
    }
    setSaving(true); setMessage({ type: "", text: "" });
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/admin/topics/${editing.id}` : "/api/admin/topics";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setMessage({ type: "success", text: editing ? "更新成功" : "创建成功" });
      setShowForm(false); setEditing(null); fetchData();
    } catch (e: any) { setMessage({ type: "error", text: e.message }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此专题？所有关联条目也会被删除。")) return;
    try {
      const res = await fetch(`/api/admin/topics/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setMessage({ type: "success", text: "已删除" }); fetchData();
    } catch (e: any) { setMessage({ type: "error", text: e.message }); }
  };

  const startEdit = (t: Topic) => {
    setEditing(t);
    setFormData({
      slug: t.slug, title: t.title, subtitle: t.subtitle || "", summary: "",
      status: t.status, templateType: t.templateType, coverEmoji: t.coverEmoji || "",
      seoTitle: "", seoDescription: "", youtubeUrl: t.youtubeUrl || "",
    });
    setShowForm(true);
  };

  const startNew = () => {
    setEditing(null);
    setFormData({
      slug: "", title: "", subtitle: "", summary: "", status: "draft",
      templateType: "rating_list", coverEmoji: "", seoTitle: "", seoDescription: "", youtubeUrl: "",
    });
    setShowForm(true);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-purple-600" />
          <h1 className="text-xl font-bold text-gray-900">专题管理</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={startNew} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 min-h-[44px]">
            <Plus className="w-4 h-4" /> 新建专题
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-3 rounded-lg mb-4 flex items-center gap-2 ${message.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {message.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">{editing ? "编辑专题" : "新建专题"}</h2>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="p-1 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">slug *</label>
              <input value={formData.slug} onChange={e => setFormData(f => ({ ...f, slug: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="如 overseas-essential-apps"
                disabled={!!editing} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
              <input value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="专题标题" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">副标题</label>
              <input value={formData.subtitle} onChange={e => setFormData(f => ({ ...f, subtitle: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="一句话描述" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]">
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emoji 图标</label>
              <input value={formData.coverEmoji} onChange={e => setFormData(f => ({ ...f, coverEmoji: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="📱" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
              <input value={formData.youtubeUrl} onChange={e => setFormData(f => ({ ...f, youtubeUrl: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="https://www.youtube.com/watch?v=..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO 标题</label>
              <input value={formData.seoTitle} onChange={e => setFormData(f => ({ ...f, seoTitle: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="SEO 标题" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO 描述</label>
              <textarea value={formData.seoDescription} onChange={e => setFormData(f => ({ ...f, seoDescription: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="SEO 描述" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 min-h-[44px]">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "保存中..." : "保存"}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 min-h-[44px]">
              <X className="w-4 h-4" /> 取消
            </button>
          </div>
        </div>
      )}

      {/* Topics List */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">专题</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">状态</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">模板</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">YouTube</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">条目</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">更新</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {topics.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">暂无专题，点击上方「新建专题」创建</td></tr>
            ) : topics.map(t => {
              const statusInfo = STATUS_OPTIONS.find(s => s.value === t.status);
              const updated = t.updatedAt ? new Date(t.updatedAt).toLocaleDateString("zh-CN") : "—";
              return (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {t.coverEmoji && <span className="text-lg">{t.coverEmoji}</span>}
                      <div>
                        <div className="font-medium text-gray-900">{t.title}</div>
                        <div className="text-xs text-gray-400">/{t.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo?.color || "bg-gray-100 text-gray-600"}`}>
                      {statusInfo?.label || t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{t.templateType}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {t.youtubeVideoId ? <span className="inline-flex items-center gap-1 text-blue-500"><Video className="w-4 h-4" /> {t.youtubeVideoId.slice(0, 8)}...</span> :
                     t.youtubeUrl ? <span className="text-amber-500 text-xs">未解析</span> :
                     <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">{t._count.items}</td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs">{updated}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/topics/${t.slug}`} target="_blank" className="p-1.5 rounded hover:bg-gray-100" title="预览前台">
                        <Eye className="w-4 h-4 text-gray-400" />
                      </Link>
                      <Link href={`/admin/topics/${t.id}/edit`} className="p-1.5 rounded hover:bg-gray-100" title="编辑内容">
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </Link>
                      <button onClick={() => startEdit(t)} className="p-1.5 rounded hover:bg-gray-100" title="快速编辑">
                        <Edit2 className="w-4 h-4 text-green-500" />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded hover:bg-red-50" title="删除">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
