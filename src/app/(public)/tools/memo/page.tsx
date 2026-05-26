"use client";
import { AdSlot } from '@/components/ad-slot';

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Pin,
  PinOff,
  Search,
  Copy,
  Download,
  Upload,
  Edit2,
  Check,
  X,
  CheckCircle,
  AlertCircle,
  Cloud,
  CloudOff,
  Clock,
  Calendar,
} from "lucide-react";
import { FAQSection } from '@/components/faq-section';
import { Breadcrumb } from '@/components/breadcrumb';
import { trackEvent } from '@/lib/analytics';
import { buttonVariants, inputStyles, cardStyles, labelStyles } from "@/lib/ui-styles";

const CATEGORIES = [
  "常用地址",
  "常用品名",
  "HS/申报",
  "单号",
  "单据备注",
  "常用网站",
  "客服话术",
];

const STORAGE_KEY = "cross_border_notes";

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  dueDate?: string | null;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Note[];
  } catch {
    console.error("Failed to load notes from localStorage");
  }
  return [];
}

function saveNotes(notes: Note[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    console.error("Failed to save notes to localStorage");
  }
}

// --- Due date helpers ---
function getDueDateStatus(dueDate?: string | null): 'overdue' | 'today' | 'upcoming' | 'none' {
  if (!dueDate) return 'none';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diff = due.getTime() - now.getTime();
  const dayMs = 86400000;
  if (diff < 0) return 'overdue';
  if (diff < dayMs) return 'today';
  return 'upcoming';
}

function formatDueDate(dueDate: string): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diff = due.getTime() - now.getTime();
  const dayMs = 86400000;
  if (diff < 0) {
    const days = Math.floor(Math.abs(diff) / dayMs);
    return `已过期${days}天`;
  }
  if (diff < dayMs) return '今天到期';
  const days = Math.ceil(diff / dayMs);
  if (days === 1) return '明天到期';
  return `${days}天后到期`;
}

