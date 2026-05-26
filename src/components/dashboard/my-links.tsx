"use client";

import { useState, useCallback } from "react";
import { Link, Plus, Trash2, ExternalLink, Edit2, X, Check } from "lucide-react";

interface WorkbenchLink {
  id: string;
  title: string;
  url: string;
  description: string | null;
  iconUrl: string | null;
  category: string | null;
  sortOrder: number;
}

interface MyLinksProps {
  links: WorkbenchLink[];
  maxLinks: number;
  onRefresh: () => void;
}

export default function MyLinks({ links, maxLinks, onRefresh }: MyLinksProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Add form
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Edit form
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const handleAdd = useCallback(async () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/workbench/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          url: newUrl.trim(),
          description: newDesc.trim() || undefined,
        }),
      });
      if (res.ok) {
        setNewTitle("");
        setNewUrl("");
        setNewDesc("");
        setShowAdd(false);
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || "添加失败");
      }
    } catch {
      alert("添加失败，请重试");
    } finally {
      setSaving(false);
    }
  }, [newTitle, newUrl, newDesc, onRefresh]);

  const startEdit = useCallback((link: WorkbenchLink) => {
    setEditingId(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditDesc(link.description || "");
  }, []);

  const handleSaveEdit = useCallback(async (id: string) => {
    if (!editTitle.trim() || !editUrl.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/workbench/links/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          url: editUrl.trim(),
          description: editDesc.trim() || undefined,
        }),
      });
      if (res.ok) {
        setEditingId(null);
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || "保存失败");
      }
    } catch {
      alert("保存失败，请重试");
    } finally {
      setSaving(false);
    }
  }, [editTitle, editUrl, editDesc, onRefresh]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("确定删除此链接？")) return;
    try {
      const res = await fetch(`/api/workbench/links/${id}`, { method: "DELETE" });
      if (res.ok) {
        onRefresh();
      }
    } catch {
      alert("删除失败");
    }
  }, [onRefresh]);

  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Link className="w-5 h-5 text-blue-500" />
          我的网址
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{links.length}/{maxLinks}</span>
          {links.length < maxLinks && (
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              添加
            </button>
          )}
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg space-y-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="标题（如：Amazon Seller Central）"
            maxLength={80}
            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="网址（https://...）"
            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="描述（可选）"
            maxLength={200}
            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={saving || !newTitle.trim() || !newUrl.trim()}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              保存
            </button>
            <button
              onClick={() => { setShowAdd(false); setNewTitle(""); setNewUrl(""); setNewDesc(""); }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-lg flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              取消
            </button>
          </div>
        </div>
      )}

      {/* Links list */}
      {links.length === 0 && !showAdd ? (
        <div className="text-center py-6 text-gray-500">
          <Link className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">还没有收藏网址</p>
          <p className="text-xs text-gray-400 mt-1">添加你每天会打开的网站</p>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              {editingId === link.id ? (
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(link.id)}
                      disabled={saving}
                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 truncate"
                      >
                        {link.title}
                      </a>
                      <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    </div>
                    {link.description && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{link.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => startEdit(link)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
