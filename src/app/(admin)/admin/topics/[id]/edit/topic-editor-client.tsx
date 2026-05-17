"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle, CheckCircle, Plus, Trash2, Edit2, Eye, Video, Globe, ArrowUp, ArrowDown } from "lucide-react";
import { parseYouTubeUrl, getYouTubeEmbedUrl } from "@/lib/youtube";

type TopicItem = {
  id: string; name: string; alias: string | null; rating: string | null;
  category: string | null; iconText: string | null; iconBg: string | null;
  iconFg: string | null; installPriority: string | null; description: string | null;
  analogy: string | null; suitableFor: string | null; beginnerAdvice: string | null;
  riskTip: string | null; officialUrl: string | null; isBeginnerFriendly: boolean;
  isBeginnerRecommended: boolean;
  sortOrder: number; createdAt: string; updatedAt: string;
};

type TopicSection = {
  id: string; type: string; title: string | null; content: string | null;
  sortOrder: number; createdAt: string; updatedAt: string;
};

type Topic = {
  id: string; slug: string; title: string; subtitle: string | null;
  summary: string | null; status: string; templateType: string;
  coverEmoji: string | null; coverImage: string | null; heroBadges: any;
  suitableFor: any; tags: any; youtubeUrl: string | null; youtubeVideoId: string | null;
  youtubeTitle: string | null; youtubeDescription: string | null; youtubeThumbnail: string | null;
  seoTitle: string | null; seoDescription: string | null;
  publishedAt: string | null; createdAt: string; updatedAt: string;
  items: TopicItem[]; sections: TopicSection[];
};

type TabKey = "basic" | "items" | "sections" | "preview";

