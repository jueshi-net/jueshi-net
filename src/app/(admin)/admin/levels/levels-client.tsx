"use client";
import { useState } from "react";
import Link from "next/link";
import { Star, Award, Plus, Edit2, Save, X, Loader2, AlertCircle, CheckCircle, ToggleLeft, ToggleRight } from "lucide-react";

type UserLevel = { id: string; key: string; name: string; minGrowth: number; maxGrowth: number | null; description: string | null; benefits: any; iconText: string; color: string; sortOrder: number; isActive: boolean; createdAt: Date | string; updatedAt: Date | string };

export default function LevelsClient({ initialLevels }: { initialLevels: UserLevel[] }) {
  const [levels, setLevels] = useState<UserLevel[]>(initialLevels);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);
  const [editingLevel, setEditingLevel] = useState<UserLevel | null>(null);
  const [showLevelForm, setShowLevelForm] = useState(false);

  const saveLevel = async (data: any) => {
    setSaving(true);
    try {
      const method = editingLevel ? "PUT" : "POST";
      const url = editingLevel ? `/api/admin/levels/${editingLevel.id}` : "/api/admin/levels";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      const listRes = await fetch("/api/admin/levels");
      const listData = await listRes.json();
      if (listData.success) setLevels(listData.data);
      setEditingLevel(null); setShowLevelForm(false);
      setMessage({ type: "success", text: editingLevel ? "等级已更新" : "等级已创建" });
    } catch (e: any) { setMessage({ type: "error", text: e.message }); }
    finally { setSaving(false); }
  };

  const toggleLevel = async (level: UserLevel) => {
    try {
      const res = await fetch(`/api/admin/levels/${level.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !level.isActive }) });
      const result = await res.json();
      if (result.success) {
        setLevels(prev => prev.map(l => l.id === level.id ? { ...l, isActive: !l.isActive } : l));
        setMessage({ type: "success", text: result.data.isActive ? "已启用" : "已停用" });
      }
    } catch (e: any) { setMessage({ type: "error", text: e.message }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Link href="/admin/community/badges" className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors">
          <Award className="w-4 h-4" /> 勋章管理 →
        </Link>
      </div>

      <p className="text-sm text-gray-500">勋章管理已迁移至 <Link href="/admin/community/badges" className="text-blue-600 hover:underline">社区管理 → 勋章管理</Link></p>

      {message.text && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${message.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {message.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <div className="space-y-4">
        {showLevelForm && (
          <LevelForm level={editingLevel} onSave={saveLevel} onCancel={() => { setShowLevelForm(false); setEditingLevel(null); }} saving={saving} />
        )}
        <div className="flex justify-end">
          <button onClick={() => { setEditingLevel(null); setShowLevelForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 min-h-[44px]">
            <Plus className="w-4 h-4" /> 添加等级
          </button>
        </div>
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">图标</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">等级</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">成长值范围</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">状态</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {levels.map(l => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-lg">{l.iconText}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{l.name}</div>
                    <div className="text-xs text-gray-400">{l.key}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{l.minGrowth} ~ {l.maxGrowth ?? "无上限"}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${l.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {l.isActive ? "启用" : "停用"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleLevel(l)} className="p-1.5 rounded hover:bg-gray-100" title={l.isActive ? "停用" : "启用"}>
                        {l.isActive ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                      </button>
                      <button onClick={() => { setEditingLevel(l); setShowLevelForm(true); }} className="p-1.5 rounded hover:bg-gray-100">
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LevelForm({ level, onSave, onCancel, saving }: { level: UserLevel | null; onSave: (d: any) => void; onCancel: () => void; saving: boolean }) {
  const [f, setF] = useState<{ key: string; name: string; minGrowth: number; maxGrowth: number | null; description: string; iconText: string; color: string; sortOrder: number }>({ key: level?.key || "", name: level?.name || "", minGrowth: level?.minGrowth ?? 0, maxGrowth: level?.maxGrowth ?? null, description: level?.description || "", iconText: level?.iconText || "⭐", color: level?.color || "blue-500", sortOrder: level?.sortOrder ?? 0 });
  const Input = (p: any) => <div><label className="block text-sm font-medium text-gray-700 mb-1">{p.label}</label><input {...p.input} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" /></div>;
  const Textarea = (p: any) => <div><label className="block text-sm font-medium text-gray-700 mb-1">{p.label}</label><textarea {...p.textarea} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} /></div>;
  return (
    <div className="bg-white rounded-xl border p-6 space-y-4">
      <h3 className="font-semibold text-gray-900">{level ? "编辑等级" : "添加等级"}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Key *" input={{ value: f.key, onChange: (e: any) => setF(p => ({ ...p, key: e.target.value })), disabled: !!level, placeholder: "lv1" }} />
        <Input label="名称 *" input={{ value: f.name, onChange: (e: any) => setF(p => ({ ...p, name: e.target.value })), placeholder: "Lv.1 新手" }} />
        <Input label="图标" input={{ value: f.iconText, onChange: (e: any) => setF(p => ({ ...p, iconText: e.target.value })), placeholder: "⭐" }} />
        <Input label="最低成长值 *" input={{ type: "number", value: f.minGrowth, onChange: (e: any) => setF(p => ({ ...p, minGrowth: parseInt(e.target.value) || 0 })) }} />
        <Input label="最高成长值 (空=无上限)" input={{ type: "number", value: f.maxGrowth ?? "", onChange: (e: any) => { const v = e.target.value; setF(p => ({ ...p, maxGrowth: v === "" ? null : parseInt(v) })); } }} />
        <Input label="颜色" input={{ value: f.color, onChange: (e: any) => setF(p => ({ ...p, color: e.target.value })), placeholder: "green-500" }} />
        <div className="md:col-span-3">
          <Textarea label="描述" textarea={{ value: f.description, onChange: (e: any) => setF(p => ({ ...p, description: e.target.value })) }} />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave(f)} disabled={saving || !f.key || !f.name} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 min-h-[48px]">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saving ? "保存中..." : "保存"}
        </button>
        <button onClick={onCancel} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 min-h-[48px]">取消</button>
      </div>
    </div>
  );
}
