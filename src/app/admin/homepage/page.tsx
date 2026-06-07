"use client";

import { useState, useEffect } from "react";
import { DEFAULT_CONFIG } from "@/types/homepage";

export default function AdminHomepagePage() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState<"hero" | "stats" | "tools" | "membership" | "ads">("hero");

  useEffect(() => {
    fetch("/api/homepage/config")
      .then((r) => r.json())
      .then((d) => setConfig(d.config || DEFAULT_CONFIG));
  }, []);

  const save = async (key: string, value: any) => {
    setSaving(true);
    try {
      await fetch("/api/admin/homepage/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      setConfig((prev) => ({ ...prev, [key]: value }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">首页运营配置</h1>
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {(["hero", "stats", "tools", "membership", "ads"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              section === s ? "bg-teal-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {s === "hero" ? "Hero" : s === "stats" ? "统计数字" : s === "tools" ? "热门工具" : s === "membership" ? "会员区" : "广告位"}
          </button>
        ))}
      </div>

      {section === "hero" && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold">Hero 区文案</h2>
          {(["title", "highlightedText", "subtitle", "primaryButtonText", "secondaryButtonText"] as const).map((k) => (
            <div key={k}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{k}</label>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                defaultValue={(config.hero as any)[k]}
                onBlur={(e) => save("hero", { ...config.hero, [k]: e.target.value })}
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">信任数据 (每行一个)</label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              defaultValue={config.hero.trustItems.join("\n")}
              onBlur={(e) => save("hero", { ...config.hero, trustItems: e.target.value.split("\n").filter(Boolean) })}
            />
          </div>
        </div>
      )}

      {section === "stats" && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold">统计数字配置</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">模式</label>
            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={config.stats.mode}
              onChange={(e) => save("stats", { ...config.stats, mode: e.target.value })}
            >
              <option value="auto">自动读取数据库</option>
              <option value="manual">手动填写</option>
            </select>
          </div>
          {config.stats.mode === "manual" && (
            <div className="grid grid-cols-2 gap-4">
              {(["toolsCount", "usersCount", "documentsCount", "topicsCount", "postsCount"] as const).map((k) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{k}</label>
                  <input
                    className="w-full px-3 py-2 border rounded-lg"
                    defaultValue={(config.stats as any)[k] || ""}
                    onBlur={(e) => save("stats", { ...config.stats, [k]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {section === "ads" && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold">广告位状态</h2>
          {Object.entries(config.ads).map(([slot, cfg]) => (
            <div key={slot} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-mono text-sm">{slot}</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={cfg.enabled}
                    onChange={(e) => save("ads", { ...config.ads, [slot]: { ...cfg, enabled: e.target.checked } })}
                  />
                  启用
                </label>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={cfg.fallbackMode}
                  onChange={(e) => save("ads", { ...config.ads, [slot]: { ...cfg, fallbackMode: e.target.value } })}
                >
                  <option value="hide">无广告时隐藏</option>
                  <option value="fallback">展示自营广告</option>
                  <option value="placeholder">占位符</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {saving && <div className="fixed bottom-4 right-4 bg-teal-600 text-white px-4 py-2 rounded-lg shadow">保存中...</div>}
    </div>
  );
}
