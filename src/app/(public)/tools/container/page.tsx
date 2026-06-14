"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Info } from "lucide-react";
import { AdSlot } from "@/components/ad-slot";
import { FAQSection } from "@/components/faq-section";
import { Breadcrumb } from "@/components/breadcrumb";
import { buttonVariants, inputStyles, cardStyles, labelStyles } from "@/lib/ui-styles";
import { saveContainerToShipping } from "@/lib/container-shipping-transfer";

const containerTypes = [
  { name: "20GP", length: 5.9, width: 2.35, height: 2.39, volume: 33.2, maxWeight: 21770 },
  { name: "40GP", length: 12.03, width: 2.35, height: 2.39, volume: 67.7, maxWeight: 26680 },
  { name: "40HC", length: 12.03, width: 2.35, height: 2.69, volume: 76.3, maxWeight: 26480 },
  { name: "45HC", length: 13.56, width: 2.35, height: 2.69, volume: 86.1, maxWeight: 27700 },
];

export default function ContainerCalculatorPage() {
  const router = useRouter();
  const [cargoL, setCargoL] = useState(0);
  const [cargoW, setCargoW] = useState(0);
  const [cargoH, setCargoH] = useState(0);
  const [cargoWeight, setCargoWeight] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // 单件体积 (m³)
  const singleVolume = (cargoL * cargoW * cargoH) / 1000000;
  // 当前批次总体积 (m³)
  const totalVolume = singleVolume * quantity;
  // 当前批次总重量 (kg)
  const totalWeight = cargoWeight * quantity;

  const handleFillExample = () => {
    setCargoL(60);
    setCargoW(40);
    setCargoH(50);
    setCargoWeight(15);
    setQuantity(100);
  };

  // 处理"带入运费计算"按钮点击
  const handleTransferToShipping = () => {
    // 找到推荐的集装箱类型（如果有）
    const recommended = results.find(ct => ct.recommended);
    const suggestedContainer = recommended?.name || '20GP';
    const utilizationRate = recommended ? parseFloat(recommended.batchVolumeUtil) : 0;
    const maxUnits = recommended?.maxItems || 0;
    const batchCount = recommended?.batches || 0;

    const payload = {
      quantity,
      unitLengthCm: cargoL,
      unitWidthCm: cargoW,
      unitHeightCm: cargoH,
      unitWeightKg: cargoWeight,
      totalCbm: totalVolume,
      totalWeightKg: totalWeight,
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

  const results = containerTypes.map(ct => {
    // 当前批次占柜容体积比例
    const batchVolumeUtil = totalVolume > 0 ? (totalVolume / ct.volume * 100) : 0;
    // 当前批次占柜限重比例
    const batchWeightUtil = totalWeight > 0 ? (totalWeight / ct.maxWeight * 100) : 0;
    
    // 理论可装件数（按体积，单件）
    const maxItemsByVolume = singleVolume > 0 ? Math.floor(ct.volume / singleVolume) : 0;
    // 理论可装件数（按重量，单件）
    const maxItemsByWeight = cargoWeight > 0 ? Math.floor(ct.maxWeight / cargoWeight) : 0;
    // 实际可装件数（取较小值）
    const maxItems = Math.min(maxItemsByVolume, maxItemsByWeight);
    
    // 当前批次可装几批（按体积）
    const batchesByVolume = totalVolume > 0 ? Math.floor(ct.volume / totalVolume) : 0;
    // 当前批次可装几批（按重量）
    const batchesByWeight = totalWeight > 0 ? Math.floor(ct.maxWeight / totalWeight) : 0;
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
    <div className="max-w-5xl mx-auto py-8 px-4">
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
        {cargoL && cargoW && cargoH && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 mb-2">
              <Info className="w-4 h-4" />
              <span>当前货物：{quantity} 件，共 {totalVolume.toFixed(4)} CBM，约 {totalWeight.toFixed(1)} kg</span>
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              <p className="font-medium mb-1">💡 计算说明：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>单件体积 = 长 × 宽 × 高 ÷ 1,000,000 = {singleVolume.toFixed(4)} m³</li>
                <li>当前批次总体积 = 单件体积 × 数量 = {totalVolume.toFixed(4)} m³</li>
                <li>当前批次总重量 = 单件重量 × 数量 = {totalWeight.toFixed(1)} kg</li>
                <li>理论可装件数 = min(柜容积 ÷ 单件体积, 柜限重 ÷ 单件重量)</li>
                <li>可装批次数 = 理论可装件数 ÷ 当前数量</li>
                <li className="text-orange-600 dark:text-orange-400 font-medium">⚠️ 以上仅为体积/重量粗算，实际装柜受托盘、包装、货物形状、堆叠方式和限重影响</li>
              </ul>
            </div>
            
            {/* 带入运费计算按钮 */}
            {totalVolume > 0 && totalWeight > 0 && (
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
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {results.map(ct => (
          <div
            key={ct.name}
            className={`${cardStyles.base.replace("p-5", "")} border-2 transition-all 
              ct.recommended ? "border-green-500 shadow-lg" : "border-gray-100 dark:border-gray-700"
            }`}
          >
            {ct.recommended && (
              <div className="mb-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium inline-block">
                推荐
              </div>
            )}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{ct.name}</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">内尺寸</span>
                <span className="text-gray-900 dark:text-gray-100">{ct.length}×{ct.width}×{ct.height}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">容积</span>
                <span className="text-gray-900 dark:text-gray-100">{ct.volume} m³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">限重</span>
                <span className="text-gray-900 dark:text-gray-100">{(ct.maxWeight / 1000).toFixed(1)} 吨</span>
              </div>
              <hr className="dark:border-gray-700" />
              <div className="flex justify-between">
                <span className="text-gray-500">当前批次占体积</span>
                <span className="font-medium text-blue-600">{ct.batchVolumeUtil}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">当前批次占重量</span>
                <span className="font-medium">{ct.batchWeightUtil}%</span>
              </div>
              <hr className="dark:border-gray-700" />
              <div className="flex justify-between">
                <span className="text-gray-500">理论可装</span>
                <span className="text-lg font-bold text-green-600">{ct.maxItems} 件</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                按体积: {ct.maxItemsByVolume} 件 | 按重量: {ct.maxItemsByWeight} 件
              </div>
              {quantity > 0 && (
                <div className="flex justify-between mt-1">
                  <span className="text-gray-500">可装同等批次</span>
                  <span className="font-medium text-orange-600">{ct.batches} 批</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Tool-specific ads */}
        <AdSlot placement="tool-bottom" className="mb-8" />

        {/* Next Steps - Cross Recommendations */}
        <div className="col-span-full mt-8 p-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-200">
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
    </div>
  );
}
