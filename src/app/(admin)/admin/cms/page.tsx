"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, X, Save, FileText, Eye, Code, Loader2, AlertCircle, Link as LinkIcon, Search } from "lucide-react";
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
  updatedAt: string;
  publishedAt: string | null;
}

export default function AdminCMSPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Article | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "", slug: "", content: "", summary: "", cover: "", authorId: "", status: "draft", tags: "",
  });
  const [showPreview, setShowPreview] = useState(false);
  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQ, setSearchQ] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true); setError(null);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchQ) params.set("q", searchQ);
      const res = await fetch(`/api/articles?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      if (data.success) setArticles(data.data || []);
      else throw new Error(data.error || "获取文章失败");
    } catch (err: any) { setError(err.message || "加载文章失败"); setArticles([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/articles/${editing.slug}` : "/api/articles";
      const payload = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.summary || null,
        status: formData.status.toLowerCase(),
        author: formData.authorId || null,
      };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await res.json();
      if (res.ok) { fetchData(); resetForm(); }
      else { alert(result.error || "保存失败"); }
    } catch (error) { console.error("Failed to save article:", error); alert("保存失败"); }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("确定归档此文章？归档后前台不再展示。")) return;
    try { const res = await fetch(`/api/articles/${slug}`, { method: "DELETE" }); if (res.ok) fetchData(); }
    catch (error) { console.error("Failed to archive article:", error); }
  };

  const startEdit = async (article: Article) => {
    setEditing(article);
    // Fetch full article content
    try {
      const res = await fetch(`/api/articles/${article.slug}`);
      const data = await res.json();
      const full = data.data;
      setFormData({
        title: full.title || article.title,
        slug: full.slug || article.slug,
        content: full.content || "",
        summary: full.excerpt || article.summary || "",
        cover: full.coverImage || "",
        authorId: full.author || "",
        status: full.status || article.status,
        tags: article.tags,
      });
    } catch {
      setFormData({
        title: article.title, slug: article.slug, content: "", summary: article.summary || "",
        cover: "", authorId: "", status: article.status, tags: article.tags,
      });
    }
    setShowForm(true);
  };

  const resetForm = () => { setEditing(null); setShowForm(false); setShowPreview(false); setFormData({ title: "", slug: "", content: "", summary: "", cover: "", authorId: "", status: "draft", tags: "" }); };

  const publishedCount = articles.filter(a => a.status === "published").length;
  const draftCount = articles.filter(a => a.status === "draft").length;
  const archivedCount = articles.filter(a => a.status === "archived").length;

  if (loading) return (
    <div className="p-6 text-center text-gray-500 flex items-center justify-center gap-2 min-h-[200px]">
      <Loader2 className="w-5 h-5 animate-spin" /> 加载文章中...
    </div>
  );

  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-600 font-medium">{error}</p>
        <p className="text-sm text-red-400 mt-1">请检查是否已登录管理账号</p>
        <button onClick={fetchData} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 min-h-[44px]">重新加载</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold flex items-center gap-2"><FileText className="w-5 h-5" /> 文章管理</h1>
            <p className="text-sm text-orange-100 mt-1">这里管理 /guides 前台展示的文章内容。共 {articles.length} 篇。</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-orange-700 rounded-xl text-sm font-bold hover:bg-orange-50 transition-colors min-h-[44px]">
            <Plus className="w-4 h-4" /> 新建文章
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-green-700">{publishedCount}</div>
          <div className="text-xs text-green-600">已发布</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-yellow-700">{draftCount}</div>
          <div className="text-xs text-yellow-600">草稿</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-gray-500">{archivedCount}</div>
          <div className="text-xs text-gray-400">已归档</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchData()}
            placeholder="搜索标题..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[44px]"
          />
        </div>
        <div className="flex gap-2">
          {["all", "published", "draft", "archived"].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setTimeout(fetchData, 0); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                statusFilter === s
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === "all" ? "全部" : s === "published" ? "已发布" : s === "draft" ? "草稿" : "已归档"}
            </button>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editing ? "编辑文章" : "新建文章"}</h2>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="w-5 h-5" /></button>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                  <input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="教程,物流" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="draft">草稿</option>
                    <option value="published">发布</option>
                    <option value="archived">归档</option>
                  </select>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">内容 (Markdown)</label>
                  <button onClick={() => setShowPreview(!showPreview)} className={`px-3 py-1 rounded text-xs flex items-center gap-1 min-h-[36px] ${showPreview ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"}`}>
                    {showPreview ? <><Code className="w-3 h-3" /> 编辑</> : <><Eye className="w-3 h-3" /> 预览</>}
                  </button>
                </div>
                {showPreview ? (
                  <div className="prose prose-sm max-w-none border rounded-lg p-4 bg-gray-50 min-h-[200px]">
                    {formData.content ? <div dangerouslySetInnerHTML={{ __html: marked(formData.content) as string }} /> : <p className="text-gray-400">暂无内容</p>}
                  </div>
                ) : (
                  <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={12} className="w-full px-3 py-2 border rounded-lg text-sm font-mono resize-none" placeholder="# 标题&#10;&#10;正文内容..." />
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSubmit} className="flex-1 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2 min-h-[44px]">
                  <Save className="w-4 h-4" /> 保存
                </button>
                <button onClick={resetForm} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 min-h-[44px]">取消</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">标题</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">状态</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">标签</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">发布</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden xl:table-cell">更新</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {articles.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{a.title}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs hidden sm:table-cell">{a.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${a.status === "published" ? "bg-green-50 text-green-600" : a.status === "draft" ? "bg-yellow-50 text-yellow-600" : a.status === "archived" ? "bg-gray-100 text-gray-500" : "bg-gray-100 text-gray-400"}`}>
                      {a.status === "published" ? "已发布" : a.status === "draft" ? "草稿" : a.status === "archived" ? "已归档" : a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{a.tags}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("zh-CN") : new Date(a.createdAt).toLocaleDateString("zh-CN")}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden xl:table-cell">{new Date(a.updatedAt).toLocaleDateString("zh-CN")}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link href={`/guides/${a.slug}`} target="_blank" className="text-teal-600 hover:text-teal-700 mr-3 inline-flex items-center gap-1 min-h-[44px]"><LinkIcon className="w-3 h-3" /> 预览</Link>
                    <button onClick={() => startEdit(a)} className="text-blue-600 hover:text-blue-700 mr-3 inline-flex items-center gap-1 min-h-[44px]"><Edit2 className="w-3 h-3" /> 编辑</button>
                    <button onClick={() => handleDelete(a.slug)} className="text-red-600 hover:text-red-700 inline-flex items-center gap-1 min-h-[44px]"><Trash2 className="w-3 h-3" /> 删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {articles.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            <FileText className="w-14 h-14 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium text-gray-500 mb-1">暂无文章</p>
            <p className="text-sm">点击「新建文章」按钮开始撰写指南内容</p>
          </div>
        )}
      </div>
    </div>
  );
}