export default function MemoPage() {
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());
  const [editing, setEditing] = useState<Note | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDueStatus, setFilterDueStatus] = useState<'all' | 'overdue' | 'today' | 'upcoming' | 'none'>('all');
  const [message, setMessage] = useState({ type: "" as "success" | "error" | "", text: "" });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", category: CATEGORIES[0], isPinned: false, dueDate: "" });

  // Cloud sync state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  // Check auth status on mount
  useEffect(() => {
    fetch("/api/auth/session")
      .then(r => r.json())
      .then(data => {
        if (data?.user) {
          setIsLoggedIn(true);
          loadCloudMemos();
        }
      })
      .catch(() => {});
  }, []);

  const loadCloudMemos = async () => {
    try {
      const res = await fetch("/api/memos");
      if (res.ok) {
        const data = await res.json();
        const cloudNotes: Note[] = (data.memos || []).map((m: any) => ({
          id: m.id,
          title: m.title,
          content: m.content || "",
          category: m.category || "",
          isPinned: m.isPinned,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
          dueDate: m.dueDate ? new Date(m.dueDate).toISOString().slice(0, 16) : null,
        }));
        setNotes(cloudNotes);
        setLastSynced(new Date().toLocaleTimeString("zh-CN"));
      }
    } catch (e) {
      console.error("Failed to load cloud memos", e);
    }
  };

  const flashMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 2500);
  };

  const persist = (updated: Note[]) => {
    setNotes(updated);
    saveNotes(updated);
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setFormData({ title: "", content: "", category: CATEGORIES[0], isPinned: false, dueDate: "" });
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() && !formData.content.trim()) {
      flashMessage("error", "请输入标题或内容");
      return;
    }

    const now = new Date().toISOString();
    if (editing) {
      const updated = notes.map((n) =>
        n.id === editing.id
          ? { ...n, title: formData.title.trim(), content: formData.content, category: formData.category, isPinned: formData.isPinned, dueDate: formData.dueDate || null, updatedAt: now }
          : n
      );
      persist(updated);

      // Sync to cloud if logged in
      if (isLoggedIn) {
        try {
          await fetch(`/api/memos?id=${editing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: formData.title.trim(),
              content: formData.content,
              category: formData.category,
              isPinned: formData.isPinned,
              dueDate: formData.dueDate || null,
            }),
          });
        } catch {}
      }

      flashMessage("success", "便签已更新");
    } else {
      const newNote: Note = {
        id: generateId(),
        title: formData.title.trim(),
        content: formData.content,
        category: formData.category,
        isPinned: formData.isPinned,
        dueDate: formData.dueDate || null,
        createdAt: now,
        updatedAt: now,
      };
      persist([newNote, ...notes]);
      trackEvent.memoAdd();

      // Sync to cloud if logged in
      if (isLoggedIn) {
        try {
          await fetch("/api/memos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: formData.title.trim(),
              content: formData.content,
              category: formData.category,
              isPinned: formData.isPinned,
              dueDate: formData.dueDate || null,
            }),
          });
        } catch {}
      }

      flashMessage("success", "便签已创建");
    }
    resetForm();
  };

  const handleDelete = async (id: string) => {
    persist(notes.filter((n) => n.id !== id));
    if (isLoggedIn) {
      try {
        await fetch(`/api/memos?id=${id}`, { method: "DELETE" });
      } catch {}
    }
    flashMessage("success", "便签已删除");
  };

  const togglePin = async (note: Note) => {
    const updated = notes.map((n) =>
      n.id === note.id ? { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() } : n
    );
    persist(updated);
    if (isLoggedIn) {
      try {
        await fetch(`/api/memos?id=${note.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPinned: !note.isPinned }),
        });
      } catch {}
    }
  };

  const startEdit = (note: Note) => {
    setEditing(note);
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category,
      isPinned: note.isPinned,
      dueDate: note.dueDate ? note.dueDate.slice(0, 16) : "",
    });
    setShowForm(true);
  };

  const handleCopy = async (note: Note) => {
    try {
      await navigator.clipboard.writeText(note.content);
      trackEvent.memoCopy();
      setCopiedId(note.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      flashMessage("error", "复制失败");
    }
  };

  const handleExport = () => {
    trackEvent.memoExport();
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `跨境便签备份_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flashMessage("success", "导出成功");
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target?.result as string) as Note[];
          if (!Array.isArray(imported)) throw new Error("Invalid format");
          const existingIds = new Set(notes.map((n) => n.id));
          const newNotes = imported.filter((n) => !existingIds.has(n.id));
          if (newNotes.length === 0) {
            flashMessage("error", "没有新的便签可导入");
            return;
          }
          persist([...newNotes, ...notes]);
          flashMessage("success", `成功导入 ${newNotes.length} 条便签`);
        } catch {
          flashMessage("error", "导入失败，文件格式不正确");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearAll = () => {
    persist([]);
    setShowClearConfirm(false);
    flashMessage("success", "所有便签已清空");
  };

  // Count due-date memos for reminder badge
  const overdueCount = notes.filter(n => getDueDateStatus(n.dueDate) === 'overdue').length;
  const todayCount = notes.filter(n => getDueDateStatus(n.dueDate) === 'today').length;

  // Filtering & sorting
  const filteredNotes = notes
    .filter((n) => {
      const matchesSearch =
        !searchQuery ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !filterCategory || n.category === filterCategory;
      const matchesDueStatus = filterDueStatus === 'all' || getDueDateStatus(n.dueDate) === filterDueStatus;
      return matchesSearch && matchesCategory && matchesDueStatus;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Breadcrumb />
      </div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">跨境工作便签</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isLoggedIn
              ? `已登录 \u00b7 数据同步到云端${lastSynced ? `，上次同步 ${lastSynced}` : ""}`
              : "数据保存在当前浏览器，安全私密"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isLoggedIn && (
            <button
              onClick={loadCloudMemos}
              disabled={isSyncing}
              className="px-3 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm hover:bg-green-100 flex items-center gap-1.5"
            >
              <Cloud className="w-4 h-4" /> {isSyncing ? "同步中..." : "从云端加载"}
            </button>
          )}
          {!isLoggedIn && (
            <a
              href="/login?redirect=/tools/memo"
              className="px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm hover:bg-blue-100 flex items-center gap-1.5"
            >
              <CloudOff className="w-4 h-4" /> 登录开启云同步
            </a>
          )}
          <button
            onClick={handleImport}
            className="px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" /> 导入
          </button>
          <button
            onClick={handleExport}
            disabled={notes.length === 0}
            className="px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" /> 导出
          </button>
          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={notes.length === 0}
            className="px-3 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" /> 清空
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> 新建便签
          </button>
        </div>
      </div>

      {/* Disclaimers */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm text-amber-800 space-y-1">
        <p>• 数据默认保存在当前浏览器</p>
        <p>• 登录后可开启云端同步，更换设备不丢失</p>
        <p>• 如需长期保存，请导出 JSON 备份</p>
      </div>

      {/* Due date reminders */}
      {(overdueCount > 0 || todayCount > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-sm space-y-1">
          <div className="flex items-center gap-2 text-red-700 font-medium">
            <Clock className="w-4 h-4" /> 到期提醒
          </div>
          {overdueCount > 0 && (
            <p className="text-red-600">⚠️ {overdueCount} 条便签已过期，请及时处理</p>
          )}
          {todayCount > 0 && (
            <p className="text-orange-600">🔔 {todayCount} 条便签今天到期</p>
          )}
        </div>
      )}

      {/* Message Toast */}
      {message.text && (
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm mb-4 ${
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索便签..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm min-w-[140px]"
        >
          <option value="">全部分类</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={filterDueStatus}
          onChange={(e) => setFilterDueStatus(e.target.value as any)}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm min-w-[140px]"
        >
          <option value="all">全部日期</option>
          <option value="overdue">已过期</option>
          <option value="today">今天到期</option>
          <option value="upcoming">即将到期</option>
          <option value="none">无到期日</option>
        </select>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editing ? "编辑便签" : "新建便签"}</h2>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
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
              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-gray-500">分类</span>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="rounded"
                  />
                  置顶
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  保存
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h2 className="text-lg font-semibold">确认清空</h2>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              确定要删除所有便签吗？此操作不可撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleClearAll}
className={buttonVariants.primary}
              >
                确认清空
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.map((note) => {
          const dueStatus = getDueDateStatus(note.dueDate);
          return (
            <div
              key={note.id}
              className={`bg-white rounded-xl border p-5 hover:shadow-md transition-all ${
                note.isPinned ? "border-yellow-200 bg-yellow-50/30" : "border-gray-100"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-md font-medium">
                    {note.category}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                  {note.isPinned && <Pin className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                  {note.dueDate && (
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-md font-medium ${
                      dueStatus === 'overdue' ? "bg-red-100 text-red-600" :
                      dueStatus === 'today' ? "bg-orange-100 text-orange-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      <Clock className="w-3 h-3 inline mr-1" />
                      {formatDueDate(note.dueDate)}
                    </span>
                  )}
                </div>
                <div className="flex gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => handleCopy(note)}
                    className="p-1.5 text-gray-400 hover:text-green-600 rounded transition-colors"
                    title="复制内容"
                  >
                    {copiedId === note.id ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => togglePin(note)}
                    className="p-1.5 text-gray-400 hover:text-yellow-500 rounded transition-colors"
                    title={note.isPinned ? "取消置顶" : "置顶"}
                  >
                    {note.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => startEdit(note)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors"
                    title="编辑"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 whitespace-pre-wrap line-clamp-6">{note.content}</p>
              <p className="text-xs text-gray-400 mt-3">
                更新于 {new Date(note.updatedAt).toLocaleString("zh-CN")}
              </p>
            </div>
          );
        })}
        {filteredNotes.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
            {searchQuery || filterCategory || filterDueStatus !== 'all' ? "没有找到匹配的便签" : "还没有便签，点击上方按钮创建"}
          </div>
        )}
      </div>

      {/* FAQ */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <FAQSection title="跨境工作便签常见问题" items={[
          {
            question: "便签数据存在哪里？会同步到云端吗？",
            answer: "便签数据默认保存在您浏览器的本地存储（localStorage）中。登录后可以点击「登录开启云同步」，将便签同步到云端数据库，实现跨设备访问。建议定期使用导出功能备份。",
          },
          {
            question: "如何备份和恢复便签？",
            answer: "点击顶部的\"导出 JSON\"按钮可以下载所有便签的备份文件。需要恢复时，点击\"导入 JSON\"选择之前导出的文件即可。建议定期备份，防止浏览器数据被清理。",
          },
          {
            question: "便签有什么用途？",
            answer: "适合记录跨境工作中常用的信息：收件人地址、商品品名和 HS 编码候选、运单号整理、发票备注、客服话术模板等。7 个预设分类覆盖常见场景。还可以设置到期提醒，方便跟进待办事项。",
          },
          {
            question: "数据安全吗？别人能看到我的便签吗？",
            answer: "便签仅保存在您的浏览器本地（或您自己的云账户中），其他人无法通过网络访问。但如果您使用公共电脑，请记得退出时清除浏览器数据。建议不要在便签中存储密码、银行卡号等高敏感信息。",
          },
        ]} />

        {/* Tool-specific ads */}
        <AdSlot placement="tool-memo-bottom" className="mt-8 mb-8" />
      </div>
    </div>
  );
}
