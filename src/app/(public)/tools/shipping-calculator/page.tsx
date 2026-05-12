'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Calculator, Package, Plane, Ship, Truck,
  Plus, Trash2, RotateCcw, Info, AlertTriangle,
  ChevronDown, ChevronUp, Clipboard, X, CheckCircle2,
  ArrowLeftRight, Scale, Box
} from 'lucide-react';
import { RelatedGuidesSection } from '@/components/related-guides-section';
import { FAQSection } from '@/components/faq-section';
import { AdSlot } from '@/components/ad-slot';
import { RelatedToolsWidget } from '@/components/related-tools-widget';
import { trackEvent } from '@/lib/analytics';

// ==================== Types ====================
interface CalcRow {
  id: string;
  length: string;
  width: string;
  height: string;
  quantity: string;
  actualWeight: string;
}

type ShippingMode = 'express' | 'air' | 'sea' | 'custom';

interface PersistedState {
  mode: ShippingMode;
  customDivisor: string;
  rows: CalcRow[];
}

const STORAGE_KEY = 'shipping-calculator-v1';

// ==================== Helpers ====================
const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const defaultRow = (): CalcRow => ({
  id: genId(), length: '', width: '', height: '', quantity: '1', actualWeight: '',
});

const modeDivisor = (mode: ShippingMode, custom: string): number => {
  switch (mode) {
    case 'express': return 5000;
    case 'air': return 6000;
    case 'sea': return 7000;
    case 'custom': return parseInt(custom) || 5000;
  }
};

const modeLabel = (mode: ShippingMode): string => {
  switch (mode) {
    case 'express': return '📦 快递体积重 ÷5000';
    case 'air': return '✈️ 空运体积重 ÷6000';
    case 'sea': return '🚢 海运体积重 ÷7000';
    case 'custom': return '⚙️ 自定义除数';
  }
};

const loadState = (): PersistedState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
};

const saveState = (state: PersistedState) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
};

// ==================== Batch Parser ====================
const parseBatchText = (text: string): { rows: CalcRow[]; errors: string[] } => {
  const lines = text.trim().split(/[\n;；]+/).map(l => l.trim()).filter(l => l.length > 0);
  const results: CalcRow[] = [];
  const errors: string[] = [];

  lines.forEach((line, idx) => {
    let cleaned = line.trim()
      .replace(/cm|mm|kg|箱|件|个/gi, ' ')
      .replace(/[xX×✕*]/g, '|')
      .replace(/[，,]/g, '|')
      .replace(/\s+/g, '|')
      .replace(/\|+/g, '|')
      .replace(/^\||\|$/g, '')
      .trim();

    const parts = cleaned.split('|').map(p => p.trim()).filter(p => p && !isNaN(parseFloat(p)));

    if (parts.length >= 3) {
      results.push({
        id: genId(),
        length: parts[0],
        width: parts[1],
        height: parts[2],
        quantity: parts[3] || '1',
        actualWeight: parts[4] || '',
      });
    } else {
      errors.push(`第${idx + 1}行: "${line}" — 至少需要长、宽、高3个数值`);
    }
  });

  return { rows: results, errors };
};

