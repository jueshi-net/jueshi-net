"use client";
import { useState } from "react";
import { Container, Info } from "lucide-react";

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
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">货物尺寸 (cm)</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">长 (cm)</label>
            <input type="number" value={cargoL || ""} onChange={e => setCargoL(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">宽 (cm)</label>
            <input type="number" value={cargoW || ""} onChange={e => setCargoW(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">高 (cm)</label>
            <input type="number" value={cargoH || ""} onChange={e => setCargoH(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">单件重量 (kg)</label>
            <input type="number" value={cargoWeight || ""} onChange={e => setCargoWeight(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">数量</label>
            <input type="number" value={quantity || ""} onChange={e => setQuantity(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
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
            className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-5 transition-all ${
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
      </div>
    </div>
  );
}
