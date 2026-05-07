"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Calculator, Ship, Plane, Plus, Trash2, RotateCcw, Save,
  BookOpen, Info, AlertTriangle, CheckCircle2, History,
  Loader2, ChevronDown, ChevronUp, Clipboard, X
} from "lucide-react";

// ==================== Types ====================
interface CalcRow {
  id: string;
  length: string;
  width: string;
  height: string;
  quantity: string;
  actualWeight: string;
}

interface SavedCalc {
  id: string;
  type: "express" | "sea";
  data: any;
  result: any;
  createdAt: string;
}

// ==================== Component ====================
export default function VolumeCalculatorPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const [activeTab, setActiveTab] = useState<"express" | "sea">("express");
  const [savedCalcs, setSavedCalcs] = useState<SavedCalc[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Batch import state
  const [showBatchImport, setShowBatchImport] = useState(false);
  const [batchText, setBatchText] = useState("");
  const [parsedRows, setParsedRows] = useState<CalcRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  // Express tab state
  const [divisor, setDivisor] = useState("5000");
  const [expressRows, setExpressRows] = useState<CalcRow[]>([
    { id: "1", length: "0", width: "0", height: "0", quantity: "1", actualWeight: "0" },
  ]);
  const [showDivisorInfo, setShowDivisorInfo] = useState(false);

  // Sea freight tab state
  const [seaRows, setSeaRows] = useState<CalcRow[]>([
    { id: "1", length: "1", width: "1", height: "1", quantity: "1", actualWeight: "" },
  ]);

  // Load history on mount
  useEffect(() => {
    if (isLoggedIn) loadHistory();
  }, [isLoggedIn]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ==================== Express/Air Calculations ====================
  const expressTotals = (() => {
    let totalCtns = 0;
    let totalGW = 0;
    let totalVW = 0;

    expressRows.forEach(row => {
      const l = parseFloat(row.length) || 0;
      const w = parseFloat(row.width) || 0;
      const h = parseFloat(row.height) || 0;
      const q = parseInt(row.quantity) || 0;
      const gw = parseFloat(row.actualWeight) || 0;
      const d = parseInt(divisor) || 5000;

      totalCtns += q;
      totalGW += gw * q;
      totalVW += (l * w * h) / d * q;
    });

    const chargeableWeight = Math.max(totalGW, totalVW);

    return { totalCtns, totalGW, totalVW, chargeableWeight };
  })();

  // ==================== Sea Freight/CBM Calculations ====================
  const seaTotals = (() => {
    let totalCBM = 0;
    let totalCtns = 0;
    let totalWeight = 0;

    seaRows.forEach(row => {
      const l = parseFloat(row.length) || 0;
      const w = parseFloat(row.width) || 0;
      const h = parseFloat(row.height) || 0;
      const q = parseInt(row.quantity) || 0;
      const gw = parseFloat(row.actualWeight) || 0;

      totalCBM += l * w * h * q;
      totalCtns += q;
      totalWeight += gw * q;
    });

    return { totalCBM, totalCtns, totalWeight };
  })();

  // ==================== History ====================
  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/calculations");
      const data = await res.json();
      if (data.success) setSavedCalcs(data.data || []);
    } catch { /* ignore */ }
    setLoadingHistory(false);
  };

  const handleSave = async () => {
    if (!isLoggedIn) {
      showToast("请先登录后保存");
      return;
    }
    setSaving(true);
    try {
      const type = activeTab;
      const data = type === "express"
        ? { divisor, rows: expressRows }
        : { rows: seaRows };
      const result = type === "express" ? expressTotals : seaTotals;

      const res = await fetch("/api/calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data, result }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("保存成功！");
        loadHistory();
      } else {
        showToast(json.error || "保存失败");
      }
    } catch {
      showToast("保存失败");
    }
    setSaving(false);
  };

  const handleLoad = (calc: SavedCalc) => {
    setActiveTab(calc.type);
    if (calc.type === "express") {
      setDivisor(calc.data.divisor || "5000");
      setExpressRows(calc.data.rows);
    } else {
      setSeaRows(calc.data.rows);
    }
    setShowHistory(false);
    showToast("已加载历史计算");
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      await fetch(`/api/calculations?id=${id}`, { method: "DELETE" });
      loadHistory();
    } catch { /* ignore */ }
  };

  // ==================== Batch Import Parser ====================
  const parseBatchText = (text: string) => {
    setParseError(null);
    // Split by newlines first, then handle semicolons as line separators
    const lines = text.trim().split(/[\n;；]+/).map(l => l.trim()).filter(l => l.length > 0);
    const results: CalcRow[] = [];
    const errors: string[] = [];

    lines.forEach((line, idx) => {
      // Clean the line: remove units and convert separators
      let cleaned = line.trim()
        .replace(/cm|mm/gi, '')
        .replace(/kg|箱|件|个/gi, ' ')
        .replace(/[xX×✕*]/g, '|')
        .replace(/[，,]/g, '|')
        .replace(/\s+/g, '|')
        .replace(/\|+/g, '|')
        .replace(/^\||\|$/g, '')
        .trim();

      // Extract numbers
      const parts = cleaned.split('|').map(p => p.trim()).filter(p => p && !isNaN(parseFloat(p)));

      if (parts.length >= 3) {
        results.push({
          id: `batch-${idx}-${Date.now()}`,
          length: parts[0],
          width: parts[1],
          height: parts[2],
          quantity: parts[3] || "1",
          actualWeight: parts[4] || (activeTab === "express" ? "0" : ""),
        });
      } else {
        errors.push(`第${idx + 1}行: "${line}" — 至少需要长、宽、高3个数值`);
      }
    });

    setParsedRows(results);
    if (errors.length > 0 && results.length === 0) {
      setParseError(errors.join('\n'));
    }
  };

  const applyBatchImport = () => {
    if (parsedRows.length === 0) return;

    if (activeTab === "express") {
      setExpressRows(prev => [...prev, ...parsedRows]);
    } else {
      setSeaRows(prev => [...prev, ...parsedRows]);
    }

    setShowBatchImport(false);
    setBatchText("");
    setParsedRows([]);
    showToast(`成功导入 ${parsedRows.length} 条规格`);
  };

  // ==================== Row Management ====================
  const addExpressRow = () => {
    setExpressRows(prev => [...prev, {
      id: Date.now().toString(),
      length: "0", width: "0", height: "0", quantity: "1", actualWeight: "0",
    }]);
  };

  const removeExpressRow = (id: string) => {
    if (expressRows.length > 1) setExpressRows(prev => prev.filter(r => r.id !== id));
  };

  const updateExpressRow = (id: string, field: keyof CalcRow, value: string) => {
    setExpressRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const addSeaRow = () => {
    setSeaRows(prev => [...prev, {
      id: Date.now().toString(),
      length: "1", width: "1", height: "1", quantity: "1", actualWeight: "",
    }]);
  };

  const removeSeaRow = (id: string) => {
    if (seaRows.length > 1) setSeaRows(prev => prev.filter(r => r.id !== id));
  };

  const updateSeaRow = (id: string, field: keyof CalcRow, value: string) => {
    setSeaRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const clearAll = () => {
    setExpressRows([{ id: "1", length: "0", width: "0", height: "0", quantity: "1", actualWeight: "0" }]);
    setSeaRows([{ id: "1", length: "1", width: "1", height: "1", quantity: "1", actualWeight: "" }]);
    setDivisor("5000");
  };

  // ==================== Render ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg bg-blue-600 text-white text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />{toast}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                体积计算器
                <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full font-medium">Pro</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {isLoggedIn && (
                <button onClick={() => setShowHistory(!showHistory)}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-1.5">
                  <History className="w-4 h-4" />历史记录
                </button>
              )}
              <button onClick={handleSave} disabled={saving}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isLoggedIn ? "保存" : "登录保存"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* ===== Left: Calculator ===== */}
          <div className="lg:col-span-2 space-y-4">
            {/* History Panel */}
            {showHistory && isLoggedIn && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600" />保存的计算记录
                </h3>
                {loadingHistory ? (
                  <div className="text-center text-gray-400 py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
                ) : savedCalcs.length === 0 ? (
                  <div className="text-center text-gray-400 py-4 text-sm">暂无保存的计算</div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {savedCalcs.map(calc => (
                      <div key={calc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {calc.type === "express"
                            ? <Plane className="w-4 h-4 text-blue-500" />
                            : <Ship className="w-4 h-4 text-teal-500" />}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {calc.type === "express" ? "快递/空派" : "海运大货"}
                              {calc.type === "express" ? ` · 除数${calc.data.divisor}` : ` · ${calc.result.totalCBM?.toFixed(2)} CBM`}
                            </p>
                            <p className="text-xs text-gray-400">{new Date(calc.createdAt).toLocaleString("zh-CN")}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => handleLoad(calc)}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200">加载</button>
                          <button onClick={() => handleDeleteHistory(calc.id)}
                            className="px-2 py-1 text-xs text-red-400 hover:text-red-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2">
              <button onClick={() => setActiveTab("express")}
                className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                  activeTab === "express"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
                }`}>
                <Plane className="w-4 h-4" />快递 / 空派（体积重）
              </button>
              <button onClick={() => setActiveTab("sea")}
                className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                  activeTab === "sea"
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-teal-300"
                }`}>
                <Ship className="w-4 h-4" />海运 / 大货（CBM）
              </button>
            </div>

            {/* ===== EXPRESS / AIR TAB ===== */}
            {activeTab === "express" && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Settings Bar */}
                <div className="bg-blue-50 px-4 py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">体积除数 (Divisor)</span>
                    <select value={divisor} onChange={e => setDivisor(e.target.value)}
                      className="px-3 py-1.5 border border-blue-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                      <option value="5000">5000（国际快递标准）</option>
                      <option value="6000">6000（空运/专线）</option>
                      <option value="4000">4000（特殊渠道）</option>
                      <option value="7000">7000（中欧班列）</option>
                    </select>
                  </div>
                  <button onClick={() => setShowDivisorInfo(!showDivisorInfo)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                    <Info className="w-3.5 h-3.5" />公式说明
                    {showDivisorInfo ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
                {showDivisorInfo && (
                  <div className="px-4 py-2 bg-blue-50/50 border-t border-blue-100 text-xs text-gray-600">
                    当前公式：长(cm) × 宽(cm) × 高(cm) ÷ {divisor} = 单箱体积重(kg)
                  </div>
                )}

                {/* Column Headers */}
                <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 text-xs font-medium text-gray-400 bg-gray-50 border-b">
                  <span className="col-span-1">#</span>
                  <span className="col-span-2">长 (cm)</span>
                  <span className="col-span-2">宽 (cm)</span>
                  <span className="col-span-2">高 (cm)</span>
                  <span className="col-span-1">箱数</span>
                  <span className="col-span-2">单箱实重 (kg)</span>
                  <span className="col-span-1">操作</span>
                  <span className="col-span-1">体积重</span>
                </div>

                {/* Rows */}
                <div className="p-4 space-y-2">
                  {expressRows.map((row, idx) => {
                    const l = parseFloat(row.length) || 0;
                    const w = parseFloat(row.width) || 0;
                    const h = parseFloat(row.height) || 0;
                    const q = parseInt(row.quantity) || 0;
                    const d = parseInt(divisor) || 5000;
                    const vw = (l * w * h) / d * q;

                    return (
                      <div key={row.id} className="grid md:grid-cols-12 grid-cols-2 gap-2 p-2 bg-gray-50 rounded-lg">
                        <div className="md:col-span-1 flex items-center justify-center text-sm text-gray-400">{idx + 1}</div>
                        <div className="md:col-span-2">
                          <input type="number" value={row.length} onChange={e => updateExpressRow(row.id, "length", e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm text-center" />
                        </div>
                        <div className="md:col-span-2">
                          <input type="number" value={row.width} onChange={e => updateExpressRow(row.id, "width", e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm text-center" />
                        </div>
                        <div className="md:col-span-2">
                          <input type="number" value={row.height} onChange={e => updateExpressRow(row.id, "height", e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm text-center" />
                        </div>
                        <div className="md:col-span-1">
                          <input type="number" value={row.quantity} onChange={e => updateExpressRow(row.id, "quantity", e.target.value)}
                            min="1" className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm text-center" />
                        </div>
                        <div className="md:col-span-2">
                          <input type="number" value={row.actualWeight} onChange={e => updateExpressRow(row.id, "actualWeight", e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm text-center" />
                        </div>
                        <div className="md:col-span-1 flex items-center justify-center">
                          <button onClick={() => removeExpressRow(row.id)} disabled={expressRows.length === 1}
                            className="p-1 text-red-400 hover:text-red-600 disabled:opacity-30">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="md:col-span-1 flex items-center justify-center text-xs text-gray-500">
                          {vw.toFixed(1)} kg
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="px-4 pb-4 flex gap-2">
                  <button onClick={addExpressRow}
                    className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 flex items-center gap-1">
                    <Plus className="w-4 h-4" />增加规格
                  </button>
                  <button onClick={() => { setShowBatchImport(true); setParsedRows([]); setParseError(null); }}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 flex items-center gap-1">
                    <Clipboard className="w-4 h-4" />批量增加
                  </button>
                  <button onClick={clearAll}
                    className="px-4 py-2 bg-pink-50 text-pink-600 rounded-lg text-sm hover:bg-pink-100 flex items-center gap-1">
                    <RotateCcw className="w-4 h-4" />清空
                  </button>
                </div>

                {/* Results */}
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-6 py-5">
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-blue-200">总件数 (Ctns)</p>
                      <p className="text-xl font-bold">{expressTotals.totalCtns}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-200">总实重 (GW)</p>
                      <p className="text-xl font-bold">{expressTotals.totalGW.toFixed(1)} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-200">体积重 (VW)</p>
                      <p className="text-xl font-bold">{expressTotals.totalVW.toFixed(1)} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-orange-300">最终计费重</p>
                      <p className="text-2xl font-black text-orange-400">{expressTotals.chargeableWeight.toFixed(1)} kg</p>
                    </div>
                  </div>
                  <div className="text-xs text-blue-300">
                    计费规则：实重 {expressTotals.totalGW.toFixed(1)} kg 与体积重 {expressTotals.totalVW.toFixed(1)} kg 取大者
                  </div>
                </div>
              </div>
            )}

            {/* ===== SEA FREIGHT / CBM TAB ===== */}
            {activeTab === "sea" && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Info Bar */}
                <div className="bg-teal-50 px-4 py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">计算单位：米 (m)</span>
                    <span className="text-xs text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">1m × 1m × 1m = 1 CBM</span>
                  </div>
                  <button onClick={() => {}}
                    className="flex items-center gap-1 text-xs text-teal-600 hover:underline">
                    <Info className="w-3.5 h-3.5" />CBM说明
                  </button>
                </div>

                {/* Column Headers */}
                <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 text-xs font-medium text-gray-400 bg-gray-50 border-b">
                  <span className="col-span-1">#</span>
                  <span className="col-span-2">长 (m)</span>
                  <span className="col-span-2">宽 (m)</span>
                  <span className="col-span-2">高 (m)</span>
                  <span className="col-span-2">件数</span>
                  <span className="col-span-2">单件实重 (kg)</span>
                  <span className="col-span-1">操作</span>
                </div>

                {/* Rows */}
                <div className="p-4 space-y-2">
                  {seaRows.map((row, idx) => {
                    const l = parseFloat(row.length) || 0;
                    const w = parseFloat(row.width) || 0;
                    const h = parseFloat(row.height) || 0;
                    const q = parseInt(row.quantity) || 0;
                    const cbm = l * w * h * q;

                    return (
                      <div key={row.id} className="grid md:grid-cols-12 grid-cols-2 gap-2 p-2 bg-gray-50 rounded-lg">
                        <div className="md:col-span-1 flex items-center justify-center text-sm text-gray-400">{idx + 1}</div>
                        <div className="md:col-span-2">
                          <input type="number" step="0.01" value={row.length} onChange={e => updateSeaRow(row.id, "length", e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm text-center" />
                        </div>
                        <div className="md:col-span-2">
                          <input type="number" step="0.01" value={row.width} onChange={e => updateSeaRow(row.id, "width", e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm text-center" />
                        </div>
                        <div className="md:col-span-2">
                          <input type="number" step="0.01" value={row.height} onChange={e => updateSeaRow(row.id, "height", e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm text-center" />
                        </div>
                        <div className="md:col-span-2">
                          <input type="number" value={row.quantity} onChange={e => updateSeaRow(row.id, "quantity", e.target.value)}
                            min="1" className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm text-center" />
                        </div>
                        <div className="md:col-span-2">
                          <input type="number" value={row.actualWeight} onChange={e => updateSeaRow(row.id, "actualWeight", e.target.value)}
                            placeholder="可选" className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm text-center" />
                        </div>
                        <div className="md:col-span-1 flex items-center justify-center">
                          <button onClick={() => removeSeaRow(row.id)} disabled={seaRows.length === 1}
                            className="p-1 text-red-400 hover:text-red-600 disabled:opacity-30">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="px-4 pb-4 flex gap-2">
                  <button onClick={addSeaRow}
                    className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 flex items-center gap-1">
                    <Plus className="w-4 h-4" />增加规格
                  </button>
                  <button onClick={() => { setShowBatchImport(true); setParsedRows([]); setParseError(null); }}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 flex items-center gap-1">
                    <Clipboard className="w-4 h-4" />批量增加
                  </button>
                  <button onClick={clearAll}
                    className="px-4 py-2 bg-pink-50 text-pink-600 rounded-lg text-sm hover:bg-pink-100 flex items-center gap-1">
                    <RotateCcw className="w-4 h-4" />清空
                  </button>
                </div>

                {/* Results */}
                <div className="bg-gradient-to-r from-teal-800 to-teal-700 text-white px-6 py-5">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-teal-200">总件数 (Ctns)</p>
                      <p className="text-xl font-bold">{seaTotals.totalCtns}</p>
                    </div>
                    <div>
                      <p className="text-xs text-teal-200">总体积 (CBM)</p>
                      <p className="text-xl font-bold">{seaTotals.totalCBM.toFixed(3)} m³</p>
                    </div>
                    <div>
                      <p className="text-xs text-teal-200">总实重 (可选)</p>
                      <p className="text-xl font-bold">{seaTotals.totalWeight > 0 ? `${seaTotals.totalWeight.toFixed(1)} kg` : "—"}</p>
                    </div>
                  </div>
                  <div className="text-xs text-teal-300">
                    CBM = 长(m) × 宽(m) × 高(m) × 件数 | 1 m³ = 1 CBM
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ===== Right: Knowledge Base ===== */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />实用物流知识库
                </h3>
              </div>

              <div className="p-4 space-y-4">
                {/* Volumetric Weight Principle */}
                {activeTab === "express" && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-blue-500" />体积重计算原理
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      飞机和货车的载重和容积有限，低密度货物（如棉花、泡沫）虽然实际重量轻，但占据了大量空间。
                      因此国际快递会对这类"泡货"按体积重量计费。
                    </p>
                    <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-xs font-medium text-yellow-800">核心公式</p>
                      <p className="text-xs text-yellow-700 mt-1 font-mono">
                        体积重 = (长×宽×高) ÷ 除数
                      </p>
                      <p className="text-xs text-yellow-700 mt-1 font-mono">
                        计费重 = MAX(实重, 体积重)
                      </p>
                    </div>
                  </div>
                )}

                {/* CBM Explanation */}
                {activeTab === "sea" && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                      <Ship className="w-3.5 h-3.5 text-teal-500" />CBM 海运计费规则
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      海运按体积计费，基本单位为 CBM（Cubic Meter，立方米）。
                      1 m × 1 m × 1 m = 1 CBM。海运通常有最低收费标准（如 1 CBM 起算）。
                    </p>
                    <div className="mt-2 bg-teal-50 border border-teal-200 rounded-lg p-3">
                      <p className="text-xs font-medium text-teal-800">核心公式</p>
                      <p className="text-xs text-teal-700 mt-1 font-mono">
                        CBM = 长(m) × 宽(m) × 高(m) × 件数
                      </p>
                      <p className="text-xs text-teal-700 mt-1">
                        💡 不足 1 CBM 按 1 CBM 计费
                      </p>
                    </div>
                  </div>
                )}

                {/* Measurement Guide */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />尺寸测量指南
                  </h4>
                  <ul className="text-xs text-gray-500 space-y-1.5">
                    <li className="flex gap-1.5">
                      <span className="text-orange-500 font-bold">•</span>
                      <span><strong>鼓包测量</strong>：纸箱鼓出时，按最凸出点测量，不按边缘</span>
                    </li>
                    <li className="flex gap-1.5">
                      <span className="text-orange-500 font-bold">•</span>
                      <span><strong>进位规则</strong>：国际快递通常按 0.5cm 或 1cm 进位（如 20.3cm 计为 21cm）</span>
                    </li>
                    <li className="flex gap-1.5">
                      <span className="text-orange-500 font-bold">•</span>
                      <span><strong>叠放误差</strong>：多箱叠放时总尺寸往往大于单箱之和（有空隙）</span>
                    </li>
                  </ul>
                </div>

                {/* Divisor Standards */}
                {activeTab === "express" && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5 text-purple-500" />各国/渠道除数标准
                    </h4>
                    <div className="space-y-1">
                      {[
                        { name: "国际快递", div: "5000", detail: "DHL, UPS, FedEx" },
                        { name: "空运/专线", div: "6000", detail: "包税空派、专线" },
                        { name: "国内/铁路", div: "6000/7000", detail: "国内快递、中欧班列" },
                        { name: "特殊渠道", div: "4000/8000", detail: "部分EMS、超大件" },
                      ].map(item => (
                        <div key={item.name} className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded text-xs">
                          <span className="text-gray-700">{item.name}</span>
                          <div className="text-right">
                            <span className="font-mono font-bold text-purple-600">{item.div}</span>
                            <p className="text-gray-400 text-[10px]">{item.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Money Saving Tips */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />包装优化建议 💰
                  </h4>
                  <ul className="text-xs text-gray-500 space-y-1.5">
                    <li className="flex gap-1.5">
                      <span className="text-green-500 font-bold">•</span>
                      <span><strong>压缩体积</strong>：纺织品、毛绒玩具用真空压缩袋，可省 50%+ 运费</span>
                    </li>
                    <li className="flex gap-1.5">
                      <span className="text-green-500 font-bold">•</span>
                      <span><strong>裁剪纸箱</strong>：箱内空隙大时，裁剪折叠纸板降低高度</span>
                    </li>
                    <li className="flex gap-1.5">
                      <span className="text-green-500 font-bold">•</span>
                      <span><strong>避免异形</strong>：使用标准方形箱，圆柱或不规则形状可能加收操作费</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Import Modal */}
      {showBatchImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-blue-600 text-white flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clipboard className="w-5 h-5" />
                批量增加规格
              </h3>
              <button onClick={() => setShowBatchImport(false)}
                className="p-1 hover:bg-blue-700 rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Instructions */}
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-800 mb-1">📋 支持以下格式（自动识别）：</p>
                <div className="grid grid-cols-2 gap-1 text-xs text-blue-700 font-mono">
                  <p>• 50*40*30*5*10</p>
                  <p>• 50×40×30×5×10kg</p>
                  <p>• 50,40,30,5,10</p>
                  <p>• 50x40x30 5箱 10kg</p>
                  <p>• 50 40 30 5 10</p>
                  <p>• 每行一条，支持换行/逗号/分号分隔</p>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  {activeTab === "express"
                    ? "顺序：长(cm) 宽(cm) 高(cm) [箱数] [单箱实重kg]"
                    : "顺序：长(m) 宽(m) 高(m) [件数] [单件实重kg]"}
                </p>
              </div>

              {/* Input */}
              <textarea
                value={batchText}
                onChange={e => {
                  setBatchText(e.target.value);
                  parseBatchText(e.target.value);
                }}
                placeholder={'粘贴数据，例如：\n50*40*30*5*10\n60×50×40×2×15kg\n70,45,35,3,8'}
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              />

              {/* Preview */}
              {parsedRows.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    识别到 {parsedRows.length} 条规格
                  </p>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="py-1.5 px-2 text-left text-gray-500">#</th>
                          <th className="py-1.5 px-2 text-gray-500">长</th>
                          <th className="py-1.5 px-2 text-gray-500">宽</th>
                          <th className="py-1.5 px-2 text-gray-500">高</th>
                          <th className="py-1.5 px-2 text-gray-500">数量</th>
                          <th className="py-1.5 px-2 text-gray-500">实重</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedRows.map((row, idx) => (
                          <tr key={row.id} className="border-t border-gray-100">
                            <td className="py-1.5 px-2 text-gray-400">{idx + 1}</td>
                            <td className="py-1.5 px-2">{row.length}</td>
                            <td className="py-1.5 px-2">{row.width}</td>
                            <td className="py-1.5 px-2">{row.height}</td>
                            <td className="py-1.5 px-2">{row.quantity}</td>
                            <td className="py-1.5 px-2">{row.actualWeight}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Error */}
              {parseError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 whitespace-pre-line">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />{parseError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowBatchImport(false)}
                className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100">
                取消
              </button>
              <button onClick={applyBatchImport} disabled={parsedRows.length === 0}
                className="px-6 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5">
                <Plus className="w-4 h-4" />确认添加 ({parsedRows.length} 条)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
