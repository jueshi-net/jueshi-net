"use client";
import { useState } from "react";
import { Container, Info } from "lucide-react";
import { AdSlot } from "@/components/ad-slot";
import { FAQSection } from "@/components/faq-section";
import { Breadcrumb } from "@/components/breadcrumb";
import { buttonVariants, inputStyles, cardStyles, labelStyles } from "@/lib/ui-styles";

const containerTypes = [
  { name: "20GP", length: 5.9, width: 2.35, height: 2.39, volume: 33.2, maxWeight: 21770 },
  { name: "40GP", length: 12.03, width: 2.35, height: 2.39, volume: 67.7, maxWeight: 26680 },
  { name: "40HC", length: 12.03, width: 2.35, height: 2.69, volume: 76.3, maxWeight: 26480 },
  { name: "45HC", length: 13.56, width: 2.35, height: 2.69, volume: 86.1, maxWeight: 27700 },
];

export default function ContainerCalculatorPage() {
  const [cargoL, setCargoL] = useState(0);
  const [cargoW, setCargoW] = useState(0);
  const [cargoH, setCargoH] = useState(0);
  const [cargoWeight, setCargoWeight] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const cargoVolume = (cargoL * cargoW * cargoH * quantity) / 1000000; // m³
  const totalWeight = cargoWeight * quantity;

  const results = containerTypes.map(ct => {
    const fitByVolume = Math.floor(ct.volume / (cargoVolume || 1));
    const fitByWeight = Math.floor(ct.maxWeight / (totalWeight || 1));
    const fitCount = Math.min(fitByVolume, fitByWeight);
    const utilization = cargoVolume > 0 ? ((cargoVolume * quantity) / ct.volume * 100).toFixed(1) : "0";

    return {
      ...ct,
      canFit: fitCount,
      volumeUtilization: utilization,
      weightUtilization: totalWeight > 0 ? ((totalWeight) / ct.maxWeight * 100).toFixed(1) : "0",
      recommended: fitCount > 0 && parseFloat(utilization) > 50 && parseFloat(utilization) < 95
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
        <h3 className={cardStyles.header}>货物尺寸 (cm)</h3>
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
            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
              <Info className="w-4 h-4" />
              <span>单件体积: {(cargoL * cargoW * cargoH / 1000000).toFixed(4)} m³ | 总体积: {cargoVolume.toFixed(4)} m³ | 总重量: {totalWeight.toFixed(1)} kg</span>
            </div>
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
                <span className="text-gray-500">可装</span>
                <span className="text-lg font-bold text-blue-600">{ct.canFit} 件</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">体积利用率</span>
                <span className="font-medium">{ct.volumeUtilization}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">重量利用率</span>
                <span className="font-medium">{ct.weightUtilization}%</span>
              </div>
            </div>
          </div>
        ))}

        {/* Tool-specific ads */}
        <AdSlot placement="tool-bottom" className="mb-8" />

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
