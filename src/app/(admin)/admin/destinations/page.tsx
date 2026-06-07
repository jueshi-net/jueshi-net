"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Globe, Plus, Edit2, ToggleLeft, ToggleRight, Loader2, AlertCircle, Search
} from "lucide-react";

interface Destination {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  currency: string;
  region: string;
  emoji: string;
  heroTitle: string;
  heroSubtitle: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  keyCities: string[];
  userCount: string;
  docCount: string;
  isActive: boolean;
  sortOrder: number;
  _count: { tools: number; guides: number; services: number };
}

export default function AdminDestinationsPage() {
  const router = useRouter();
  const [dests, setDests] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [search, setSearch] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/destinations");
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setDests(data.data || []);
    } catch {
      setMessage({ type: "error", text: "获取数据失败" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await fetch("/api/admin/destinations", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !current }),
      });
      fetchData();
    } catch {
      setMessage({ type: "error", text: "操作失败" });
    }
  };

  const filtered = dests.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.slug.toLowerCase().includes(search.toLowerCase()) ||
    d.region.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="p-6 text-center text-gray-500 flex items-center justify-center gap-2 min-h-[200px]">
      <Loader2 className="w-5 h-5 animate-spin" /> 加载中...
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold flex items-center gap-2">
              <Globe className="w-5 h-5" /> 国家/地区管理 (pSEO CMS)
            </h1>
            <p className="text-sm text-blue-100 mt-1">
              管理全球出海市场大盘 — 增删改查国家专题、百科指南与服务商
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/destinations/new/edit")}
            className="inline-flex items-center gap-2 px-5 py-2 bg-white text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4" /> 新增国家
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-blue-700">{dests.length}</div>
          <div className="text-xs text-blue-600">总数</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-green-700">{dests.filter(d => d.isActive).length}</div>
          <div className="text-xs text-green-600">已发布</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-gray-500">{dests.filter(d => !d.isActive).length}</div>
          <div className="text-xs text-gray-400">草稿</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-purple-700">{dests.reduce((s, d) => s + d._count.tools, 0)}</div>
          <div className="text-xs text-purple-600">工具总数</div>
        </div>
      </div>

      {message.text && (
        <div className={`p-3 rounded-lg text-sm ${message.type === "error" ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-600 border border-green-200"}`}>
          {message.type === "error" && <AlertCircle className="w-4 h-4 inline mr-1" />}{message.text}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="搜索国家名称、slug 或区域..."
          className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
        />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">状态</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">国家</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">区域</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">工具</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">指南</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">服务商</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(d => (
                <tr key={d.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(d.id, d.isActive)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${d.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {d.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      {d.isActive ? '已发布' : '草稿'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{d.emoji}</span>
                      <div>
                        <div className="font-semibold">{d.name}</div>
                        <div className="text-xs text-gray-400 font-mono">/{d.slug} · {d.currency}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{d.region}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">{d._count.tools}</span></td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded text-xs">{d._count.guides}</span></td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">{d._count.services}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a href={`/destinations/${d.slug}`} target="_blank" rel="noopener" className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors">预览</a>
                      <button onClick={() => router.push(`/admin/destinations/${d.slug}/edit`)} className="px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded transition-colors flex items-center gap-1"><Edit2 className="w-3.5 h-3.5" /> 编辑</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">暂无数据</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
