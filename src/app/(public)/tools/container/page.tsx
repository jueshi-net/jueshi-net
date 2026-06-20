"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Container, Info, Link2, Loader2 } from "lucide-react";
import { AdSlot } from "@/components/ad-slot";
import { FAQSection } from "@/components/faq-section";
import { Breadcrumb } from "@/components/breadcrumb";
import { buttonVariants, inputStyles, cardStyles, labelStyles } from "@/lib/ui-styles";
import { saveContainerToShipping } from "@/lib/container-shipping-transfer";

const containerTypes = [
  { name: "20GP", length: 5.9, width: 2.35, height: 2.39, volume: 33.2, maxWeight: 21770, useCase: "小批量普货、样品单、个人物品", icon: "📦", color: "blue" },
  { name: "40GP", length: 12.03, width: 2.35, height: 2.39, volume: 67.7, maxWeight: 26680, useCase: "大批量标准货物、电子产品、纺织品", icon: "🚛", color: "teal" },
  { name: "40HC", length: 12.03, width: 2.35, height: 2.69, volume: 76.3, maxWeight: 26480, useCase: "高货、轻泡货、家具、大型设备", icon: "📏", color: "purple" },
  { name: "45HC", length: 13.56, width: 2.35, height: 2.69, volume: 86.1, maxWeight: 27700, useCase: "超大容积需求、超高货物、大批量出口", icon: "🏗️", color: "orange" },
];

// v1.20.42.7.06: Bulk import cargo row type
interface BulkCargoRow {
  id: string;
  length: number;
  width: number;
  height: number;
  quantity: number;
  weight: number;
}