// ==================== Component ====================
export default function ShippingCalculatorPage() {
  const saved = typeof window !== 'undefined' ? loadState() : null;

  const [mode, setMode] = useState<ShippingMode>(saved?.mode || 'express');
  const [customDivisor, setCustomDivisor] = useState(saved?.customDivisor || '5000');
  const [rows, setRows] = useState<CalcRow[]>(
    saved?.rows?.length ? saved.rows : [defaultRow()]
  );

  // Batch import
  const [showBatch, setShowBatch] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [parsedRows, setParsedRows] = useState<CalcRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);

  // Show details
  const [showFormula, setShowFormula] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(true);

  // Persist to localStorage
  useEffect(() => {
    saveState({ mode, customDivisor, rows });
  }, [mode, customDivisor, rows]);

  // ==================== Calculations ====================
  const divisor = modeDivisor(mode, customDivisor);
  const useMeters = mode === 'sea';

  const calcResults = useCallback(() => {
    let totalCtns = 0;
    let totalGW = 0;
    let totalVW = 0;
    let totalCBM = 0;
    const perRow: {
      vw: number; cbm: number; gw: number; ctns: number;
      l: number; w: number; h: number; q: number;
    }[] = [];

    rows.forEach(row => {
      const l = parseFloat(row.length) || 0;
      const w = parseFloat(row.width) || 0;
      const h = parseFloat(row.height) || 0;
      const q = parseInt(row.quantity) || 0;
      const gw = parseFloat(row.actualWeight) || 0;

      const cbm = l * w * h * q;
      // Volume in cm³ for VW calc (if meters, convert to cm)
      const volCm3 = useMeters
        ? (l * 100) * (w * 100) * (h * 100) * q
        : l * w * h * q;
      const vw = volCm3 / divisor;

      totalCtns += q;
      totalGW += gw * q;
      totalVW += vw;
      totalCBM += cbm;

      perRow.push({ vw, cbm, gw: gw * q, ctns: q, l, w, h, q });
    });

    const chargeableWeight = Math.max(totalGW, totalVW);

    return { totalCtns, totalGW, totalVW, totalCBM, chargeableWeight, perRow };
  }, [rows, divisor, useMeters]);

  const results = calcResults();

  // ==================== Row Management ====================
  const addRow = () => setRows(prev => [...prev, defaultRow()]);
  const removeRow = (id: string) => {
    if (rows.length > 1) setRows(prev => prev.filter(r => r.id !== id));
  };
  const updateRow = (id: string, field: keyof CalcRow, value: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };
  const clearAll = () => {
    setRows([defaultRow()]);
    setMode('express');
    setCustomDivisor('5000');
  };

  const handleBatchParse = (text: string) => {
    setBatchText(text);
    const { rows: r, errors: e } = parseBatchText(text);
    setParsedRows(r);
    setParseErrors(e);
  };

  const applyBatch = () => {
    if (parsedRows.length === 0) return;
    setRows(prev => [...prev, ...parsedRows]);
    trackEvent.shippingCalculate();
    setShowBatch(false);
    setBatchText('');
    setParsedRows([]);
    setParseErrors([]);
  };

  const unitLabel = useMeters ? 'm' : 'cm';
  const dimUnit = useMeters ? '米 (m)' : '厘米 (cm)';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Calculator className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">物流体积 / CBM / 运费计算器</h1>
                <p className="text-sm text-gray-500">体积重 · 计费重 · CBM · 费用构成参考</p>
              </div>
            </div>
            <button onClick={clearAll}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4" />重置
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-amber-800 text-sm">
            <strong>本站仅供参考，不构成任何物流服务商的报价或承诺。</strong>实际费用请以承运商报价为准。
            不同渠道的除数、首重、续重标准可能有所不同，计算结果仅供理解计费逻辑使用。
          </p>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {([
            { key: 'express' as ShippingMode, icon: Package, label: '快递 ÷5000', color: 'blue' },
            { key: 'air' as ShippingMode, icon: Plane, label: '空运 ÷6000', color: 'green' },
            { key: 'sea' as ShippingMode, icon: Ship, label: '海运 ÷7000', color: 'teal' },
            { key: 'custom' as ShippingMode, icon: Calculator, label: '自定义', color: 'purple' },
          ]).map(({ key, icon: Icon, label, color }) => {
            const active = mode === key;
            const colorMap: Record<string, string> = {
              blue: active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300',
              green: active ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300',
              teal: active ? 'bg-teal-600 text-white shadow-lg shadow-teal-200' : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300',
              purple: active ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300',
            };
            return (
              <button key={key} onClick={() => setMode(key)}
                className={`py-3 px-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${colorMap[color]}`}>
                <Icon className="w-4 h-4" />{label}
              </button>
            );
          })}
        </div>

        {/* Custom divisor input */}
        {mode === 'custom' && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">自定义除数：</label>
            <input type="number" value={customDivisor} onChange={e => setCustomDivisor(e.target.value)}
              className="px-3 py-1.5 border border-purple-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none w-28" />
            <span className="text-xs text-gray-500">长×宽×高(cm) ÷ 除数 = 体积重(kg)</span>
          </div>
        )}

        {/* Formula toggle */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button onClick={() => setShowFormula(!showFormula)}
            className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50">
            <span className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              当前计算公式：{modeLabel(mode)}
            </span>
            {showFormula ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showFormula && (
            <div className="px-4 pb-4 space-y-2 text-xs text-gray-600 bg-gray-50 border-t">
              <p className="font-mono">
                体积 (cm³) = 长({unitLabel}) × 宽({unitLabel}) × 高({unitLabel}) × 件数
                {useMeters && '（输入单位：米，自动转换为厘米计算）'}
              </p>
              <p className="font-mono">体积重 (kg) = 体积(cm³) ÷ {divisor}</p>
              {useMeters && <p className="font-mono">CBM (m³) = 长(m) × 宽(m) × 高(m) × 件数</p>}
              <p className="font-mono">计费重 = MAX(总实重, 总体积重)</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 pt-3 border-t">
                {[
                  { name: '国际快递', d: '5000', detail: 'DHL, UPS, FedEx' },
                  { name: '空运/专线', d: '6000', detail: '包税空派' },
                  { name: '海运', d: '7000', detail: '部分渠道参考' },
                  { name: '中欧班列', d: '7000', detail: '铁路专线' },
                ].map(item => (
                  <div key={item.name} className="flex items-center justify-between py-1.5 px-2 bg-white rounded border">
                    <span className="text-gray-600">{item.name}</span>
                    <div className="text-right">
                      <span className="font-mono font-bold text-purple-600">{item.d}</span>
                      <p className="text-gray-400 text-[10px]">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Column Headers */}
          <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 text-xs font-medium text-gray-400 bg-gray-50/50 border-t">
            <span className="col-span-1">#</span>
            <span className="col-span-2">长 ({unitLabel})</span>
            <span className="col-span-2">宽 ({unitLabel})</span>
            <span className="col-span-2">高 ({unitLabel})</span>
            <span className="col-span-1">件数</span>
            <span className="col-span-2">单件实重 (kg)</span>
            <span className="col-span-1">操作</span>
            <span className="col-span-1">体积重</span>
          </div>

          {/* Rows */}
          <div className="p-4 space-y-2">
            {rows.map((row, idx) => {
              const l = parseFloat(row.length) || 0;
              const w = parseFloat(row.width) || 0;
              const h = parseFloat(row.height) || 0;
              const q = parseInt(row.quantity) || 0;
              const volCm3 = useMeters ? (l * 100) * (w * 100) * (h * 100) * q : l * w * h * q;
              const vw = volCm3 / divisor;

              return (
                <div key={row.id} className="grid md:grid-cols-12 grid-cols-2 gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="md:col-span-1 flex items-center justify-center text-sm text-gray-400">{idx + 1}</div>
                  <div className="md:col-span-2">
                    <label className="md:hidden text-[10px] text-gray-400">长</label>
                    <input type="number" step={useMeters ? '0.01' : '1'} placeholder="长" value={row.length}
                      onChange={e => updateRow(row.id, 'length', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm text-center focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="md:hidden text-[10px] text-gray-400">宽</label>
                    <input type="number" step={useMeters ? '0.01' : '1'} placeholder="宽" value={row.width}
                      onChange={e => updateRow(row.id, 'width', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm text-center focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="md:hidden text-[10px] text-gray-400">高</label>
                    <input type="number" step={useMeters ? '0.01' : '1'} placeholder="高" value={row.height}
                      onChange={e => updateRow(row.id, 'height', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm text-center focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="md:hidden text-[10px] text-gray-400">件数</label>
                    <input type="number" min="1" placeholder="件数" value={row.quantity}
                      onChange={e => updateRow(row.id, 'quantity', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm text-center focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="md:hidden text-[10px] text-gray-400">实重</label>
                    <input type="number" step="0.1" placeholder="kg" value={row.actualWeight}
                      onChange={e => updateRow(row.id, 'actualWeight', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm text-center focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                  </div>
                  <div className="md:col-span-1 flex items-center justify-center">
                    <button onClick={() => removeRow(row.id)} disabled={rows.length === 1}
                      className="p-1 text-red-400 hover:text-red-600 disabled:opacity-30">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="md:col-span-1 flex items-center justify-center text-xs text-gray-500 font-medium">
                    {vw > 0 ? `${vw.toFixed(1)} kg` : '—'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="px-4 pb-4 flex flex-wrap gap-2">
            <button onClick={addRow}
              className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 flex items-center gap-1">
              <Plus className="w-4 h-4" />增加规格
            </button>
            <button onClick={() => { setShowBatch(true); setBatchText(''); setParsedRows([]); setParseErrors([]); }}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 flex items-center gap-1">
              <Clipboard className="w-4 h-4" />批量增加
            </button>
          </div>
        </div>

        {/* ==================== Results Card ==================== */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-5">
            <h2 className="text-sm font-medium text-blue-200 mb-4 flex items-center gap-2">
              <Scale className="w-4 h-4" />计算结果
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div>
                <p className="text-xs text-blue-300">总件数</p>
                <p className="text-2xl font-bold">{results.totalCtns}</p>
              </div>
              <div>
                <p className="text-xs text-blue-300">总实重</p>
                <p className="text-2xl font-bold">{results.totalGW > 0 ? `${results.totalGW.toFixed(1)} kg` : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-blue-300">总体积重</p>
                <p className="text-2xl font-bold text-orange-400">{results.totalVW.toFixed(1)} kg</p>
              </div>
              {useMeters && (
                <div>
                  <p className="text-xs text-blue-300">总体积 (CBM)</p>
                  <p className="text-2xl font-bold text-teal-400">{results.totalCBM.toFixed(3)} m³</p>
                </div>
              )}
              <div className={useMeters ? '' : 'md:col-span-2'}>
                <p className="text-xs text-orange-300">计费重（取较大者）</p>
                <p className="text-3xl font-black text-orange-400">{results.chargeableWeight.toFixed(1)} kg</p>
              </div>
            </div>
            <div className="text-xs text-blue-300 space-y-1">
              <p>
                计费规则：实重 {results.totalGW.toFixed(1)} kg 与体积重 {results.totalVW.toFixed(1)} kg 取大者
                → <strong className="text-orange-400">{results.chargeableWeight.toFixed(1)} kg</strong>
              </p>
              {results.totalVW > results.totalGW && results.totalGW > 0 && (
                <p className="text-orange-300">⚠️ 体积重大于实重 — 此票为泡货，将按体积重计费</p>
              )}
              {results.totalGW > results.totalVW && results.totalVW > 0 && (
                <p className="text-green-300">✅ 实重大于体积重 — 此票为重货，将按实重计费</p>
              )}
            </div>
          </div>
        </div>

        {/* ==================== Breakdown ==================== */}
        {rows.length > 1 && showBreakdown && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button onClick={() => setShowBreakdown(!showBreakdown)}
              className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50">
              <span className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-blue-500" />
                明细计算过程（{rows.length} 种规格）
              </span>
              {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showBreakdown && (
              <div className="px-4 pb-4 space-y-2">
                <div className="hidden md:grid grid-cols-8 gap-2 text-[10px] font-medium text-gray-400 py-1 px-2 bg-gray-50 rounded">
                  <span>#</span><span>尺寸</span><span>体积(cm³)</span><span>件数</span>
                  <span>体积重</span><span>单件实重</span><span>总实重</span><span>计费重</span>
                </div>
                {results.perRow.map((r, idx) => {
                  const cw = Math.max(r.gw, r.vw);
                  return (
                    <div key={idx} className="grid md:grid-cols-8 grid-cols-2 gap-2 text-xs py-2 px-2 bg-gray-50 rounded">
                      <div className="md:col-span-1 text-gray-400">{idx + 1}</div>
                      <div className="md:col-span-1 font-mono">{r.l}×{r.w}×{r.h} {unitLabel}</div>
                      <div className="md:col-span-1 font-mono">{(r.l * r.w * r.h * r.q * (useMeters ? 1000000 : 1)).toLocaleString()} cm³</div>
                      <div className="md:col-span-1">{r.ctns} 件</div>
                      <div className="md:col-span-1 font-mono text-blue-600">{r.vw.toFixed(1)} kg</div>
                      <div className="md:col-span-1">{r.gw > 0 ? `${(r.gw / r.ctns).toFixed(1)} kg` : '—'}</div>
                      <div className="md:col-span-1">{r.gw > 0 ? `${r.gw.toFixed(1)} kg` : '—'}</div>
                      <div className="md:col-span-1 font-bold text-orange-600">{cw.toFixed(1)} kg</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== 费用构成参考 ==================== */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-green-600" />费用构成参考
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">以下仅为费用构成说明，非实际报价</p>
          </div>
          <div className="p-4 space-y-3">
            {[
              {
                icon: '📦', title: '国际快递 (DHL/FedEx/UPS)',
                formula: `首重 + 续重 × (计费重 ÷ 0.5)`,
                notes: ['体积重除数通常为 5000', '首重 0.5kg，续重 0.5kg 递增', '适合小件急件，时效 5-10 工作日'],
                color: 'border-l-blue-500',
              },
              {
                icon: '✈️', title: '空运专线',
                formula: `首重费 + 续重费 × (计费重 - 首重)`,
                notes: ['体积重除数通常为 6000', '首重多为 1kg', '时效 10-20 工作日，性价比较高'],
                color: 'border-l-green-500',
              },
              {
                icon: '🚢', title: '海运/拼箱',
                formula: `CBM 单价 × CBM 数 + 目的港费用`,
                notes: ['通常按 CBM 计费，部分渠道有体积重参考（÷7000）', '起运量一般 1 CBM 起', '时效 30-50 工作日，适合大件重货'],
                color: 'border-l-purple-500',
              },
            ].map((m, i) => (
              <div key={i} className={`border-l-4 ${m.color} bg-gray-50 rounded-r-lg p-4`}>
                <div className="flex items-start gap-2">
                  <span className="text-lg">{m.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{m.title}</h4>
                    <p className="text-xs font-mono text-gray-600 mt-1">{m.formula}</p>
                    <ul className="mt-2 space-y-0.5">
                      {m.notes.map((n, j) => (
                        <li key={j} className="text-xs text-gray-500">• {n}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 pb-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-700">
                <strong>影响实际价格的因素：</strong>服务商定价策略、渠道类型、目的地和派送区域、
                偏远地区附加费、燃油附加费波动、货物属性（敏感/带电/品牌）、旺季附加费、操作费/取件费等。
              </p>
            </div>
          </div>
        </div>

        {/* ==================== Side-by-side info ==================== */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Measurement Guide */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />尺寸测量指南
              </h3>
            </div>
            <div className="p-4 space-y-2 text-xs text-gray-600">
              <p><strong className="text-orange-500">• 鼓包测量</strong>：纸箱鼓出时，按最凸出点测量，不按边缘</p>
              <p><strong className="text-orange-500">• 进位规则</strong>：国际快递通常按 0.5cm 或 1cm 进位（如 20.3cm 计为 21cm）</p>
              <p><strong className="text-orange-500">• 叠放误差</strong>：多箱叠放时总尺寸往往大于单箱之和（有空隙）</p>
            </div>
          </div>

          {/* Packing Tips */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Box className="w-4 h-4 text-green-500" />包装优化建议 💰
              </h3>
            </div>
            <div className="p-4 space-y-2 text-xs text-gray-600">
              <p><strong className="text-green-500">• 压缩体积</strong>：纺织品、毛绒玩具用真空压缩袋，可省 50%+ 运费</p>
              <p><strong className="text-green-500">• 裁剪纸箱</strong>：箱内空隙大时，裁剪折叠纸板降低高度</p>
              <p><strong className="text-green-500">• 避免异形</strong>：使用标准方形箱，圆柱或不规则形状可能加收操作费</p>
            </div>
          </div>
        </div>

        {/* Related Guides */}
        <RelatedGuidesSection slugs={['volumetric-weight-explained', 'cbm-shipping-volume-calculator']} />

        {/* FAQ */}
        <FAQSection title="运费计算常见问题" items={[
          {
            question: "什么是体积重？为什么要算体积重？",
            answer: "体积重（Volumetric Weight / Dimensional Weight）是快递公司根据包裹体积折算的重量。因为轻但大的包裹（如泡沫、枕头）会占用更多运输空间，所以快递公司会按体积重和实际重量中较大的那个来计费。公式：长 × 宽 × 高 ÷ 除数。",
          },
          {
            question: "快递、空运、海运的除数为什么不一样？",
            answer: "不同运输方式的除数反映了各自的空间成本。快递（÷5000）最贵，因为时效快、空间紧张；空运（÷6000）次之；海运（÷7000）最宽松，因为船舱空间大。除数越大，算出来的体积重越小，费用越低。",
          },
          {
            question: "什么是 CBM？",
            answer: "CBM（Cubic Meter）是立方米，海运中常用的体积单位。1 CBM = 1 立方米。海运通常按 CBM 计费，不足 1 CBM 按 1 CBM 计算（LCL 拼箱）。输入长宽高时选择米作为单位，可直接得到 CBM 值。",
          },
          {
            question: "计费重是什么？",
            answer: "计费重（Chargeable Weight）是快递公司最终用来计算运费的重量，取实际重量和体积重中的较大者。如果体积重大于实重，说明是泡货，按体积重计费；如果实重大于体积重，说明是重货，按实重计费。",
          },
          {
            question: "计算结果能作为实际运费报价吗？",
            answer: "不能。本站只提供体积重和计费重的计算参考，不涉及具体运费报价。实际运费因承运商、渠道、目的地、燃油附加费等因素而异，请以承运商或集运商的实际报价为准。",
          },
        ]} />
      </div>

      {/* ==================== Batch Import Modal ==================== */}
      {showBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 bg-blue-600 text-white flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clipboard className="w-5 h-5" />批量增加规格
              </h3>
              <button onClick={() => setShowBatch(false)}
                className="p-1 hover:bg-blue-700 rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
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
                  顺序：长({unitLabel}) 宽({unitLabel}) 高({unitLabel}) [件数] [单件实重kg]
                </p>
              </div>

              <textarea value={batchText} onChange={e => handleBatchParse(e.target.value)}
                placeholder={'粘贴数据，例如：\n50*40*30*5*10\n60×50×40×2×15kg\n70,45,35,3,8'}
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />

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
                            <td className="py-1.5 px-2">{row.actualWeight || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {parseErrors.length > 0 && parsedRows.length === 0 && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 whitespace-pre-line">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />{parseErrors.join('\n')}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowBatch(false)}
                className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100">
                取消
              </button>
              <button onClick={applyBatch} disabled={parsedRows.length === 0}
                className="px-6 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5">
                <Plus className="w-4 h-4" />确认添加 ({parsedRows.length} 条)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Related Tools Widget */}
      <div className="max-w-4xl mx-auto mb-8">
        <RelatedToolsWidget currentTool="shipping-calculator" />
      </div>

      {/* Tool-specific ads */}
      <AdSlot placement="tool-shipping-calculator-bottom" className="mt-8 mb-4 max-w-4xl mx-auto" />
      <AdSlot placement="tool-bottom" className="mt-4 mb-8 max-w-4xl mx-auto" />
    </div>
  );
}
