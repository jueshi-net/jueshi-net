'use client';

import { useState } from 'react';
import { Calculator, Info, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { RelatedGuidesSection } from '@/components/related-guides-section';

interface EstimatorForm {
  country: string;
  province: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  cargoType: string;
  doorToDoor: boolean;
}

interface Result {
  actualWeight: number;
  volume: number;
  volumetricWeight: number;
  chargeableWeight: number;
  cbm: number;
  expressPrice: string;
  airPrice: string;
  seaPrice: string;
}

const countryParams: Record<string, { express: [number, number]; air: [number, number]; sea: [number, number]; }> = {
  '加拿大': { express: [85, 35], air: [55, 25], sea: [15, 5] },
  '美国': { express: [90, 40], air: [60, 28], sea: [18, 6] },
  '澳大利亚': { express: [95, 45], air: [65, 30], sea: [20, 7] },
  '英国': { express: [100, 48], air: [70, 32], sea: [22, 8] },
  '新西兰': { express: [110, 50], air: [75, 35], sea: [25, 9] },
};

export default function ShippingEstimatorPage() {
  const [form, setForm] = useState<EstimatorForm>({
    country: '加拿大', province: '', weight: '', length: '', width: '', height: '', cargoType: '普通货', doorToDoor: false,
  });
  const [result, setResult] = useState<Result | null>(null);
  const [calcSteps, setCalcSteps] = useState<string[]>([]);

  const update = (key: keyof EstimatorForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const w = parseFloat(form.weight) || 0;
    const l = parseFloat(form.length) || 0;
    const w2 = parseFloat(form.width) || 0;
    const h = parseFloat(form.height) || 0;

    if (w <= 0 || l <= 0 || w2 <= 0 || h <= 0) return;

    const steps: string[] = [];
    const volume = l * w2 * h; // cm³
    steps.push(`体积 = 长 × 宽 × 高 = ${l} × ${w2} × ${h} = ${volume.toLocaleString()} cm³`);

    const cbm = volume / 1_000_000;
    steps.push(`CBM（立方米）= ${volume.toLocaleString()} ÷ 1,000,000 = ${cbm.toFixed(6)} m³`);

    const volumetricExpress = volume / 5000;
    steps.push(`快递体积重 = 体积 ÷ 5000 = ${volumetricExpress.toFixed(2)} kg（国际快递除数通常为 5000）`);

    const volumetricAir = volume / 6000;
    steps.push(`空运体积重 = 体积 ÷ 6000 = ${volumetricAir.toFixed(2)} kg（空运除数通常为 6000）`);

    steps.push(`实际重量 = ${w} kg`);
    steps.push(`计费重 = MAX(实际重量, 体积重)`);

    const chargeableExpress = Math.max(w, volumetricExpress);
    const chargeableAir = Math.max(w, volumetricAir);

    const params = countryParams[form.country];
    if (!params) return;

    const [baseExpress, perExpress] = params.express;
    const [baseAir, perAir] = params.air;
    const [baseSea, perSea] = params.sea;

    const expressCost = baseExpress + chargeableExpress * perExpress;
    const airCost = baseAir + chargeableAir * perAir;
    const seaCost = Math.max(baseSea, cbm * 100) + perSea * chargeableAir;

    setResult({
      actualWeight: w, volume, volumetricWeight: Math.round(volumetricExpress * 100) / 100,
      chargeableWeight: Math.round(chargeableExpress * 100) / 100, cbm: Math.round(cbm * 1000000) / 1000000,
      expressPrice: `¥${expressCost.toFixed(0)} ~ ¥${(expressCost * 1.2).toFixed(0)}`,
      airPrice: `¥${airCost.toFixed(0)} ~ ¥${(airCost * 1.2).toFixed(0)}`,
      seaPrice: `¥${seaCost.toFixed(0)} ~ ¥${(seaCost * 1.5).toFixed(0)}`,
    });
    setCalcSteps(steps);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">体积重与运费估算器</h1>
          <p className="text-lg text-green-100">理解体积重、计费重和费用构成 — 本工具仅供参考</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-16">
        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-amber-800 dark:text-amber-300 text-sm">
            <strong>本工具仅用于理解体积重、计费重和费用构成，不代表任何物流公司的实际报价。</strong>
            不同服务商的计费标准、渠道价格和操作费各不相同，实际费用请以您选择的服务商报价为准。
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Form */}
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">包裹信息</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">目的地国家</label>
                  <select className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={form.country} onChange={e => update('country', e.target.value)}>
                    {Object.keys(countryParams).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">省份/州</label>
                  <input className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="如：安大略省" value={form.province} onChange={e => update('province', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">实际重量 (kg)</label>
                <input type="number" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="如：5.0" value={form.weight} onChange={e => update('weight', e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">尺寸 (cm)</label>
                <div className="grid grid-cols-3 gap-3">
                  <input type="number" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="长" value={form.length} onChange={e => update('length', e.target.value)} />
                  <input type="number" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="宽" value={form.width} onChange={e => update('width', e.target.value)} />
                  <input type="number" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="高" value={form.height} onChange={e => update('height', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">货物类型</label>
                  <select className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={form.cargoType} onChange={e => update('cargoType', e.target.value)}>
                    <option>普通货</option><option>敏感货（食品/化妆品）</option><option>带电产品</option><option>品牌商品</option>
                  </select>
                </div>
                <div className="flex items-center pt-6">
                  <input type="checkbox" id="door" className="w-4 h-4"
                    checked={form.doorToDoor} onChange={e => update('doorToDoor', e.target.checked)} />
                  <label htmlFor="door" className="ml-2 text-sm text-gray-600 dark:text-gray-300">需要送货上门</label>
                </div>
              </div>

              <button onClick={calculate}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors">
                <Calculator className="w-5 h-5" /> 计算体积重与估算
              </button>
            </div>

            {/* Result */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">计算结果</h2>

              {!result ? (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border-2 border-dashed border-gray-200 dark:border-gray-600 flex flex-col items-center justify-center text-center min-h-[300px]">
                  <Calculator className="w-12 h-12 text-gray-300 dark:text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">填写信息后点击计算</h3>
                  <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">系统将为您计算体积重、计费重、CBM，并展示费用区间参考</p>
                </div>
              ) : (
                <>
                  {/* Weight breakdown */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">重量明细</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">实际重量</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{result.actualWeight} kg</p>
                      </div>
                      <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">体积重（快递）</p>
                        <p className="text-xl font-bold text-blue-600">{result.volumetricWeight} kg</p>
                      </div>
                      <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">计费重</p>
                        <p className="text-xl font-bold text-green-600">{result.chargeableWeight} kg</p>
                      </div>
                      <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">CBM（体积）</p>
                        <p className="text-xl font-bold text-purple-600">{result.cbm.toFixed(4)} m³</p>
                      </div>
                    </div>
                    {result.actualWeight < result.volumetricWeight && (
                      <p className="text-sm text-orange-600 dark:text-orange-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> 您的包裹体积重大于实重，将按体积重计费（泡货）
                      </p>
                    )}
                  </div>

                  {/* Price estimate */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">费用估算示意（{form.country}）</h3>
                    <div className="space-y-2">
                      {[
                        { label: "📦 国际快递（DHL/FedEx/UPS）", price: result.expressPrice, note: "时效 5-10 工作日，适合小件急件" },
                        { label: "✈️ 空运专线", price: result.airPrice, note: "时效 10-20 工作日，性价比较高" },
                        { label: "🚢 海运/拼箱", price: result.seaPrice, note: "时效 30-50 工作日，适合大件重货" },
                      ].map((m, i) => (
                        <div key={i} className="flex items-center justify-between bg-white dark:bg-gray-600 rounded-lg p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{m.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{m.note}</p>
                          </div>
                          <p className="text-sm font-bold text-green-600 whitespace-nowrap">{m.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price factors */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> 影响实际价格的因素
                    </h3>
                    <div className="grid grid-cols-2 gap-1 text-xs text-amber-700 dark:text-amber-400">
                      <p>• 服务商定价策略</p>
                      <p>• 渠道类型（快递/空运/海运）</p>
                      <p>• 目的地和派送区域</p>
                      <p>• 偏远地区附加费</p>
                      <p>• 燃油附加费波动</p>
                      <p>• 货物属性（敏感/带电/品牌）</p>
                      <p>• 旺季附加费</p>
                      <p>• 操作费/取件费</p>
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
                      以上估算基于参考参数，不代表任何物流公司的实际报价。
                    </p>
                  </div>

                  {/* Calculation steps */}
                  <details className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <summary className="p-4 cursor-pointer text-sm font-medium text-blue-800 dark:text-blue-300">
                      查看计算过程
                    </summary>
                    <div className="px-4 pb-4 space-y-1">
                      {calcSteps.map((s, i) => (
                        <p key={i} className="text-xs text-blue-700 dark:text-blue-400 font-mono">{s}</p>
                      ))}
                    </div>
                  </details>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Billing differences explanation */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            不同运输方式的计费差异
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: "📦 国际快递", body: "体积重除数通常为 <strong>5000</strong>（长×宽×高÷5000）。对轻泡货（体积大重量轻）收费较高。首重一般 0.5kg，续重 0.5kg 递增。", color: "border-l-blue-500" },
              { title: "✈️ 空运专线", body: "体积重除数通常为 <strong>6000</strong>，比快递略宽松。部分渠道按 1:1 计费（实重和体积重哪个大取哪个）。首重多为 1kg。", color: "border-l-green-500" },
              { title: "🚢 海运", body: "通常按 <strong>CBM（立方米）</strong>计费，重货可能按吨计费。起运量一般 1CBM 起。时效慢但单价最低，适合大件家具、大批量货物。", color: "border-l-purple-500" },
            ].map((m, i) => (
              <div key={i} className={`border-l-4 ${m.color} bg-gray-50 dark:bg-gray-700 rounded-r-lg p-4`}>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{m.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: m.body }} />
              </div>
            ))}
          </div>
        </div>

        {/* Pre-shipment checklist */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            发货前应确认的信息清单
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              "服务商是否支持寄送此类货物",
              "实际报价与估算差异的原因（燃油费/操作费等）",
              "是否收取额外费用（操作费/取件费/偏远附加费）",
              "包裹保险/保价服务及费用",
              "预计时效（工作日还是自然日）",
              "目的国海关关税起征点和可能产生的税费",
              "退货或异常件处理流程",
              "是否提供取件服务及取件费用",
            ].map((item, i) => (
              <label key={i} className="flex items-start gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                <input type="checkbox" className="w-4 h-4 mt-0.5 text-green-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Final disclaimer */}
        <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-300">
            <strong>仅供估算提示：</strong>本工具基于行业常见计费规则进行估算，价格区间仅供参考。
            实际运费受燃油附加费、汇率波动、促销活动、特殊渠道等多种因素影响，可能与估算有较大差异。
            请在发货前向您的物流服务商获取准确报价。
          </p>
        </div>

        <RelatedGuidesSection slugs={["volumetric-weight-explained", "cbm-shipping-volume-calculator", "how-to-evaluate-shipping-quote"]} />
      </div>
    </div>
  );
}
