'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Calculator, Package, Plane, Ship, Truck, MapPin,
  Plus, Trash2, RotateCcw, Info, AlertTriangle,
  ChevronDown, ChevronUp, Clipboard, X, CheckCircle2,
  ArrowLeftRight, Scale, Box, GitBranch
} from 'lucide-react';
import { RelatedGuidesSection } from '@/components/related-guides-section';
import { FAQSection } from '@/components/faq-section';
import { AdSlot } from '@/components/ad-slot';
import { Breadcrumb } from '@/components/breadcrumb';
import { RelatedToolsWidget } from '@/components/related-tools-widget';
import { RelatedChecklistSection } from '@/components/related-checklist-section';
import { RelatedDiscussionsClient } from '@/components/community/related-discussions-client';
import { TaskChainNextStep, TASK_CHAIN_STEPS } from '@/components/tools/task-chain-next-step';
import { TaskChainSelectDialog } from '@/components/tools/task-chain-select-dialog';
import { importToolDataToTaskChain, createTaskChain, type TaskChain } from '@/lib/task-chain-api';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';
import { saveTaskChain } from '@/lib/task-chain';
import { buttonVariants, inputStyles, cardStyles, labelStyles } from "@/lib/ui-styles";
import { loadContainerToShipping, markContainerToShippingConsumed, clearContainerToShipping, ContainerToShippingData } from '@/lib/container-shipping-transfer';
import { loadAddressFromShipping, markAddressFromShippingConsumed, clearAddressFromShipping, AddressToShippingData } from '@/lib/address-shipping-transfer';

// ==================== Types ====================
interface CalcRow {
  id: string;
  length: string;
  width: string;
  height: string;
  quantity: string;
  unitWeight: string;
  actualWeight: string; // backward compat, computed from unitWeight × quantity
}

type ShippingMode = 'express' | 'air' | 'sea' | 'custom';
type BillingMode = 'weight' | 'volume' | 'higher' | 'cbm';

interface PersistedState {
  mode: ShippingMode;
  customDivisor: string;
  rows: CalcRow[];
  pricePerKg: string;
  pricePerCbm: string;
  billingMode: BillingMode;
  currency: string;
  exchangeRate: string;
  targetCurrency: string;
}

const STORAGE_KEY = 'shipping-calculator-v1';

// ==================== Helpers ====================
const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const defaultRow = (): CalcRow => ({
  id: genId(), length: '', width: '', height: '', quantity: '1', unitWeight: '', actualWeight: '',
});

const modeDivisor = (mode: ShippingMode, custom: string): number => {
  switch (mode) {
    case 'express': return 5000;
    case 'air': return 6000;
    case 'sea': return 6000;
    case 'custom': return parseInt(custom) || 5000;
  }
};