const genBulkId = () => `bulk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// v1.20.42.7.06: Parse bulk import text
const parseBulkCargo = (text: string): { rows: BulkCargoRow[]; errors: string[] } => {
  const lines = text.trim().split(/[\n;；]+/).map(l => l.trim()).filter(l => l.length > 0);
  const results: BulkCargoRow[] = [];
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
        id: genBulkId(),
        length: parseFloat(parts[0]) || 0,
        width: parseFloat(parts[1]) || 0,
        height: parseFloat(parts[2]) || 0,
        quantity: parseInt(parts[3]) || 1,
        weight: parseFloat(parts[4]) || 0,
      });
    } else {
      errors.push(`第${idx + 1}行: "${line}" — 至少需要长、宽、高3个数值`);
    }
  });

  return { rows: results, errors };
};

export default function ContainerCalculatorPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [cargoL, setCargoL] = useState(0);
  const [cargoW, setCargoW] = useState(0);
  const [cargoH, setCargoH] = useState(0);
  const [cargoWeight, setCargoWeight] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);

  // v1.20.42.7.06: Bulk import state
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkRows, setBulkRows] = useState<BulkCargoRow[]>([]);
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);
  const [bulkImportApplied, setBulkImportApplied] = useState(false);
  const [taskChainCreating, setTaskChainCreating] = useState(false);

  // 单件体积 (m³)
  const singleVolume = (cargoL * cargoW * cargoH) / 1000000;
  // 当前批次总体积 (m³)
  const totalVolume = singleVolume * quantity;
  // 当前批次总重量 (kg)
  const totalWeight = cargoWeight * quantity;

  // v1.20.42.7.06: Bulk import totals
  const bulkTotalVolume = bulkRows.reduce((sum, r) => sum + (r.length * r.width * r.height / 1000000) * r.quantity, 0);
  const bulkTotalWeight = bulkRows.reduce((sum, r) => sum + r.weight * r.quantity, 0);
  const bulkTotalQuantity = bulkRows.reduce((sum, r) => sum + r.quantity, 0);
  
  // Overall totals including bulk import
  // v1.20.42.7.06 fix: only include primary quantity when primary input has dimensions
  const hasPrimaryInput = cargoL > 0 && cargoW > 0 && cargoH > 0;
  const overallVolume = totalVolume + bulkTotalVolume;
  const overallWeight = totalWeight + bulkTotalWeight;
  const overallQuantity = (hasPrimaryInput ? quantity : 0) + bulkTotalQuantity;

  const handleFillExample = () => {
    setCargoL(60);
    setCargoW(40);
    setCargoH(50);
    setCargoWeight(15);
    setQuantity(100);
    // Clear bulk import when filling example
    setBulkRows([]);
    setBulkText('');
    setBulkErrors([]);
  };

  // v1.20.42.7.06: Handle bulk import
  const handleBulkParse = (text: string) => {
    setBulkText(text);
    const { rows, errors } = parseBulkCargo(text);
    setBulkRows(rows);
    setBulkErrors(errors);
  };

  const handleBulkImportClear = () => {
    setBulkRows([]);
    setBulkText('');
    setBulkErrors([]);
    setBulkImportApplied(false);
  };

  // 处理"带入运费计算"按钮点击
  const handleTransferToShipping = () => {
    // 找到推荐的集装箱类型（如果有）
    const recommended = results.find(ct => ct.recommended);
    const suggestedContainer = recommended?.name || '20GP';
    const utilizationRate = recommended ? parseFloat(recommended.batchVolumeUtil) : 0;
    const maxUnits = recommended?.maxItems || 0;
    const batchCount = recommended?.batches || 0;

    // v1.20.42.7.06: Include bulk import data in transfer
    const payload = {
      quantity: overallQuantity,
      unitLengthCm: cargoL,
      unitWidthCm: cargoW,
      unitHeightCm: cargoH,
      unitWeightKg: cargoWeight,
      totalCbm: overallVolume,
      totalWeightKg: overallWeight,
      suggestedContainer,
      utilizationRate,
      maxUnits,
      batchCount,
    };

    const success = saveContainerToShipping(payload);
    if (success) {
      router.push('/tools/shipping-calculator');
    } else {
      alert('无法保存数据，请检查浏览器设置');
    }
  };

  const joinShippingTaskChain = async () => {
    if (sessionStatus === 'loading') return;
    if (!session?.user) {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }
    setTaskChainCreating(true);
    try {
      const res = await fetch('/api/task-chains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `发货任务 - CBM ${overallVolume.toFixed(4)} m³`,
          sourceTool: 'container',
          context: {
            totalCbm: overallVolume,
            totalWeightKg: overallWeight,
            totalQuantity: overallQuantity,
            unitLengthCm: cargoL,
            unitWidthCm: cargoW,
            unitHeightCm: cargoH,
            unitWeightKg: cargoWeight,
          },
        }),
      });
      const json = await res.json();
      if (json.success && json.taskChain) {
        router.push(`/workspace/task-chains/shipping/${json.taskChain.id}`);
      } else {
        alert(json.error || '创建任务链失败');
      }
    } catch (e) {
      console.error(e);
      alert('网络错误，请稍后重试');
    } finally {
      setTaskChainCreating(false);
    }
  };

  const results = containerTypes.map(ct => {
    // v1.20.42.7.06: Use overall totals including bulk import
    // 当前批次占柜容体积比例
    const batchVolumeUtil = overallVolume > 0 ? (overallVolume / ct.volume * 100) : 0;
    // 当前批次占柜限重比例
    const batchWeightUtil = overallWeight > 0 ? (overallWeight / ct.maxWeight * 100) : 0;
    
    // 理论可装件数（按体积，单件）
    const maxItemsByVolume = singleVolume > 0 ? Math.floor(ct.volume / singleVolume) : 0;
    // 理论可装件数（按重量，单件）
    const maxItemsByWeight = cargoWeight > 0 ? Math.floor(ct.maxWeight / cargoWeight) : 0;
    // 实际可装件数（取较小值）
    const maxItems = Math.min(maxItemsByVolume, maxItemsByWeight);
    
    // 当前批次可装几批（按体积）- v1.20.42.7.06: use overallVolume
    const batchesByVolume = overallVolume > 0 ? Math.floor(ct.volume / overallVolume) : 0;
    // 当前批次可装几批（按重量）- v1.20.42.7.06: use overallWeight
    const batchesByWeight = overallWeight > 0 ? Math.floor(ct.maxWeight / overallWeight) : 0;
    // 实际可装批次数（取较小值）
    const batches = Math.min(batchesByVolume, batchesByWeight);

    return {
      ...ct,
      batchVolumeUtil: batchVolumeUtil.toFixed(1),
      batchWeightUtil: batchWeightUtil.toFixed(1),
      maxItemsByVolume,
      maxItemsByWeight,
      maxItems,
      batches,
      recommended: batchVolumeUtil > 50 && batchVolumeUtil < 95
    };
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Breadcrumb />
      </div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <Container className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">集装箱计算器</h1>
          <p className="text-sm text-gray-500">计算货物可装箱数和空间利用率</p>
        </div>
      </div>

      {/* Input */}
      <div className={cardStyles.base + " mb-6"}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={cardStyles.header.replace("mb-4", "")}>货物尺寸 (cm)</h3>
          <button 
            onClick={handleFillExample}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors"
          >
            <span>📋</span> 填充示例
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className={labelStyles.field}>长 (cm)</label>
            <input type="number" value={cargoL || ""} onChange={e => setCargoL(Number(e.target.value))} className={inputStyles} />
          </div>
          <div>
            <label className={labelStyles.field}>宽 (cm)</label>
            <input type="number" value={cargoW || ""} onChange={e => setCargoW(Number(e.target.value))} className={inputStyles} />
          </div>
          <div>
            <label className={labelStyles.field}>高 (cm)</label>
            <input type="number" value={cargoH || ""} onChange={e => setCargoH(Number(e.target.value))} className={inputStyles} />
          </div>
          <div>
            <label className={labelStyles.field}>单件重量 (kg)</label>
            <input type="number" value={cargoWeight || ""} onChange={e => setCargoWeight(Number(e.target.value))} className={inputStyles} />
          </div>
          <div>
            <label className={labelStyles.field}>数量</label>
            <input type="number" value={quantity || ""} onChange={e => setQuantity(Number(e.target.value))} className={inputStyles} />
          </div>
        </div>

        {/* Summary */}
        {(cargoL && cargoW && cargoH || bulkRows.length > 0) && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 mb-2">
              <Info className="w-4 h-4" />
              <span>
                {bulkRows.length > 0 
                  ? `合计：${overallQuantity} 件，共 ${overallVolume.toFixed(4)} CBM，约 ${overallWeight.toFixed(1)} kg`
                  : `当前货物：${quantity} 件，共 ${totalVolume.toFixed(4)} CBM，约 ${totalWeight.toFixed(1)} kg`}
              </span>
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              <p className="font-medium mb-1">💡 计算说明：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>单件体积 = 长 × 宽 × 高 ÷ 1,000,000 = {singleVolume.toFixed(4)} m³</li>
                <li>当前批次总体积 = 单件体积 × 数量 = {totalVolume.toFixed(4)} m³</li>
                <li>当前批次总重量 = 单件重量 × 数量 = {totalWeight.toFixed(1)} kg</li>
                {bulkRows.length > 0 && (
                  <>
                    <li className="text-teal-600 font-medium">批量导入：{bulkRows.length} 种规格，{bulkTotalQuantity} 件，{bulkTotalVolume.toFixed(4)} m³，{bulkTotalWeight.toFixed(1)} kg</li>
                    <li className="text-blue-700 font-medium">合计：{overallQuantity} 件，{overallVolume.toFixed(4)} m³，{overallWeight.toFixed(1)} kg</li>
                  </>
                )}
                <li>理论可装件数 = min(柜容积 ÷ 单件体积, 柜限重 ÷ 单件重量)</li>
                <li>可装批次数 = 理论可装件数 ÷ 当前数量</li>
                <li className="text-orange-600 dark:text-orange-400 font-medium">⚠️ 以上仅为体积/重量粗算，实际装柜受托盘、包装、货物形状、堆叠方式和限重影响</li>
              </ul>
            </div>
            
            {/* 带入运费计算按钮 */}
            {(totalVolume > 0 || bulkTotalVolume > 0) && (totalWeight > 0 || bulkTotalWeight > 0) && (
              <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                <button
                  onClick={handleTransferToShipping}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-medium rounded-lg shadow-sm transition-all"
                >
                  <span className="text-xl">🚢</span>
                  <span>带入运费计算</span>
                </button>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">
                  将当前体积、重量和件数带入运费计算器，便于继续估算运输成本。
                </p>
                <button
                  onClick={joinShippingTaskChain}
                  disabled={taskChainCreating}
                  className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {taskChainCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Link2 className="w-4 h-4" />
                  )}
                  <span>{sessionStatus !== 'authenticated' ? '登录后继续' : '加入发货任务链'}</span>
                </button>
                <p className="text-xs text-teal-600 dark:text-teal-400 mt-1.5 text-center">
                  创建发货任务链，将 CBM、重量等数据带入发货工作台继续操作。
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* v1.20.42.7.06: Bulk Import Section */}
      <div className={cardStyles.base + " mb-6"}>
        <button
          onClick={() => setShowBulkImport(!showBulkImport)}
          className="w-full flex items-center justify-between mb-0"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <h3 className={cardStyles.header.replace("mb-4", "")}>批量导入货物规格</h3>
            {bulkRows.length > 0 && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                已导入 {bulkRows.length} 行
              </span>
            )}
          </div>
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${showBulkImport ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showBulkImport && (
          <div className="mt-4 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-800 mb-1">📋 支持以下格式（自动识别）：</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-blue-700 font-mono">
                <p>• 50,40,30,10,8</p>
                <p>• 50*40*30*10*8</p>
                <p>• 50×40×30×10×8kg</p>
                <p>• 50 40 30 10 8</p>
                <p>• 每行一条规格</p>
                <p>• Tab 分隔也可以</p>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                顺序：长(cm) 宽(cm) 高(cm) [件数] [单件重量kg]
              </p>
              <p className="text-xs text-blue-500 mt-1">
                💡 件数和重量可选，未提供时件数默认为1，重量为0
              </p>
            </div>

            <textarea
              value={bulkText}
              onChange={e => handleBulkParse(e.target.value)}
              placeholder={'粘贴数据，例如：\n50,40,30,10,8\n100,50,40,2,20'}
              rows={5}
              className={`${inputStyles} resize-none font-mono`}
            />

            {bulkErrors.length > 0 && bulkRows.length === 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 whitespace-pre-line">
                ⚠️ {bulkErrors.join('\n')}
              </div>
            )}

            {bulkRows.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-900">
                    ✅ 识别到 {bulkRows.length} 条货物规格
                  </p>
                  <button
                    onClick={handleBulkImportClear}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <span>✕</span> 清空导入
                  </button>
                </div>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="py-1.5 px-2 text-left text-gray-500">#</th>
                        <th className="py-1.5 px-2 text-gray-500">长(cm)</th>
                        <th className="py-1.5 px-2 text-gray-500">宽(cm)</th>
                        <th className="py-1.5 px-2 text-gray-500">高(cm)</th>
                        <th className="py-1.5 px-2 text-gray-500">件数</th>
                        <th className="py-1.5 px-2 text-gray-500">单件重量</th>
                        <th className="py-1.5 px-2 text-gray-500">单件体积</th>
                        <th className="py-1.5 px-2 text-gray-500">总体积</th>
                        <th className="py-1.5 px-2 text-gray-500">总重量</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkRows.map((row, idx) => {
                        const singleVol = (row.length * row.width * row.height) / 1000000;
                        const totalVol = singleVol * row.quantity;
                        const totalW = row.weight * row.quantity;
                        return (
                          <tr key={row.id} className="border-t border-gray-100">
                            <td className="py-1.5 px-2 text-gray-400">{idx + 1}</td>
                            <td className="py-1.5 px-2">{row.length}</td>
                            <td className="py-1.5 px-2">{row.width}</td>
                            <td className="py-1.5 px-2">{row.height}</td>
                            <td className="py-1.5 px-2">{row.quantity}</td>
                            <td className="py-1.5 px-2">{row.weight > 0 ? `${row.weight} kg` : '—'}</td>
                            <td className="py-1.5 px-2 font-mono text-blue-600">{singleVol.toFixed(4)} m³</td>
                            <td className="py-1.5 px-2 font-mono text-blue-600">{totalVol.toFixed(4)} m³</td>
                            <td className="py-1.5 px-2 font-mono text-green-600">{totalW > 0 ? `${totalW.toFixed(1)} kg` : '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-200">
                      <tr>
                        <td colSpan={4} className="py-1.5 px-2 font-semibold text-gray-700">合计</td>
                        <td className="py-1.5 px-2 font-semibold text-gray-700">{bulkTotalQuantity}</td>
                        <td className="py-1.5 px-2">—</td>
                        <td className="py-1.5 px-2">—</td>
                        <td className="py-1.5 px-2 font-mono font-bold text-blue-700">{bulkTotalVolume.toFixed(4)} m³</td>
                        <td className="py-1.5 px-2 font-mono font-bold text-green-700">{bulkTotalWeight > 0 ? `${bulkTotalWeight.toFixed(1)} kg` : '—'}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 导入后可继续手动编辑上方货物尺寸，两者数据会合并计算。
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Container Type Selector */}
      <div className="mb-6">
        <h3 className={cardStyles.header}>选择集装箱类型</h3>
        <p className="text-sm text-gray-500 mb-4">点击选择柜型，查看装柜计算结果</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {results.map(ct => {
            const isSelected = selectedContainer === ct.name;
            const isRecommended = ct.recommended;
            return (
              <button
                key={ct.name}
                onClick={() => setSelectedContainer(isSelected ? null : ct.name)}
                className={`relative text-left rounded-xl border-2 p-4 transition-all duration-200 ${
                  isSelected
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md ring-2 ring-green-500/20"
                    : isRecommended
                    ? "border-green-300 bg-green-50/50 dark:bg-green-900/10 hover:border-green-400 hover:shadow-sm"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
                }`}
              >
                {/* Badges */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{ct.icon}</span>
                  <div className="flex gap-1">
                    {isRecommended && (
                      <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded text-[10px] font-bold">
                        推荐
                      </span>
                    )}
                    {isSelected && (
                      <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>

                {/* Type Name */}
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{ct.name}</h4>

                {/* Use Case */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-tight line-clamp-2">{ct.useCase}</p>

                {/* Specs */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">内尺寸</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{ct.length}×{ct.width}×{ct.height}m</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">容积</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{ct.volume} m³</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">载重</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{(ct.maxWeight / 1000).toFixed(1)} 吨</span>
                  </div>
                </div>

                {/* Calculation Results (shown when cargo is entered) */}
                {(cargoL && cargoW && cargoH || bulkRows.length > 0) && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">可装</span>
                      <span className="text-sm font-bold text-green-600">{ct.maxItems} 件</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-400">体积占用</span>
                      <span className="text-xs font-medium text-blue-600">{ct.batchVolumeUtil}%</span>
                    </div>
                    {overallQuantity > 0 && (
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-400">可装批次</span>
                        <span className="text-xs font-medium text-orange-600">{ct.batches} 批</span>
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Results (shown when a container is selected or cargo entered) */}
      {(cargoL && cargoW && cargoH || bulkRows.length > 0) && (
        <div className={cardStyles.base + " mb-6"}>
          <h3 className={cardStyles.header.replace("mb-4", "")}>📊 各柜型详细对比</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm mt-3">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-2 font-semibold text-gray-600 dark:text-gray-400">柜型</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-600 dark:text-gray-400">理论可装</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-600 dark:text-gray-400">体积占用</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-600 dark:text-gray-400">重量占用</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-600 dark:text-gray-400">可装批次</th>
                </tr>
              </thead>
              <tbody>
                {results.map(ct => (
                  <tr key={ct.name} className={`border-b border-gray-50 dark:border-gray-800 ${selectedContainer === ct.name ? "bg-green-50 dark:bg-green-900/10" : ""} ${ct.recommended ? "bg-green-50/50 dark:bg-green-900/5" : ""}`}>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <span>{ct.icon}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{ct.name}</span>
                        {ct.recommended && <span className="text-[10px] px-1 py-0.5 bg-green-100 text-green-700 rounded font-bold">推荐</span>}
                      </div>
                    </td>
                    <td className="text-center py-2 px-2 font-bold text-green-600">{ct.maxItems} 件</td>
                    <td className="text-center py-2 px-2 text-blue-600 font-medium">{ct.batchVolumeUtil}%</td>
                    <td className="text-center py-2 px-2 font-medium">{ct.batchWeightUtil}%</td>
                    <td className="text-center py-2 px-2 text-orange-600 font-medium">{ct.batches} 批</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">按体积: 可装件数 = 柜容积 ÷ 单件体积 | 按重量: 可装件数 = 柜限重 ÷ 单件重量</p>
        </div>
      )}

        {/* ==================== 集装箱知识区 ==================== */}
        <div className="mt-8">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>📦</span> 集装箱知识
              </h2>
              <p className="text-blue-100 text-sm mt-1">常见集装箱类型、规格、用途和术语一览</p>
            </div>

            <div className="p-6 space-y-8">
              {/* 1. 集装箱分类 */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-sm">🏷️</span>
                  集装箱分类
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { icon: '📦', name: '干货集装箱 (GP)', desc: '最常见的标准集装箱，适用于一般件杂货' },
                    { icon: '❄️', name: '冷藏集装箱 (RF)', desc: '带有制冷设备，适用于食品、药品等温控货物' },
                    { icon: '🔝', name: '开顶集装箱 (OT)', desc: '无刚性箱顶，适用于超高货物或吊装货物' },
                    { icon: '🏗️', name: '框架集装箱 (FR)', desc: '无箱壁和箱顶，适用于超大、超重、异形货物' },
                    { icon: '🛢️', name: '罐式集装箱 (TK)', desc: '专用罐体，适用于液体、化工品、食品液体' },
                    { icon: '🌬️', name: '通风集装箱', desc: '设有通风口，适用于需要空气流通的货物' },
                    { icon: '🧊', name: '隔热集装箱', desc: '具有隔热层，适用于保温类货物' },
                    { icon: '🚪', name: '双开门集装箱', desc: '两端均有门，方便装卸和分区装载' },
                    { icon: '👗', name: '服装挂衣集装箱', desc: '内设挂衣杆，适用于服装等高附加值货物' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-2xl shrink-0">{item.icon}</span>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 2. 常见规格 */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center text-sm">📐</span>
                  常见规格
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-2 font-semibold text-gray-700">类型</th>
                        <th className="text-left px-4 py-2 font-semibold text-gray-700">内尺寸 (m)</th>
                        <th className="text-left px-4 py-2 font-semibold text-gray-700">容积 (m³)</th>
                        <th className="text-left px-4 py-2 font-semibold text-gray-700">限重 (吨)</th>
                        <th className="text-left px-4 py-2 font-semibold text-gray-700">适用货物</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="px-4 py-2.5 font-semibold text-blue-600">20GP</td>
                        <td className="px-4 py-2.5 text-gray-600">5.90 × 2.35 × 2.39</td>
                        <td className="px-4 py-2.5 text-gray-600">33.2</td>
                        <td className="px-4 py-2.5 text-gray-600">21.8</td>
                        <td className="px-4 py-2.5 text-gray-600">普通普货、小批量</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="px-4 py-2.5 font-semibold text-blue-600">40GP</td>
                        <td className="px-4 py-2.5 text-gray-600">12.03 × 2.35 × 2.39</td>
                        <td className="px-4 py-2.5 text-gray-600">67.7</td>
                        <td className="px-4 py-2.5 text-gray-600">26.7</td>
                        <td className="px-4 py-2.5 text-gray-600">普通普货、大批量</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="px-4 py-2.5 font-semibold text-teal-600">40HC</td>
                        <td className="px-4 py-2.5 text-gray-600">12.03 × 2.35 × 2.69</td>
                        <td className="px-4 py-2.5 text-gray-600">76.3</td>
                        <td className="px-4 py-2.5 text-gray-600">26.5</td>
                        <td className="px-4 py-2.5 text-gray-600">高货、轻泡货</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-semibold text-teal-600">45HC</td>
                        <td className="px-4 py-2.5 text-gray-600">13.56 × 2.35 × 2.69</td>
                        <td className="px-4 py-2.5 text-gray-600">86.1</td>
                        <td className="px-4 py-2.5 text-gray-600">27.7</td>
                        <td className="px-4 py-2.5 text-gray-600">超高货、超大容积需求</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* 图片占位区 - 集装箱规格对比图 */}
                <div className="mt-4 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50">
                  <div className="text-gray-400 text-sm">
                    <span className="text-3xl block mb-2">📊</span>
                    <p className="font-medium text-gray-500">集装箱规格对比图</p>
                    <p className="text-xs mt-1">推荐尺寸：1400 × 1800 px（3:4 比例）</p>
                    <p className="text-xs">格式：webp 或 png · 适合手机阅读 · 中文清晰可读</p>
                  </div>
                </div>
              </section>

              {/* 3. 用途说明 */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center text-sm">🎯</span>
                  选柜指南
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: '📦', title: '普通普货', desc: '20GP 或 40GP，适用于电子产品、日用品、纺织品等标准货物', color: 'bg-blue-50 border-blue-100' },
                    { icon: '📏', title: '高货 / 超高货', desc: '40HC 或 45HC，内部高度多出 30cm，适合家具、大型设备等', color: 'bg-teal-50 border-teal-100' },
                    { icon: '⚖️', title: '重货 / 异形货', desc: '框架柜 (FR) 或开顶柜 (OT)，适合超重、超宽、超高货物', color: 'bg-orange-50 border-orange-100' },
                    { icon: '🧊', title: '食品 / 温控货', desc: '冷藏柜 (RF)，可设定温度范围，适合生鲜、药品、巧克力等', color: 'bg-purple-50 border-purple-100' },
                    { icon: '🛢️', title: '液体 / 化工品', desc: '罐式集装箱 (TK)，符合危险品运输标准，适合液体化学品', color: 'bg-red-50 border-red-100' },
                    { icon: '🏭', title: '大批量出口', desc: '40GP 或 40HC，单位成本最低，适合大批量标准货物', color: 'bg-green-50 border-green-100' },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-start gap-3 p-4 rounded-lg border ${item.color}`}>
                      <span className="text-2xl shrink-0">{item.icon}</span>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-600 mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* 图片占位区 - 类型与用途说明图 */}
                <div className="mt-4 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50">
                  <div className="text-gray-400 text-sm">
                    <span className="text-3xl block mb-2">🗺️</span>
                    <p className="font-medium text-gray-500">集装箱分类与用途说明图</p>
                    <p className="text-xs mt-1">推荐尺寸：1200 × 1800 px（3:4 比例）</p>
                    <p className="text-xs">格式：webp 或 png · 适合手机阅读 · 中文清晰可读</p>
                  </div>
                </div>
              </section>

              {/* 4. 术语说明 */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center text-sm">📖</span>
                  常用术语
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {[
                    { abbr: 'FCL', full: 'Full Container Load', zh: '整柜', desc: '整个集装箱只装一个货主的货物' },
                    { abbr: 'LCL', full: 'Less than Container Load', zh: '拼箱', desc: '多个货主共用一个集装箱' },
                    { abbr: 'GP', full: 'General Purpose', zh: '普通柜', desc: '标准干货集装箱' },
                    { abbr: 'HC / HQ', full: 'High Cube', zh: '高柜', desc: '比标准柜高约 30cm' },
                    { abbr: 'OT', full: 'Open Top', zh: '开顶柜', desc: '无刚性箱顶，方便吊装' },
                    { abbr: 'FR', full: 'Flat Rack', zh: '框架柜', desc: '无箱壁箱顶，适合超大货物' },
                    { abbr: 'RF', full: 'Reefer', zh: '冷藏柜', desc: '带制冷设备的温控集装箱' },
                    { abbr: 'TK', full: 'Tank', zh: '罐式柜', desc: '用于液体、化工品运输' },
                    { abbr: 'CBM', full: 'Cubic Meter', zh: '立方米', desc: '国际物流中常用的体积单位' },
                    { abbr: 'TEU', full: 'Twenty-foot Equivalent Unit', zh: '标准箱', desc: '以 20GP 为标准的计量单位' },
                    { abbr: 'TARE', full: 'Tare Weight', zh: '皮重', desc: '集装箱自身的空重' },
                    { abbr: 'MAX GW', full: 'Maximum Gross Weight', zh: '最大总重', desc: '集装箱允许的最大载货重量' },
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-blue-600">{item.abbr}</span>
                        <span className="text-xs font-medium text-gray-700">{item.zh}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{item.full}</div>
                      <div className="text-xs text-gray-600 mt-1">{item.desc}</div>
                    </div>
                  ))}
                </div>
                {/* 图片占位区 - 集装箱分类图 */}
                <div className="mt-4 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50">
                  <div className="text-gray-400 text-sm">
                    <span className="text-3xl block mb-2">🏷️</span>
                    <p className="font-medium text-gray-500">集装箱分类示意图</p>
                    <p className="text-xs mt-1">推荐尺寸：1200 × 1800 px（3:4 比例）</p>
                    <p className="text-xs">格式：webp 或 png · 适合手机阅读 · 中文清晰可读</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Tool-specific ads */}
        <AdSlot placement="tool-bottom" className="mb-8" />

        {/* Next Steps - Cross Recommendations */}
        <div className="mt-8 p-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📋 下一步推荐</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a href="/tools/shipping-calculator" className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-sm transition-all">
              <span className="text-2xl">🚢</span>
              <div>
                <div className="text-sm font-semibold text-gray-900">运费计算</div>
                <div className="text-xs text-gray-500">估算物流费用</div>
              </div>
            </a>
            <a href="/tools/commercial-invoice" className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-sm transition-all">
              <span className="text-2xl">🧾</span>
              <div>
                <div className="text-sm font-semibold text-gray-900">商业发票</div>
                <div className="text-xs text-gray-500">生成出口单据</div>
              </div>
            </a>
            <a href="/tools/documents/packing-list" className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-sm transition-all">
              <span className="text-2xl">📦</span>
              <div>
                <div className="text-sm font-semibold text-gray-900">装箱单</div>
                <div className="text-xs text-gray-500">Packing List</div>
              </div>
            </a>
            <a href="/tools/documents/container-loading-list" className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-sm transition-all">
              <span className="text-2xl">📋</span>
              <div>
                <div className="text-sm font-semibold text-gray-900">装柜明细</div>
                <div className="text-xs text-gray-500">Container Loading List</div>
              </div>
            </a>
          </div>
        </div>

        {/* FAQ */}
        <FAQSection title="集装箱计算常见问题" items={[
          { question: "什么是 CBM？", answer: "CBM（Cubic Meter）是立方米，国际物流中常用的体积单位。1 CBM = 1 立方米。集装箱的载货容积通常以 CBM 表示。" },
          { question: "20GP、40GP、40HQ 有什么区别？", answer: "20GP 是 20 英尺标准柜（约 33 CBM），40GP 是 40 英尺标准柜（约 67 CBM），40HQ 是 40 英尺高柜（约 76 CBM）。" },
          { question: "为什么实际装货量通常低于理论容积？", answer: "因为货物包装不规则、间隙、托盘占用空间等原因，实际装货量通常为理论容积的 80-90%。建议预留 10-15% 的空间余量。" },
        ]} />
    </div>
  );
}
