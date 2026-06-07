"use client";

import { useState, useEffect } from "react";
import {
  Key, Plus, Trash2, X, Save, ToggleLeft, ToggleRight,
  Loader2, AlertCircle, Copy, Calendar, Users, Shield
} from "lucide-react";

interface InviteCode {
  id: string;
  code: string;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  expiresAt: string | null;
  createdBy: string | null;
  note: string | null;
}

export default function AdminInvitesPage() {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    maxUses: 100,
    expiresAt: "",
    note: "",
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/invites");
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setCodes(data.data || []);
    } catch {
      setMessage({ type: "error", text: "获取邀请码列表失败" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.code.trim()) {
      setMessage({ type: "error", text: "邀请码不能为空" });
      return;
    }
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code.trim().toUpperCase(),
          maxUses: formData.maxUses,
          expiresAt: formData.expiresAt || null,
          note: formData.note || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `邀请码 ${data.data.code} 已创建` });
        fetchData();
        resetForm();
      } else {
        setMessage({ type: "error", text: data.error || "创建失败" });
      }
    } catch {
      setMessage({ type: "error", text: "网络错误" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此邀请码？")) return;
    try {
      const res = await fetch(`/api/admin/invites/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "success", text: "已删除" });
        fetchData();
      }
    } catch {
      setMessage({ type: "error", text: "删除失败" });
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    setToggling(id);
    try {
      await fetch(`/api/admin/invites/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      fetchData();
    } catch {
      setMessage({ type: "error", text: "操作失败" });
    } finally {
      setToggling(null);
    }
  };

  const copyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({ code: "", maxUses: 100, expiresAt: "", note: "" });
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const prefix = "PIONEER";
    let random = "";
    for (let i = 0; i < 4; i++) random += chars[Math.floor(Math.random() * chars.length)];
    setFormData({ ...formData, code: prefix + random });
  };

  const totalUsed = codes.reduce((s, c) => s + c.usedCount, 0);
  const activeCount = codes.filter(c => c.isActive).length;

  if (loading) return (
    <div className="p-6 text-center text-gray-500 flex items-center justify-center gap-2 min-h-[200px]">
      <Loader2 className="w-5 h-5 animate-spin" /> 加载中...
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-xl p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold flex items-center gap-2">
              <Key className="w-5 h-5" /> 邀请码管控台
            </h1>
            <p className="text-sm text-violet-100 mt-1">
              先锋探路官邀请制注册 — 管理邀请码的生成、分发与核销
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-5 py-2 bg-white text-violet-700 rounded-xl text-sm font-bold hover:bg-violet-50 transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4" /> 生成邀请码
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-violet-700">{codes.length}</div>
          <div className="text-xs text-violet-600">邀请码总数</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-green-700">{activeCount}</div>
          <div className="text-xs text-green-600">可用中</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-blue-700">{totalUsed.toLocaleString()}</div>
          <div className="text-xs text-blue-600">累计核销</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-amber-700">{codes.length - activeCount}</div>
          <div className="text-xs text-amber-600">已停用</div>
        </div>
      </div>

      {message.text && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === "error"
            ? "bg-red-50 text-red-600 border border-red-200"
            : "bg-green-50 text-green-600 border border-green-200"
        }`}>
          {message.type === "error" && <AlertCircle className="w-4 h-4 inline mr-1" />}{message.text}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-violet-600" /> 生成新邀请码
              </h2>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded min-h-[44px]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">邀请码 *</label>
                <div className="flex gap-2">
                  <input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono tracking-widest"
                    placeholder="如 PIONEER2026"
                    maxLength={20}
                  />
                  <button
                    onClick={generateRandomCode}
                    className="px-3 py-2 bg-violet-100 text-violet-700 rounded-lg text-sm hover:bg-violet-200 transition-colors whitespace-nowrap"
                  >
                    🎲 随机生成
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">最大使用次数</label>
                  <input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    min={1}
                    max={10000}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> 过期日期（留空=永不过期）
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">备注</label>
                <input
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="如：首批种子用户 / 合作伙伴专享"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 生成
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 min-h-[44px]"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Code List */}
      <div className="space-y-3">
        {codes.length === 0 && (
          <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
            <Key className="w-14 h-14 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium text-gray-500 mb-1">暂无邀请码</p>
            <p className="text-sm">点击「生成邀请码」创建第一个邀请码</p>
          </div>
        )}
        {codes.map((invite) => {
          const usagePercent = invite.maxUses > 0 ? Math.round((invite.usedCount / invite.maxUses) * 100) : 0;
          const isExpired = invite.expiresAt && new Date(invite.expiresAt) < new Date();
          return (
            <div
              key={invite.id}
              className={`bg-white rounded-xl border overflow-hidden transition-opacity ${
                !invite.isActive || isExpired ? "opacity-60" : ""
              }`}
            >
              <div className="p-4 flex items-start justify-between flex-wrap gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-lg font-bold text-violet-700 tracking-wider">
                      {invite.code}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      invite.isActive && !isExpired
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      {isExpired ? "已过期" : invite.isActive ? "可用" : "已停用"}
                    </span>
                    {invite.note && (
                      <span className="text-xs text-gray-400 truncate max-w-[200px]">
                        {invite.note}
                      </span>
                    )}
                  </div>

                  {/* Usage bar */}
                  <div className="mt-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <Users className="w-3 h-3" />
                      已核销 {invite.usedCount} / {invite.maxUses}
                      <span className="text-gray-400">({usagePercent}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          usagePercent >= 90 ? "bg-red-500" : usagePercent >= 60 ? "bg-amber-500" : "bg-violet-500"
                        }`}
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>创建：{new Date(invite.createdAt).toLocaleDateString("zh-CN")}</span>
                    {invite.expiresAt && (
                      <span className={isExpired ? "text-red-400" : ""}>
                        过期：{new Date(invite.expiresAt).toLocaleDateString("zh-CN")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => copyCode(invite.code, invite.id)}
                    className="p-2 hover:bg-gray-100 rounded text-gray-500 min-h-[44px]"
                    title="复制邀请码"
                  >
                    {copiedId === invite.id ? "✅" : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleToggle(invite.id, invite.isActive)}
                    disabled={toggling === invite.id}
                    className="p-2 hover:bg-gray-100 rounded min-h-[44px]"
                  >
                    {toggling === invite.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : invite.isActive
                        ? <ToggleRight className="w-6 h-6 text-green-500" />
                        : <ToggleLeft className="w-6 h-6 text-gray-300" />
                    }
                  </button>
                  <button
                    onClick={() => handleDelete(invite.id)}
                    className="p-2 hover:bg-gray-100 rounded text-red-600 min-h-[44px]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
