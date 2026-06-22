"use client";

import { useState, useRef } from "react";
import { Award, ToggleLeft, ToggleRight, Plus, Pencil, Upload, X, Loader2 } from "lucide-react";

interface BadgeInfo {
  id: string;
  key: string;
  name: string;
  description: string | null;
  iconText: string;
  color: string;
  category: string;
  conditionText: string | null;
  isActive: boolean;
  sortOrder: number;
  awardCount: number;
}

const COLOR_MAP: Record<string, string> = {
  "green-500": "bg-green-100 text-green-700 border-green-200",
  "teal-500": "bg-teal-100 text-teal-700 border-teal-200",
  "blue-500": "bg-blue-100 text-blue-700 border-blue-200",
  "amber-500": "bg-amber-100 text-amber-700 border-amber-200",
  "purple-500": "bg-purple-100 text-purple-700 border-purple-200",
  "rose-500": "bg-rose-100 text-rose-700 border-rose-200",
  "indigo-500": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "cyan-500": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "orange-500": "bg-orange-100 text-orange-700 border-orange-200",
  "emerald-500": "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const CATEGORIES = ["achievement", "milestone", "special", "community"];

export function BadgeManager({ badges }: { badges: BadgeInfo[] }) {
  const [badgeList, setBadgeList] = useState(badges);
  const [showForm, setShowForm] = useState(false);
  const [editingBadge, setEditingBadge] = useState<BadgeInfo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formKey, setFormKey] = useState("");
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formIconText, setFormIconText] = useState("🎖️");
  const [formColor, setFormColor] = useState("purple-500");
  const [formCategory, setFormCategory] = useState("achievement");
  const [formCondition, setFormCondition] = useState("");
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formIconUrl, setFormIconUrl] = useState<string | null>(null);

  function resetForm() {
    setFormKey("");
    setFormName("");
    setFormDesc("");
    setFormIconText("🎖️");
    setFormColor("purple-500");
    setFormCategory("achievement");
    setFormCondition("");
    setFormSortOrder(0);
    setFormIconUrl(null);
    setFormError(null);
    setUploadError(null);
    setEditingBadge(null);
  }

  function startCreate() {
    resetForm();
    setShowForm(true);
  }

  function startEdit(badge: BadgeInfo) {
    setEditingBadge(badge);
    setFormKey(badge.key);
    setFormName(badge.name);
    setFormDesc(badge.description || "");
    setFormIconText(badge.iconText);
    setFormColor(badge.color);
    setFormCategory(badge.category);
    setFormCondition(badge.conditionText || "");
    setFormSortOrder(badge.sortOrder);
    setFormIconUrl(badge.iconText.startsWith("/uploads/") ? badge.iconText : null);
    setFormError(null);
    setUploadError(null);
    setShowForm(true);
  }

  async function handleSave() {
    setFormError(null);
    if (!formKey.trim() || !formName.trim()) {
      setFormError("key 和名称必填");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        key: formKey.trim(),
        name: formName.trim(),
        description: formDesc.trim() || null,
        iconText: formIconUrl || formIconText,
        color: formColor,
        category: formCategory,
        conditionText: formCondition.trim() || null,
        sortOrder: formSortOrder,
      };

      if (editingBadge) {
        const res = await fetch(`/api/admin/badges/${editingBadge.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.success) {
          setFormError(json.error || "保存失败");
          return;
        }
        setBadgeList(prev =>
          prev.map(b => b.id === editingBadge.id ? { ...b, ...payload } : b)
        );
      } else {
        const res = await fetch("/api/admin/badges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.success) {
          setFormError(json.error || "创建失败");
          return;
        }
        setBadgeList(prev => [...prev, { ...payload, id: json.data.id, isActive: true, awardCount: 0 } as BadgeInfo]);
      }
      setShowForm(false);
      resetForm();
    } catch (e) {
      setFormError("网络错误，请稍后重试");
    } finally {
      setSaving(false);
    }
  }

  async function handleIconUpload(file: File) {
    if (!editingBadge && !showForm) return;
    setUploadError(null);

    // Client-side validation
    if (file.size > 512 * 1024) {
      setUploadError("文件大小不能超过 512KB");
      return;
    }
    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("仅支持 PNG、JPG、WebP 格式（不允许 SVG）");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("icon", file);

      // If editing existing badge, upload to its ID
      const badgeId = editingBadge?.id;
      if (!badgeId) {
        setUploadError("请先保存勋章后再上传图标");
        return;
      }

      const res = await fetch(`/api/admin/badges/${badgeId}/icon`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!json.success) {
        setUploadError(json.error || "上传失败");
        return;
      }
      setFormIconUrl(json.iconUrl);
      setBadgeList(prev =>
        prev.map(b => b.id === badgeId ? { ...b, iconText: json.iconUrl } : b)
      );
    } catch (e) {
      setUploadError("上传失败，请稍后重试");
    } finally {
      setUploading(false);
    }
  }

  async function toggleBadge(badgeId: string, currentActive: boolean) {
    try {
      const res = await fetch(`/api/admin/badges/${badgeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      const json = await res.json();
      if (json.success) {
        setBadgeList(prev =>
          prev.map(b => b.id === badgeId ? { ...b, isActive: !currentActive } : b)
        );
      }
    } catch (e) {
      // ignore
    }
  }

  function renderIcon(badge: BadgeInfo) {
    if (badge.iconText.startsWith("/uploads/")) {
      return <img src={badge.iconText} alt={badge.name} className="w-6 h-6 rounded object-cover" />;
    }
    return <span className="text-base">{badge.iconText}</span>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-600" />
            社区勋章管理
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            管理勋章列表。勋章可自动授予或管理员手动授予。此页面为唯一勋章管理入口。
          </p>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> 新建勋章
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {editingBadge ? "编辑勋章" : "新建勋章"}
            </h2>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Key (唯一标识) *</label>
              <input
                type="text"
                value={formKey}
                onChange={e => setFormKey(e.target.value)}
                disabled={!!editingBadge}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                placeholder="如 first_login"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">名称 *</label>
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="如 初来乍到"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">描述</label>
              <textarea
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
                placeholder="勋章描述"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">图标 Emoji / URL</label>
              <input
                type="text"
                value={formIconUrl ? "" : formIconText}
                onChange={e => { setFormIconText(e.target.value); setFormIconUrl(null); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="如 🎉 或留空使用上传图标"
              />
              {formIconUrl && (
                <div className="mt-1 flex items-center gap-2">
                  <img src={formIconUrl} alt="icon" className="w-6 h-6 rounded" />
                  <span className="text-xs text-green-600">已上传图标</span>
                  <button onClick={() => setFormIconUrl(null)} className="text-xs text-gray-400 hover:text-red-500">移除</button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">颜色</label>
              <select
                value={formColor}
                onChange={e => setFormColor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {Object.keys(COLOR_MAP).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">分类</label>
              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">排序</label>
              <input
                type="number"
                value={formSortOrder}
                onChange={e => setFormSortOrder(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">条件说明</label>
              <input
                type="text"
                value={formCondition}
                onChange={e => setFormCondition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="如 首次登录"
              />
            </div>
          </div>

          {/* Icon upload — only for existing badges */}
          {editingBadge && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-xs font-medium text-gray-600 mb-2">上传图标图片</label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={e => e.target.files?.[0] && handleIconUpload(e.target.files[0])}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "上传中…" : "选择图标"}
                </button>
                <span className="text-xs text-gray-500">PNG/JPG/WebP, 最大 512KB, 不支持 SVG</span>
              </div>
              {uploadError && <p className="mt-2 text-xs text-red-600">{uploadError}</p>}
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => { setShowForm(false); resetForm(); }}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingBadge ? "保存" : "创建"}
            </button>
          </div>
        </div>
      )}

      {/* Badge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badgeList.map((badge) => (
          <div
            key={badge.id}
            className={`rounded-xl border p-4 ${badge.isActive ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50 opacity-60"}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm border ${COLOR_MAP[badge.color] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                  {renderIcon(badge)}
                  {badge.name}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(badge)}
                  className="text-gray-400 hover:text-blue-600 p-1"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleBadge(badge.id, badge.isActive)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {badge.isActive ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{badge.description || "无描述"}</p>
            <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
              <span>分类: {badge.category}</span>
              <span>已授予: {badge.awardCount} 人</span>
            </div>
            {badge.conditionText && (
              <p className="text-xs text-gray-400 mt-1">条件: {badge.conditionText}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