export default function TopicEditorClient({ topic }: { topic: Topic }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("basic");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Basic info state
  const [form, setForm] = useState({
    slug: topic.slug,
    title: topic.title,
    subtitle: topic.subtitle || "",
    summary: topic.summary || "",
    status: topic.status,
    templateType: topic.templateType,
    coverEmoji: topic.coverEmoji || "",
    youtubeUrl: topic.youtubeUrl || "",
    seoTitle: topic.seoTitle || "",
    seoDescription: topic.seoDescription || "",
  });

  // Items state
  const [items, setItems] = useState<TopicItem[]>(topic.items);
  const [editingItem, setEditingItem] = useState<TopicItem | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);

  // Sections state
  const [sections, setSections] = useState<TopicSection[]>(topic.sections);
  const [editingSection, setEditingSection] = useState<TopicSection | null>(null);
  const [showSectionForm, setShowSectionForm] = useState(false);

  // YouTube preview
  const videoId = parseYouTubeUrl(form.youtubeUrl);
  const embedUrl = videoId ? getYouTubeEmbedUrl(videoId) : null;

  // ===== Save basic info =====
  const saveBasic = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const youtubeVideoId = parseYouTubeUrl(form.youtubeUrl);
      const res = await fetch(`/api/admin/topics/${topic.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          youtubeVideoId: youtubeVideoId || null,
          suitableFor: topic.suitableFor,
          tags: topic.tags,
          heroBadges: topic.heroBadges,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setMessage({ type: "success", text: "保存成功" });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setSaving(false);
    }
  };

  // ===== Save item =====
  const saveItem = async (itemData: any) => {
    setSaving(true);
    try {
      let res: Response;
      if (editingItem) {
        res = await fetch(`/api/admin/topics/${topic.id}/items/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(itemData),
        });
      } else {
        res = await fetch(`/api/admin/topics/${topic.id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(itemData),
        });
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      // Refresh items
      const listRes = await fetch(`/api/admin/topics/${topic.id}`);
      const listData = await listRes.json();
      if (listData.success) setItems(listData.data.items);
      setEditingItem(null);
      setShowItemForm(false);
      setMessage({ type: "success", text: editingItem ? "条目已更新" : "条目已添加" });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setSaving(false);
    }
  };

  // ===== Delete item =====
  const deleteItem = async (itemId: string) => {
    if (!confirm("确定删除此条目？")) return;
    try {
      const res = await fetch(`/api/admin/topics/${topic.id}/items/${itemId}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      const listRes = await fetch(`/api/admin/topics/${topic.id}`);
      const listData = await listRes.json();
      if (listData.success) setItems(listData.data.items);
      setMessage({ type: "success", text: "已删除" });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message });
    }
  };

  // ===== Save section =====
  const saveSection = async (sectionData: any) => {
    setSaving(true);
    try {
      let res: Response;
      if (editingSection) {
        res = await fetch(`/api/admin/topics/${topic.id}/sections/${editingSection.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sectionData),
        });
      } else {
        res = await fetch(`/api/admin/topics/${topic.id}/sections`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sectionData),
        });
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      const listRes = await fetch(`/api/admin/topics/${topic.id}`);
      const listData = await listRes.json();
      if (listData.success) setSections(listData.data.sections);
      setEditingSection(null);
      setShowSectionForm(false);
      setMessage({ type: "success", text: editingSection ? "分区已更新" : "分区已添加" });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setSaving(false);
    }
  };

  // ===== Delete section =====
  const deleteSection = async (sectionId: string) => {
    if (!confirm("确定删除此分区？")) return;
    try {
      const res = await fetch(`/api/admin/topics/${topic.id}/sections/${sectionId}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      const listRes = await fetch(`/api/admin/topics/${topic.id}`);
      const listData = await listRes.json();
      if (listData.success) setSections(listData.data.sections);
      setMessage({ type: "success", text: "已删除" });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message });
    }
  };

  // ===== Move item =====
  const moveItem = async (itemId: string, direction: "up" | "down") => {
    const idx = items.findIndex(i => i.id === itemId);
    if (idx < 0) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === items.length - 1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const currentSort = items[idx].sortOrder;
    const swapSort = items[swapIdx].sortOrder;
    // Swap sort orders
    try {
      await Promise.all([
        fetch(`/api/admin/topics/${topic.id}/items/${itemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: swapSort }),
        }),
        fetch(`/api/admin/topics/${topic.id}/items/${items[swapIdx].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: currentSort }),
        }),
      ]);
      const listRes = await fetch(`/api/admin/topics/${topic.id}`);
      const listData = await listRes.json();
      if (listData.success) setItems(listData.data.items);
    } catch (e: any) {
      setMessage({ type: "error", text: e.message });
    }
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "basic", label: "📝 基础信息" },
    { key: "items", label: `📱 APP 条目 (${items.length})` },
    { key: "sections", label: `📄 分区内容 (${sections.length})` },
    { key: "preview", label: "👁️ 预览" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/topics" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">编辑专题</h1>
            <p className="text-sm text-gray-500">/{topic.slug}</p>
          </div>
        </div>
        <Link href={`/topics/${topic.slug}`} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 min-h-[44px]">
          <Globe className="w-4 h-4" /> 预览前台
        </Link>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${message.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {message.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors min-h-[44px] ${
              activeTab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "basic" && (
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">slug *</label>
              <input value={form.slug} readOnly className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 text-gray-400" />
              <p className="text-xs text-gray-400 mt-1">slug 不可修改</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]">
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
                <option value="archived">已归档</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="专题标题" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">副标题</label>
              <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="一句话描述" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emoji 图标</label>
              <input value={form.coverEmoji} onChange={e => setForm(f => ({ ...f, coverEmoji: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="📱" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
              <textarea value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} placeholder="专题简介" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
              <input value={form.youtubeUrl} onChange={e => setForm(f => ({ ...f, youtubeUrl: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="https://www.youtube.com/watch?v=..." />
              {videoId && (
                <div className="mt-3">
                  <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingBottom: "56.25%" }}>
                    <iframe
                      src={embedUrl!}
                      title="YouTube Preview"
                      className="absolute inset-0 w-full h-full border-0"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><Video className="w-3 h-3" /> 视频已识别：{videoId}</p>
                </div>
              )}
              {form.youtubeUrl && !videoId && (
                <p className="text-xs text-red-500 mt-1">⚠️ 无法识别 YouTube 视频 ID</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO 标题</label>
              <input value={form.seoTitle} onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="留空则使用标题" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO 描述</label>
              <textarea value={form.seoDescription} onChange={e => setForm(f => ({ ...f, seoDescription: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="留空则使用简介" />
            </div>
          </div>
          <button onClick={saveBasic} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 min-h-[48px]">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      )}

      {activeTab === "items" && (
        <div className="space-y-4">
          {/* Item Form */}
          {showItemForm && (
            <ItemForm
              item={editingItem}
              topicId={topic.id}
              onSave={saveItem}
              onCancel={() => { setShowItemForm(false); setEditingItem(null); }}
              saving={saving}
            />
          )}

          {/* Items List */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">APP 条目 ({items.length})</h3>
              <button onClick={() => { setEditingItem(null); setShowItemForm(true); }} className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm min-h-[44px]">
                <Plus className="w-4 h-4" /> 添加条目
              </button>
            </div>
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {items.map((item, idx) => (
                <div key={item.id} className="p-3 flex items-center gap-3 hover:bg-gray-50">
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveItem(item.id, "up")} disabled={idx === 0} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30">
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => moveItem(item.id, "down")} disabled={idx === items.length - 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30">
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: item.iconBg || "#6366f1", color: item.iconFg || "#fff" }}
                  >
                    {item.iconText || item.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900">{item.name}</span>
                      {item.rating && (
                        <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${
                          item.rating === "S" ? "bg-amber-100 text-amber-700" :
                          item.rating === "A" ? "bg-green-100 text-green-700" :
                          item.rating === "B" ? "bg-blue-100 text-blue-700" :
                          item.rating === "C" ? "bg-gray-100 text-gray-600" :
                          "bg-red-100 text-red-700"
                        }`}>{item.rating}</span>
                      )}
                      {item.installPriority && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{item.installPriority}</span>
                      )}
                    </div>
                    {item.alias && <p className="text-xs text-gray-400">{item.alias}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingItem(item); setShowItemForm(true); }} className="p-1.5 rounded hover:bg-gray-100">
                      <Edit2 className="w-4 h-4 text-blue-500" />
                    </button>
                    <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded hover:bg-red-50">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "sections" && (
        <div className="space-y-4">
          {showSectionForm && (
            <SectionForm
              section={editingSection}
              topicId={topic.id}
              onSave={saveSection}
              onCancel={() => { setShowSectionForm(false); setEditingSection(null); }}
              saving={saving}
            />
          )}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">分区内容 ({sections.length})</h3>
              <button onClick={() => { setEditingSection(null); setShowSectionForm(true); }} className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm min-h-[44px]">
                <Plus className="w-4 h-4" /> 添加分区
              </button>
            </div>
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {sections.map(s => (
                <div key={s.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{s.type}</span>
                      {s.title && <span className="font-medium text-sm text-gray-900">{s.title}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingSection(s); setShowSectionForm(true); }} className="p-1.5 rounded hover:bg-gray-100">
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </button>
                      <button onClick={() => deleteSection(s.id)} className="p-1.5 rounded hover:bg-red-50">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                  {s.content && (
                    <p className="text-sm text-gray-600 line-clamp-2">{s.content}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "preview" && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">前台预览</h3>
          <p className="text-sm text-gray-500 mb-4">点击按钮在浏览器中查看前台效果：</p>
          <Link href={`/topics/${topic.slug}`} target="_blank" className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 min-h-[48px]">
            <Eye className="w-5 h-5" /> 打开 /topics/{topic.slug}
          </Link>
        </div>
      )}
    </div>
  );
}

// ===== Item Form =====
function ItemForm({ item, topicId, onSave, onCancel, saving }: {
  item: TopicItem | null;
  topicId: string;
  onSave: (data: any) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [f, setF] = useState({
    name: item?.name || "",
    alias: item?.alias || "",
    rating: item?.rating || "S",
    category: item?.category || "",
    description: item?.description || "",
    analogy: item?.analogy || "",
    suitableFor: item?.suitableFor || "",
    beginnerAdvice: item?.beginnerAdvice || "",
    riskTip: item?.riskTip || "",
    officialUrl: item?.officialUrl || "",
    iconText: item?.iconText || "",
    iconBg: item?.iconBg || "#6366f1",
    iconFg: item?.iconFg || "#ffffff",
    installPriority: item?.installPriority || "按需",
    isBeginnerRecommended: item?.isBeginnerRecommended || false,
    sortOrder: item?.sortOrder ?? 0,
  });

  const Input = ({ label, ...props }: any) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input {...props} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" />
    </div>
  );

  const Textarea = ({ label, ...props }: any) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea {...props} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
    </div>
  );

  return (
    <div className="bg-white rounded-xl border p-6 space-y-4">
      <h3 className="font-semibold text-gray-900">{item ? "编辑条目" : "添加条目"}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="名称 *" value={f.name} onChange={(e: any) => setF((p: any) => ({ ...p, name: e.target.value }))} />
        <Input label="别名" value={f.alias} onChange={(e: any) => setF((p: any) => ({ ...p, alias: e.target.value }))} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">评级 *</label>
          <select value={f.rating} onChange={(e) => setF(p => ({ ...p, rating: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]">
            <option value="S">S 必装</option>
            <option value="A">A 强烈推荐</option>
            <option value="B">B 按需安装</option>
            <option value="C">C 特定需求</option>
            <option value="D">D 谨慎使用</option>
          </select>
        </div>
        <Input label="分类" value={f.category} onChange={(e: any) => setF((p: any) => ({ ...p, category: e.target.value }))} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">安装优先级</label>
          <select value={f.installPriority} onChange={(e) => setF(p => ({ ...p, installPriority: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]">
            <option value="先装">先装</option>
            <option value="高频">高频</option>
            <option value="按需">按需</option>
            <option value="了解即可">了解即可</option>
          </select>
        </div>
        <Input label="官网 URL" value={f.officialUrl} onChange={(e: any) => setF((p: any) => ({ ...p, officialUrl: e.target.value }))} />
        <Input label="图标文字" value={f.iconText} onChange={(e: any) => setF((p: any) => ({ ...p, iconText: e.target.value }))} />
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">图标背景</label>
            <input type="color" value={f.iconBg} onChange={(e) => setF(p => ({ ...p, iconBg: e.target.value }))} className="w-full h-[44px] border rounded-lg cursor-pointer" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">图标文字色</label>
            <input type="color" value={f.iconFg} onChange={(e) => setF(p => ({ ...p, iconFg: e.target.value }))} className="w-full h-[44px] border rounded-lg cursor-pointer" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={f.isBeginnerRecommended} onChange={(e) => setF(p => ({ ...p, isBeginnerRecommended: e.target.checked }))} className="w-4 h-4" />
          <label className="text-sm text-gray-700">新手推荐</label>
        </div>
        <Textarea label="简介" value={f.description} onChange={(e: any) => setF((p: any) => ({ ...p, description: e.target.value }))} />
        <Textarea label="国内类比" value={f.analogy} onChange={(e: any) => setF((p: any) => ({ ...p, analogy: e.target.value }))} />
        <Textarea label="适合谁" value={f.suitableFor} onChange={(e: any) => setF((p: any) => ({ ...p, suitableFor: e.target.value }))} />
        <Textarea label="新手建议" value={f.beginnerAdvice} onChange={(e: any) => setF((p: any) => ({ ...p, beginnerAdvice: e.target.value }))} />
        <Textarea label="避坑提醒" value={f.riskTip} onChange={(e: any) => setF((p: any) => ({ ...p, riskTip: e.target.value }))} />
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave(f)} disabled={saving || !f.name} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 min-h-[48px]">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "保存中..." : "保存"}
        </button>
        <button onClick={onCancel} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 min-h-[48px]">取消</button>
      </div>
    </div>
  );
}

// ===== Section Form =====
function SectionForm({ section, topicId, onSave, onCancel, saving }: {
  section: TopicSection | null;
  topicId: string;
  onSave: (data: any) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [f, setF] = useState({
    type: section?.type || "intro",
    title: section?.title || "",
    content: section?.content || "",
    sortOrder: section?.sortOrder ?? 0,
  });

  return (
    <div className="bg-white rounded-xl border p-6 space-y-4">
      <h3 className="font-semibold text-gray-900">{section ? "编辑分区" : "添加分区"}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">类型 *</label>
          <select value={f.type} onChange={(e) => setF(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]">
            <option value="intro">开篇 / intro</option>
            <option value="reading_guide">怎么读榜单</option>
            <option value="notice">避坑提醒</option>
            <option value="next_preview">下一篇预告</option>
            <option value="faq">FAQ</option>
            <option value="custom_text">自定义文本</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
          <input value={f.title} onChange={(e) => setF(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" placeholder="分区标题" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
          <textarea value={f.content} onChange={(e) => setF(p => ({ ...p, content: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" rows={6} placeholder="分区内容，支持换行" />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave(f)} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 min-h-[48px]">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "保存中..." : "保存"}
        </button>
        <button onClick={onCancel} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 min-h-[48px]">取消</button>
      </div>
    </div>
  );
}
