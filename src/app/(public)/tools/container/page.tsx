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

        {/* ==================== 集装箱知识区 ==================== */}
        <div className="col-span-full mt-8">
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
