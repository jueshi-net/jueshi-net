"use client";
import { useState } from "react";
import { Star, Award, Plus, Edit2, Trash2, Save, X, Loader2, AlertCircle, CheckCircle, ToggleLeft, ToggleRight } from "lucide-react";

type UserLevel = { id: string; key: string; name: string; minGrowth: number; maxGrowth: number | null; description: string | null; benefits: any; iconText: string; color: string; sortOrder: number; isActive: boolean; createdAt: Date | string; updatedAt: Date | string };
type UserBadge = { id: string; key: string; name: string; description: string | null; iconText: string; color: string; category: string; conditionText: string | null; isActive: boolean; sortOrder: number; createdAt: Date | string; updatedAt: Date | string };

export default function LevelsClient({ initialLevels, initialBadges }: { initialLevels: UserLevel[]; initialBadges: UserBadge[] }) {
  const [levels, setLevels] = useState<UserLevel[]>(initialLevels);
  const [badges, setBadges] = useState<UserBadge[]>(initialBadges);
  const [activeTab, setActiveTab] = useState<"levels" | "badges">("levels");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  const [editingLevel, setEditingLevel] = useState<UserLevel | null>(null);
  const [showLevelForm, setShowLevelForm] = useState(false);
  const [editingBadge, setEditingBadge] = useState<UserBadge | null>(null);
  const [showBadgeForm, setShowBadgeForm] = useState(false);

  // Level CRUD
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

  // Badge CRUD
  const saveBadge = async (data: any) => {
    setSaving(true);
    try {
      const method = editingBadge ? "PUT" : "POST";
      const url = editingBadge ? `/api/admin/badges/${editingBadge.id}` : "/api/admin/badges";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      const listRes = await fetch("/api/admin/badges");
      const listData = await listRes.json();
      if (listData.success) setBadges(listData.data);
      setEditingBadge(null); setShowBadgeForm(false);
      setMessage({ type: "success", text: editingBadge ? "勋章已更新" : "勋章已创建" });
    } catch (e: any) { setMessage({ type: "error", text: e.message }); }
    finally { setSaving(false); }
  };

  const toggleBadge = async (badge: UserBadge) => {
    try {
      const res = await fetch(`/api/admin/badges/${badge.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !badge.isActive }) });
      const result = await res.json();
      if (result.success) {
        setBadges(prev => prev.map(b => b.id === badge.id ? { ...b, isActive: !b.isActive } : b));
        setMessage({ type: "success", text: result.data.isActive ? "已启用" : "已停用" });
      }
    } catch (e: any) { setMessage({ type: "error", text: e.message }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">会员等级与勋章</h1>
      </div>

      {message.text && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${message.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {message.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button onClick={() => setActiveTab("levels")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] flex items-center gap-2 ${activeTab === "levels" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          <Star className="w-4 h-4" /> 等级 ({levels.length})
        </button>
        <button onClick={() => setActiveTab("badges")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] flex items-center gap-2 ${activeTab === "badges" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          <Award className="w-4 h-4" /> 勋章 ({badges.length})
        </button>
      </div>

      {/* Levels */}
      {activeTab === "levels" && (
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
      )}

      {/* Badges */}
      {activeTab === "badges" && (
        <div className="space-y-4">
          {showBadgeForm && (
            <BadgeForm badge={editingBadge} onSave={saveBadge} onCancel={() => { setShowBadgeForm(false); setEditingBadge(null); }} saving={saving} />
          )}
          <div className="flex justify-end">
            <button onClick={() => { setEditingBadge(null); setShowBadgeForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 min-h-[44px]">
              <Plus className="w-4 h-4" /> 添加勋章
            </button>
          </div>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">图标</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">勋章</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">分类</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">条件</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">状态</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {badges.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-lg">{b.iconText}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{b.name}</div>
                      <div className="text-xs text-gray-400">{b.key}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">{b.category}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">{b.conditionText}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {b.isActive ? "启用" : "停用"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleBadge(b)} className="p-1.5 rounded hover:bg-gray-100" title={b.isActive ? "停用" : "启用"}>
                          {b.isActive ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                        </button>
                        <button onClick={() => { setEditingBadge(b); setShowBadgeForm(true); }} className="p-1.5 rounded hover:bg-gray-100">
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
      )}
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

function BadgeForm({ badge, onSave, onCancel, saving }: { badge: UserBadge | null; onSave: (d: any) => void; onCancel: () => void; saving: boolean }) {
  const [f, setF] = useState({ key: badge?.key || "", name: badge?.name || "", description: badge?.description || "", iconText: badge?.iconText || "🎖️", color: badge?.color || "purple-500", category: badge?.category || "system", conditionText: badge?.conditionText || "", sortOrder: badge?.sortOrder ?? 0 });
  const Input = (p: any) => <div><label className="block text-sm font-medium text-gray-700 mb-1">{p.label}</label><input {...p.input} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]" /></div>;
  const Textarea = (p: any) => <div><label className="block text-sm font-medium text-gray-700 mb-1">{p.label}</label><textarea {...p.textarea} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} /></div>;
  const cats = ["checkin", "review", "topic", "forum", "member", "system"];
  return (
    <div className="bg-white rounded-xl border p-6 space-y-4">
      <h3 className="font-semibold text-gray-900">{badge ? "编辑勋章" : "添加勋章"}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Key *" input={{ value: f.key, onChange: (e: any) => setF(p => ({ ...p, key: e.target.value })), disabled: !!badge, placeholder: "first_login" }} />
        <Input label="名称 *" input={{ value: f.name, onChange: (e: any) => setF(p => ({ ...p, name: e.target.value })), placeholder: "初来乍到" }} />
        <Input label="图标" input={{ value: f.iconText, onChange: (e: any) => setF(p => ({ ...p, iconText: e.target.value })), placeholder: "🎖️" }} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
          <select value={f.category} onChange={(e) => setF(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[44px]">
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <Input label="颜色" input={{ value: f.color, onChange: (e: any) => setF(p => ({ ...p, color: e.target.value })), placeholder: "purple-500" }} />
        <Input label="排序" input={{ type: "number", value: f.sortOrder, onChange: (e: any) => setF(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 })) }} />
        <div className="md:col-span-3">
          <Textarea label="描述" textarea={{ value: f.description, onChange: (e: any) => setF(p => ({ ...p, description: e.target.value })) }} />
        </div>
        <div className="md:col-span-3">
          <Textarea label="获得条件" textarea={{ value: f.conditionText, onChange: (e: any) => setF(p => ({ ...p, conditionText: e.target.value })) }} />
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
