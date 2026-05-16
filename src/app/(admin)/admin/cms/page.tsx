"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Save, FileText, Eye, Code, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { marked } from "marked";

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  status: string;
  views: number;
  tags: string;
  createdAt: string;
  publishedAt: string | null;
}

export default function AdminCMSPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Article | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    summary: "",
    cover: "",
    authorId: "",
    status: "DRAFT",
    tags: "",
  });
  const [showPreview, setShowPreview] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/articles?status=all");
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success) {
        setArticles(data.data || []);
      } else {
        throw new Error(data.error || "获取文章失败");
      }
    } catch (err: any) {
      setError(err.message || "加载文章失败");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/articles/${editing.slug}` : "/api/articles";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, authorId: "admin" }),
      });
      if (res.ok) {
        fetchData();
        resetForm();
      }
    } catch (error) {
      console.error("Failed to save article:", error);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("确定删除此文章？")) return;
    try {
      const res = await fetch(`/api/articles/${slug}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to delete article:", error);
    }
  };

  const startEdit = (article: Article) => {
    setEditing(article);
    setFormData({
      title: article.title,
      slug: article.slug,
      content: "",
      summary: article.summary || "",
      cover: "",
      authorId: "",
      status: article.status,
      tags: article.tags,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setShowPreview(false);
    setFormData({ title: "", slug: "", content: "", summary: "", cover: "", authorId: "", status: "DRAFT", tags: "" });
  };

  if (loading) return <div className="p-6 text-center text-gray-500 flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> 加载文章中...</div>;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 font-medium">{error}</p>
          <p className="text-sm text-red-400 mt-1">请检查是否已登录管理账号</p>
          <button onClick={fetchData} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">重新加载</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            文章管理
          </h1>
          <p className="text-sm text-gray-500 mt-1">管理网站文章、指南、教程等内容。当前共 {articles.length} 篇文章。</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> 新建文章
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editing ? "编辑文章" : "新建文章"}</h2>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
                <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: formData.slug || e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500" placeholder="如：国际物流工具推荐" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" placeholder="如：logistics-tools" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">摘要</label>
                <input value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="简短描述" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">封面图URL</label>
                <input value={formData.cover} onChange={(e) => setFormData({ ...formData, cover: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                  <input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="教程,物流" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="DRAFT">草稿</option>
                    <option value="PUBLISHED">发布</option>
                    <option value="ARCHIVED">归档</option>
                  </select>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">内容 (Markdown)</label>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                      showPreview ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {showPreview ? <><Code className="w-3 h-3" /> 编辑</> : <><Eye className="w-3 h-3" /> 预览</>}
                  </button>
                </div>
                {showPreview ? (
                  <div className="prose prose-sm max-w-none border rounded-lg p-4 bg-gray-50 min-h-[200px]">
                    {formData.content ? (
                      <div dangerouslySetInnerHTML={{ __html: marked(formData.content) as string }} />
                    ) : (
                      <p className="text-gray-400">暂无内容</p>
                    )}
                  </div>
                ) : (
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={12}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-mono resize-none"
                    placeholder="# 标题&#10;&#10;正文内容..."
                  />
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSubmit} className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> 保存
                </button>
                <button onClick={resetForm} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">取消</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">标题</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">状态</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">浏览</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">日期</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {articles.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{a.title}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${a.status === "PUBLISHED" ? "bg-green-50 text-green-600" : a.status === "DRAFT" ? "bg-yellow-50 text-yellow-600" : "bg-gray-100 text-gray-400"}`}>
                    {a.status === "PUBLISHED" ? "已发布" : a.status === "DRAFT" ? "草稿" : "已归档"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 flex items-center gap-1"><Eye className="w-3 h-3" /> {a.views}</td>
                <td className="px-4 py-3 text-gray-500">{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("zh-CN") : new Date(a.createdAt).toLocaleDateString("zh-CN")}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => startEdit(a)} className="text-blue-600 hover:text-blue-700 mr-3 inline-flex items-center gap-1"><Edit2 className="w-3 h-3" /> 编辑</button>
                  <button onClick={() => handleDelete(a.slug)} className="text-red-600 hover:text-red-700 inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> 删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {articles.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg mb-1">暂无文章</p>
            <p className="text-sm">点击上方按钮创建第一篇文章</p>
          </div>
        )}
      </div>
    </div>
  );
}