const modeLabel = (mode: ShippingMode): string => {
  switch (mode) {
    case 'express': return '📦 快递体积重 ÷5000';
    case 'air': return '✈️ 空运体积重 ÷6000';
    case 'sea': return '🚢 海运体积重 ÷6000';
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
        unitWeight: parts[4] || '',
        actualWeight: '',
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

  // Container to shipping transfer
  const [containerTransfer, setContainerTransfer] = useState<ContainerToShippingData | null>(null);
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);
  const [transferApplied, setTransferApplied] = useState(false);

  // Address to shipping transfer
  const [addressTransfer, setAddressTransfer] = useState<AddressToShippingData | null>(null);
  const [showAddressTransferConfirm, setShowAddressTransferConfirm] = useState(false);
  const [addressTransferApplied, setAddressTransferApplied] = useState(false);

  // Fee calculation
  const [pricePerKg, setPricePerKg] = useState(saved?.pricePerKg || '');
  const [pricePerCbm, setPricePerCbm] = useState(saved?.pricePerCbm || '');
  const [billingMode, setBillingMode] = useState<BillingMode>(saved?.billingMode || 'higher');
  const [currency, setCurrency] = useState(saved?.currency || 'CNY');
  const [exchangeRate, setExchangeRate] = useState(saved?.exchangeRate || '1');
  const [targetCurrency, setTargetCurrency] = useState(saved?.targetCurrency || 'CNY');

  // Task chain integration
  const { data: session } = useSession();
  const router = useRouter();
  const [showTaskChainDialog, setShowTaskChainDialog] = useState(false);
  const [creatingTaskChain, setCreatingTaskChain] = useState(false);

  // Persist to localStorage and save to task chain
  useEffect(() => {
    saveState({ mode, customDivisor, rows, pricePerKg, pricePerCbm, billingMode, currency, exchangeRate, targetCurrency });
    // Save to task chain if there's meaningful data
    if (rows.length > 0 && rows[0].length && rows[0].width && rows[0].height) {
      const r = calcResults();
      if (r.chargeableWeight > 0) {
        saveTaskChain({
          sourceTool: 'shipping-calculator',
          shippingEstimate: `${r.chargeableWeight.toFixed(2)} kg (计费重)`,
        });
      }
    }
  }, [mode, customDivisor, rows, pricePerKg, pricePerCbm, billingMode, currency, exchangeRate, targetCurrency]);

  // Check for container transfer data on mount
  useEffect(() => {
    const transferData = loadContainerToShipping();
    if (transferData && !transferData.consumed) {
      setContainerTransfer(transferData);
      setShowTransferConfirm(true);
    }
  }, []);

  // Check for address transfer data on mount
  useEffect(() => {
    const addrData = loadAddressFromShipping();
    if (addrData && !addrData.consumed) {
      setAddressTransfer(addrData);
      setShowAddressTransferConfirm(true);
    }
  }, []);

  // Handle container transfer confirmation
  const handleApplyTransfer = () => {
    if (!containerTransfer) return;
    
    const { payload } = containerTransfer;
    
    // Create a new row with container data (v1.20.42.7.06: use unitWeight)
    const newRow: CalcRow = {
      id: genId(),
      length: payload.unitLengthCm.toString(),
      width: payload.unitWidthCm.toString(),
      height: payload.unitHeightCm.toString(),
      quantity: payload.quantity.toString(),
      unitWeight: payload.unitWeightKg.toString(),
      actualWeight: '',
    };
    
    // Replace existing rows with the new row
    setRows([newRow]);
    
    // Mark as consumed
    markContainerToShippingConsumed();
    
    // Update UI state
    setShowTransferConfirm(false);
    setTransferApplied(true);
    setContainerTransfer(null);
    
    // Auto-hide success message after 5 seconds
    setTimeout(() => setTransferApplied(false), 5000);
  };

  const handleDismissTransfer = () => {
    // Clear transfer data
    clearContainerToShipping();
    setShowTransferConfirm(false);
    setContainerTransfer(null);
  };

  // Handle address transfer confirmation
  const handleApplyAddressTransfer = () => {
    if (!addressTransfer) return;
    
    // Mark as consumed
    markAddressFromShippingConsumed();
    
    // Update UI state - address data is shown as destination reference info
    setShowAddressTransferConfirm(false);
    setAddressTransferApplied(true);
    setAddressTransfer(null);
    
    // Auto-hide success message after 5 seconds
    setTimeout(() => setAddressTransferApplied(false), 5000);
  };

  const handleDismissAddressTransfer = () => {
    // Clear transfer data
    clearAddressFromShipping();
    setShowAddressTransferConfirm(false);
    setAddressTransfer(null);
  };

  // ==================== Calculations ====================
  const divisor = modeDivisor(mode, customDivisor);
  // All modes now use cm input consistently (sea mode no longer uses meters)
  const useMeters = false;

  const calcResults = useCallback(() => {
    let totalCtns = 0;
    let totalGW = 0;
    let totalVW = 0;
    let totalCBM = 0;
    const perRow: {
      vw: number; cbm: number; gw: number; ctns: number;
      l: number; w: number; h: number; q: number; unitW: number;
    }[] = [];

    rows.forEach(row => {
      const l = parseFloat(row.length) || 0;
      const w = parseFloat(row.width) || 0;
      const h = parseFloat(row.height) || 0;
      const q = parseInt(row.quantity) || 0;
      // v1.20.42.7.06: 实重合计 = 单件重量 × 件数 (auto-computed)
      const unitW = parseFloat(row.unitWeight) || 0;
      const gw = unitW > 0 ? unitW * q : (parseFloat(row.actualWeight) || 0); // backward compat

      // CBM calculation: cm to m³ conversion
      // Single piece CBM = L_cm × W_cm × H_cm / 1,000,000
      // Total CBM = Single CBM × quantity
      const singleCbm = (l * w * h) / 1000000;
      const cbm = singleCbm * q;
      
      // Volume weight calculation: cm³ to kg
      // VW = L_cm × W_cm × H_cm × quantity / divisor
      const volCm3 = l * w * h * q;
      const vw = volCm3 / divisor;

      totalCtns += q;
      totalGW += gw;
      totalVW += vw;
      totalCBM += cbm;

      perRow.push({ vw, cbm, gw, ctns: q, l, w, h, q, unitW: parseFloat(row.unitWeight) || 0 });
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
    setPricePerKg('');
    setPricePerCbm('');
    setBillingMode('higher');
    setCurrency('CNY');
    setExchangeRate('1');
    setTargetCurrency('CNY');
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

  // ==================== Task Chain Handlers ====================
  const collectCbmData = () => {
    const r = calcResults();
    // Use first row dimensions as representative data
    const firstRow = rows[0];
    return {
      length: parseFloat(firstRow?.length) || 0,
      width: parseFloat(firstRow?.width) || 0,
      height: parseFloat(firstRow?.height) || 0,
      cartons: r.totalCtns,
      grossWeight: r.totalGW,
      cbm: r.totalCBM,
      chargeableWeight: r.chargeableWeight,
      sourceTool: 'shipping-calculator',
    };
  };

  const handleJoinTaskChain = () => {
    if (!session) {
      alert('请先登录后再加入任务链');
      return;
    }
    if (results.chargeableWeight <= 0) {
      alert('请先输入货物尺寸和重量进行计算');
      return;
    }
    setShowTaskChainDialog(true);
  };

  const handleSelectTaskChain = async (taskChain: TaskChain) => {
    try {
      setCreatingTaskChain(true);
      const cbmData = collectCbmData();
      await importToolDataToTaskChain(taskChain.id, 'cbm-tool', cbmData);
      setShowTaskChainDialog(false);
      router.push(`/task-chains/${taskChain.id}`);
    } catch (error) {
      console.error('Failed to import data to task chain:', error);
      alert('加入任务链失败，请稍后重试');
    } finally {
      setCreatingTaskChain(false);
    }
  };

  const handleCreateNewTaskChain = async (title: string): Promise<TaskChain> => {
    const cbmData = collectCbmData();
    return createTaskChain({
      title,
      sourceTool: 'shipping-calculator',
      context: cbmData,
    });
  };

  const unitLabel = useMeters ? 'm' : 'cm';
  const dimUnit = useMeters ? '米 (m)' : '厘米 (cm)';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto mt-8">
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
              className={buttonVariants.secondary}>
              <RotateCcw className="w-4 h-4" />重置
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ===== Dual-column workbench layout (desktop) ===== */}
        <div className="lg:grid lg:grid-cols-[1fr_420px] lg:gap-6 items-start">
        {/* ===== LEFT COLUMN: Inputs ===== */}
        <div className="space-y-6 min-w-0">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb />
        </div>
        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-amber-800 text-sm">
            <strong>免责声明：</strong>运费结果仅供估算，最终费用以承运商、集运公司或实际账单为准。不同渠道的除数、首重、续重标准可能有所不同，计算结果仅供理解计费逻辑使用。
          </p>
        </div>

        {/* Container Transfer Confirmation */}
        {showTransferConfirm && containerTransfer && (
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-300 rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Box className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  已检测到来自集装箱计算器的数据
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  是否将以下数据带入运费计算？
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <div className="text-gray-500 text-xs">单件尺寸</div>
                    <div className="font-semibold text-gray-900">
                      {containerTransfer.payload.unitLengthCm} × {containerTransfer.payload.unitWidthCm} × {containerTransfer.payload.unitHeightCm} cm
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <div className="text-gray-500 text-xs">单件重量</div>
                    <div className="font-semibold text-gray-900">
                      {containerTransfer.payload.unitWeightKg} kg
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <div className="text-gray-500 text-xs">数量</div>
                    <div className="font-semibold text-gray-900">
                      {containerTransfer.payload.quantity} 件
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <div className="text-gray-500 text-xs">总体积</div>
                    <div className="font-semibold text-gray-900">
                      {containerTransfer.payload.totalCbm.toFixed(4)} CBM
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleApplyTransfer}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-medium rounded-lg shadow-sm transition-all"
              >
                ✓ 使用集装箱数据
              </button>
              <button
                onClick={handleDismissTransfer}
                className="flex-1 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-all"
              >
                保留当前输入
              </button>
            </div>
          </div>
        )}

        {/* Transfer Applied Success Message */}
        {transferApplied && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-green-800 text-sm">
              <strong>已从集装箱计算器带入尺寸、重量和数量。</strong>尺寸单位：cm，重量单位：kg。请确认运输方式、目的地和计费规则。
            </p>
          </div>
        )}

        {/* Address Transfer Confirmation */}
        {showAddressTransferConfirm && addressTransfer && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <MapPin className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  已检测到来自地址格式化助手的目的地信息
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  是否将目的地信息带入运费计算参考？
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {addressTransfer.payload.country && (
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <div className="text-gray-500 text-xs">国家</div>
                      <div className="font-semibold text-gray-900">{addressTransfer.payload.country}</div>
                    </div>
                  )}
                  {addressTransfer.payload.province && (
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <div className="text-gray-500 text-xs">省/州</div>
                      <div className="font-semibold text-gray-900">{addressTransfer.payload.province}</div>
                    </div>
                  )}
                  {addressTransfer.payload.city && (
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <div className="text-gray-500 text-xs">城市</div>
                      <div className="font-semibold text-gray-900">{addressTransfer.payload.city}</div>
                    </div>
                  )}
                  {addressTransfer.payload.postalCode && (
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <div className="text-gray-500 text-xs">邮编</div>
                      <div className="font-semibold text-gray-900">{addressTransfer.payload.postalCode}</div>
                    </div>
                  )}
                </div>
                {addressTransfer.payload.addressSummary && (
                  <p className="text-xs text-gray-500 mt-2">
                    地址摘要：{addressTransfer.payload.addressSummary}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleApplyAddressTransfer}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-lg shadow-sm transition-all"
              >
                ✓ 使用地址信息
              </button>
              <button
                onClick={handleDismissAddressTransfer}
                className="flex-1 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-all"
              >
                保留当前输入
              </button>
            </div>
          </div>
        )}

        {/* Address Transfer Applied Success Message */}
        {addressTransferApplied && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
            <p className="text-indigo-800 text-sm">
              <strong>已带入目的地信息。</strong>请继续确认运输方式、重量、体积和计费规则。
            </p>
          </div>
        )}

        {/* Mode Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {([
            { key: 'express' as ShippingMode, icon: Package, label: '快递 ÷5000', color: 'blue' },
            { key: 'air' as ShippingMode, icon: Plane, label: '空运 ÷6000', color: 'green' },
            { key: 'sea' as ShippingMode, icon: Ship, label: '海运 ÷6000', color: 'teal' },
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
              className={`${inputStyles} w-28`} />
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
                  { name: '海运', d: '6000', detail: '部分渠道参考' },
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
              <p className="text-amber-600 mt-2">⚠️ 以上除数值仅供参考，不同承运商和渠道可能采用不同的除数标准（如海运可能使用 6000、7000 或其他值），请以实际承运商规定为准。</p>
            </div>
          )}

          {/* Column Headers */}
          <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 text-xs font-medium text-gray-400 bg-gray-50/50 border-t">
            <span className="col-span-1">#</span>
            <span className="col-span-2">长 ({unitLabel})</span>
            <span className="col-span-2">宽 ({unitLabel})</span>
            <span className="col-span-2">高 ({unitLabel})</span>
            <span className="col-span-1">件数</span>
            <span className="col-span-1">单件重量 (kg)</span>
            <span className="col-span-1">实重合计</span>
            <span className="col-span-1">操作</span>
            <span className="col-span-1">体积重</span>
          </div>

          {/* Rows */}
          <div className="p-4 space-y-3">
            {rows.map((row, idx) => {
              const l = parseFloat(row.length) || 0;
              const w = parseFloat(row.width) || 0;
              const h = parseFloat(row.height) || 0;
              const q = parseInt(row.quantity) || 0;
              const volCm3 = useMeters ? (l * 100) * (w * 100) * (h * 100) * q : l * w * h * q;
              const vw = volCm3 / divisor;

              return (
                <div key={row.id} className="bg-gray-50 rounded-lg p-3 space-y-3">
                  {/* Row header */}
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-700">规格 {idx + 1}</span>
                    <button onClick={() => removeRow(row.id)} disabled={rows.length === 1}
                      className="p-1.5 text-red-400 hover:text-red-600 disabled:opacity-30 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Dimensions - Mobile: stacked, Desktop: grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">长 ({unitLabel})</label>
                      <input type="number" step={useMeters ? '0.01' : '1'} placeholder="长" value={row.length}
                        onChange={e => updateRow(row.id, 'length', e.target.value)}
                        className={`${inputStyles} text-center`} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">宽 ({unitLabel})</label>
                      <input type="number" step={useMeters ? '0.01' : '1'} placeholder="宽" value={row.width}
                        onChange={e => updateRow(row.id, 'width', e.target.value)}
                        className={`${inputStyles} text-center`} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">高 ({unitLabel})</label>
                      <input type="number" step={useMeters ? '0.01' : '1'} placeholder="高" value={row.height}
                        onChange={e => updateRow(row.id, 'height', e.target.value)}
                        className={`${inputStyles} text-center`} />
                    </div>
                  </div>

                  {/* Quantity and weight */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">件数</label>
                      <input type="number" min="1" placeholder="件数" value={row.quantity}
                        onChange={e => updateRow(row.id, 'quantity', e.target.value)}
                        className={`${inputStyles} text-center`} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">单件重量 (kg)</label>
                      <input type="number" step="0.01" placeholder="kg" value={row.unitWeight}
                        onChange={e => updateRow(row.id, 'unitWeight', e.target.value)}
                        className={`${inputStyles} text-center`} />
                    </div>
                  </div>

                  {/* Results summary */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-600">
                      <span className="text-gray-400">实重合计：</span>
                      <span className="font-medium text-gray-900">
                        {(parseFloat(row.unitWeight) || 0) * q > 0
                          ? `${((parseFloat(row.unitWeight) || 0) * q).toFixed(1)} kg`
                          : '—'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 text-right">
                      <span className="text-gray-400">体积重：</span>
                      <span className="font-medium text-gray-900">
                        {vw > 0 ? `${vw.toFixed(1)} kg` : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="px-4 pb-4 flex flex-wrap gap-2">
            <button onClick={addRow}
              className={buttonVariants.secondary}>
              <Plus className="w-4 h-4" />增加规格
            </button>
            <button onClick={() => { setShowBatch(true); setBatchText(''); setParsedRows([]); setParseErrors([]); }}
              className={buttonVariants.ghost}>
              <Clipboard className="w-4 h-4" />批量增加
            </button>
          </div>
        </div>

        {/* ==================== Fee Settings ==================== */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <span>💰</span> 运费费率设置 <span className="text-xs text-gray-400 font-normal">（选填，用于估算运费金额）</span>
            </h3>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <div>
              <label className={labelStyles.field}>计费方式</label>
              <select value={billingMode} onChange={e => setBillingMode(e.target.value as BillingMode)} className={inputStyles}>
                <option value="higher">实重/体积重取高</option>
                <option value="weight">按实际重量</option>
                <option value="volume">按体积重量</option>
                <option value="cbm">按立方 (CBM)</option>
              </select>
            </div>
            <div>
              <label className={labelStyles.field}>公斤单价</label>
              <input type="number" step="0.01" placeholder="如 25" value={pricePerKg} onChange={e => setPricePerKg(e.target.value)} className={inputStyles} />
            </div>
            <div>
              <label className={labelStyles.field}>立方单价</label>
              <input type="number" step="0.01" placeholder="如 600" value={pricePerCbm} onChange={e => setPricePerCbm(e.target.value)} className={inputStyles} />
            </div>
            <div>
              <label className={labelStyles.field}>源币种</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputStyles}>
                <option value="CNY">CNY 人民币</option>
                <option value="USD">USD 美元</option>
                <option value="EUR">EUR 欧元</option>
                <option value="GBP">GBP 英镑</option>
              </select>
            </div>
            <div>
              <label className={labelStyles.field}>汇率</label>
              <input type="number" step="0.0001" placeholder="1" value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} className={inputStyles} />
            </div>
            <div>
              <label className={labelStyles.field}>目标币种</label>
              <select value={targetCurrency} onChange={e => setTargetCurrency(e.target.value)} className={inputStyles}>
                <option value="CNY">CNY 人民币</option>
                <option value="USD">USD 美元</option>
                <option value="EUR">EUR 欧元</option>
                <option value="GBP">GBP 英镑</option>
              </select>
            </div>
            <div className="flex items-end">
              <p className="text-[10px] text-gray-400 leading-tight">费率与汇率均为手动输入，结果仅供估算参考</p>
            </div>
          </div>
        </div>
        </div>{/* End LEFT COLUMN */}

        {/* ===== RIGHT COLUMN: Results ===== */}
        <div className="space-y-4 mt-6 lg:mt-0 lg:sticky lg:top-4">

        {/* ==================== Volume & Weight Card ==================== */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Box className="w-4 h-4 text-blue-500" />体积与重量
            </h2>
          </div>
          <div className="p-5 space-y-4">
            {/* CBM Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-[11px] text-blue-500 font-medium mb-1">单件 CBM</p>
                <p className="text-xl font-bold text-blue-900">
                  {results.totalCtns > 0 ? (results.totalCBM / results.totalCtns).toFixed(4) : '0.0000'}
                  <span className="text-xs font-normal text-blue-400 ml-1">m³</span>
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-[11px] text-blue-500 font-medium mb-1">总方数 / 总 CBM</p>
                <p className="text-xl font-bold text-blue-900">
                  {results.totalCBM.toFixed(4)}
                  <span className="text-xs font-normal text-blue-400 ml-1">m³</span>
                </p>
              </div>
            </div>

            {/* Weight Comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-[11px] text-gray-400 mb-1">总实重 <span className="text-[9px] text-blue-400">(单件重量×件数)</span></p>
                <p className="text-lg font-bold text-gray-900">
                  {results.totalGW > 0 ? results.totalGW.toFixed(1) : '—'}
                  <span className="text-xs font-normal text-gray-400 ml-1">kg</span>
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-[11px] text-gray-400 mb-1">总体积重</p>
                <p className="text-lg font-bold text-gray-900">
                  {results.totalVW.toFixed(1)}
                  <span className="text-xs font-normal text-gray-400 ml-1">kg</span>
                </p>
              </div>
            </div>

            {/* Chargeable Weight - Highlighted */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 text-center">
              <p className="text-xs text-orange-500 font-medium mb-1">计费重量</p>
              <p className="text-3xl font-black text-orange-600">
                {results.chargeableWeight.toFixed(1)}
                <span className="text-sm font-normal text-orange-400 ml-1">kg</span>
              </p>
              <p className="text-[11px] text-orange-400 mt-1">
                {results.totalVW > results.totalGW && results.totalGW > 0
                  ? '⚠️ 泡货 — 按体积重计费'
                  : results.totalGW > results.totalVW && results.totalVW > 0
                    ? '✅ 重货 — 按实重计费'
                    : '取实重与体积重较大者'}
              </p>
            </div>

            {/* Total pieces */}
            <div className="text-center text-xs text-gray-400">
              总件数：<span className="font-semibold text-gray-600">{results.totalCtns}</span> 件
            </div>

            {/* Join Task Chain Button */}
            {results.chargeableWeight > 0 && (
              <button
                onClick={handleJoinTaskChain}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
              >
                <GitBranch className="w-4 h-4" />
                {session ? '加入任务链' : '登录后加入任务链'}
              </button>
            )}
          </div>
        </div>

        {/* ==================== Main Fee Card ==================== */}
        {(pricePerKg || pricePerCbm) && (() => {
          const ppk = parseFloat(pricePerKg) || 0;
          const ppcb = parseFloat(pricePerCbm) || 0;
          const rate = parseFloat(exchangeRate) || 1;
          const totalCbmM3 = results.totalCBM; // Already in m³ from calcResults

          // Calculate fees based on billing mode
          let mainFee = 0;
          let mainFeeLabel = '';
          let mainFeeDetail = '';

          switch (billingMode) {
            case 'weight':
              mainFee = results.totalGW * ppk;
              mainFeeLabel = '按实重计费';
              mainFeeDetail = `${results.totalGW.toFixed(1)} kg × ${ppk} ${currency}/kg`;
              break;
            case 'volume':
              mainFee = results.totalVW * ppk;
              mainFeeLabel = '按体积重计费';
              mainFeeDetail = `${results.totalVW.toFixed(1)} kg × ${ppk} ${currency}/kg`;
              break;
            case 'higher':
              mainFee = results.chargeableWeight * ppk;
              mainFeeLabel = '二者取高计费';
              mainFeeDetail = `${results.chargeableWeight.toFixed(1)} kg × ${ppk} ${currency}/kg`;
              break;
            case 'cbm':
              mainFee = totalCbmM3 * ppcb;
              mainFeeLabel = '按立方计费';
              mainFeeDetail = `${totalCbmM3.toFixed(4)} m³ × ${ppcb} ${currency}/m³`;
              break;
          }

          const convertedFee = mainFee * rate;
          if (mainFee <= 0) return null;

          return (
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-5 py-3 bg-green-700/50 border-b border-green-500/30">
                <h2 className="text-sm font-semibold text-green-100 flex items-center gap-2">
                  <span>💰</span> 主运费估算
                </h2>
              </div>
              <div className="p-5 space-y-4">
                {/* Billing mode badge */}
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-medium">{mainFeeLabel}</span>
                  <span className="text-xs text-green-200">{mainFeeDetail}</span>
                </div>

                {/* Main fee amount */}
                <div className="text-center py-3">
                  <p className="text-xs text-green-200 mb-1">运费金额</p>
                  <p className="text-4xl font-black">
                    {mainFee.toFixed(2)}
                    <span className="text-lg font-normal text-green-200 ml-2">{currency}</span>
                  </p>
                </div>

                {/* Currency conversion */}
                {rate !== 1 && currency !== targetCurrency && (
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-green-200 mb-1">折合 {targetCurrency}</p>
                    <p className="text-2xl font-bold text-teal-300">
                      {convertedFee.toFixed(2)}
                      <span className="text-sm font-normal text-green-200 ml-1">{targetCurrency}</span>
                    </p>
                    <p className="text-[10px] text-green-300 mt-1">汇率：1 {currency} = {rate} {targetCurrency}</p>
                  </div>
                )}

                {/* Auxiliary fees */}
                {billingMode === 'cbm' && ppk > 0 && (
                  <div className="border-t border-green-500/30 pt-3">
                    <p className="text-[11px] text-green-200 mb-1">按公斤参考</p>
                    <p className="text-sm font-medium">
                      {(results.chargeableWeight * ppk).toFixed(2)} {currency}
                      <span className="text-green-300 text-xs ml-1">（{results.chargeableWeight.toFixed(1)} kg × {ppk}）</span>
                    </p>
                  </div>
                )}
                {billingMode !== 'cbm' && ppcb > 0 && (
                  <div className="border-t border-green-500/30 pt-3">
                    <p className="text-[11px] text-green-200 mb-1">按立方参考</p>
                    <p className="text-sm font-medium">
                      {(totalCbmM3 * ppcb).toFixed(2)} {currency}
                      <span className="text-green-300 text-xs ml-1">（{totalCbmM3.toFixed(4)} m³ × {ppcb}）</span>
                    </p>
                  </div>
                )}

                {/* Disclaimer */}
                <p className="text-[10px] text-green-300 text-center">⚠️ 估算仅供参考，以承运商/货代实际报价为准</p>
              </div>
            </div>
          );
        })()}
        </div>{/* End RIGHT COLUMN */}
        </div>{/* End dual-column grid */}

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
                  <span>体积重</span><span>单件重量</span><span>实重合计</span><span>计费重</span>
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
                      <div className="md:col-span-1">{r.unitW > 0 ? `${r.unitW} kg` : '—'}</div>
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
            <h3 className={cardStyles.header}>
              <Truck className="w-4 h-4 text-green-600" />费用构成参考
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">以下仅为费用构成说明，非实际报价</p>
          </div>
          <div className="p-4 space-y-3 divide-y divide-gray-100">
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
                notes: ['通常按 CBM 计费，部分渠道有体积重参考（÷6000）', '起运量一般 1 CBM 起', '时效 30-50 工作日，适合大件重货'],
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
              <h3 className={cardStyles.header}>
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
              <h3 className={cardStyles.header}>
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
            answer: "不同运输方式的除数反映了各自的空间成本。快递（÷5000）最贵，因为时效快、空间紧张；空运（÷6000）次之；海运（÷6000）最宽松，因为船舱空间大。除数越大，算出来的体积重越小，费用越低。",
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

      {/* ==================== Task Chain Select Dialog ==================== */}
      <TaskChainSelectDialog
        isOpen={showTaskChainDialog}
        onClose={() => setShowTaskChainDialog(false)}
        onSelect={handleSelectTaskChain}
        onCreateNew={handleCreateNewTaskChain}
        sourceTool="shipping-calculator"
      />

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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-blue-700 font-mono">
                  <p>• 50*40*30*5*8</p>
                  <p>• 50×40×30×5×8kg</p>
                  <p>• 50,40,30,5,8</p>
                  <p>• 50x40x30 5箱 8kg</p>
                  <p>• 50 40 30 5 8</p>
                  <p>• 每行一条，支持换行/逗号/分号分隔</p>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  顺序：长({unitLabel}) 宽({unitLabel}) 高({unitLabel}) [件数] [单件重量kg]
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  💡 实重合计 = 单件重量 × 件数，系统自动计算
                </p>
              </div>

              <textarea value={batchText} onChange={e => handleBatchParse(e.target.value)}
                placeholder={'粘贴数据，例如：\n50*40*30*5*8\n60×50×40×2×15kg\n70,45,35,3,20\n\n顺序：长 宽 高 件数 单件重量'}
                rows={6}
                className={`${inputStyles} resize-none font-mono`} />

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
                          <th className="py-1.5 px-2 text-gray-500">件数</th>
                          <th className="py-1.5 px-2 text-gray-500">单件重量</th>
                          <th className="py-1.5 px-2 text-gray-500">实重合计</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedRows.map((row, idx) => {
                          const uw = parseFloat(row.unitWeight) || 0;
                          const q = parseInt(row.quantity) || 0;
                          const rowGw = uw * q;
                          return (
                          <tr key={row.id} className="border-t border-gray-100">
                            <td className="py-1.5 px-2 text-gray-400">{idx + 1}</td>
                            <td className="py-1.5 px-2">{row.length}</td>
                            <td className="py-1.5 px-2">{row.width}</td>
                            <td className="py-1.5 px-2">{row.height}</td>
                            <td className="py-1.5 px-2">{row.quantity}</td>
                            <td className="py-1.5 px-2">{row.unitWeight || '—'}</td>
                            <td className="py-1.5 px-2 text-blue-600 font-medium">{rowGw > 0 ? `${rowGw.toFixed(1)} kg` : '—'}</td>
                          </tr>
                          );
                        })}
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
      <div className="max-w-7xl mx-auto mt-8">
        <RelatedToolsWidget currentTool="shipping-calculator" />
      </div>

      {/* Related Checklist */}
      <div className="max-w-7xl mx-auto mt-8">
        <RelatedChecklistSection
          toolSlug="shipping-calculator"
          sourcePath="shipping-calculator"
        />
      </div>

      {/* Task Chain Next Step */}
      <div className="max-w-7xl mx-auto mt-8">
        <TaskChainNextStep
          sourceTool="shipping-calculator"
          steps={TASK_CHAIN_STEPS['shipping-calculator']}
        />
      </div>

      {/* Tool-specific ads */}
      <AdSlot placement="tool-shipping-calculator-bottom" className="mt-8 mb-4 max-w-4xl mx-auto" />
      <AdSlot placement="tool-bottom" className="mt-4 mb-8 max-w-4xl mx-auto" />

      <RelatedDiscussionsClient tool="shipping-calculator" />
    </div>
  );
}
