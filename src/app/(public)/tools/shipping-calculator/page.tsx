'use client';

import { useState } from 'react';
import { Calculator, ArrowRight, Info, Package, Scale, Globe } from 'lucide-react';

interface ShippingRate {
  carrier: string;
  service: string;
  price: number;
  days: string;
  features: string[];
}

export default function ShippingCalculator() {
  const [form, setForm] = useState({
    origin: 'CN',
    destination: 'US',
    weight: 1,
    weightUnit: 'kg',
    length: 0,
    width: 0,
    height: 0,
    dimensionUnit: 'cm',
    category: 'general'
  });
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [calculating, setCalculating] = useState(false);

  const countries = [
    { code: 'CN', name: '中国' },
    { code: 'US', name: '美国' },
    { code: 'UK', name: '英国' },
    { code: 'DE', name: '德国' },
    { code: 'JP', name: '日本' },
    { code: 'AU', name: '澳大利亚' },
    { code: 'CA', name: '加拿大' },
    { code: 'FR', name: '法国' },
    { code: 'KR', name: '韩国' },
    { code: 'SG', name: '新加坡' },
  ];

  const categories = [
    { value: 'general', label: '普通货物' },
    { value: 'sensitive', label: '敏感货物' },
    { value: 'battery', label: '带电产品' },
    { value: 'liquid', label: '液体/粉末' },
    { value: 'brand', label: '品牌货物' },
  ];

  const calculateRates = () => {
    setCalculating(true);
    
    // Simulate calculation
    setTimeout(() => {
      const baseRates: ShippingRate[] = [
        {
          carrier: 'DHL Express',
          service: '快递',
          price: 185,
          days: '3-5 天',
          features: ['门到门', '实时追踪', '含税']
        },
        {
          carrier: 'FedEx IP',
          service: '国际优先',
          price: 165,
          days: '4-6 天',
          features: ['门到门', '实时追踪']
        },
        {
          carrier: 'UPS Expedited',
          service: '加急',
          price: 155,
          days: '5-7 天',
          features: ['门到门', '保险']
        },
        {
          carrier: '海运专线',
          service: '海运',
          price: 45,
          days: '25-35 天',
          features: ['经济实惠', '大宗优惠']
        },
        {
          carrier: '空运专线',
          service: '空派',
          price: 75,
          days: '8-12 天',
          features: ['性价比高', '包税']
        },
        {
          carrier: '铁路专线',
          service: '铁派',
          price: 55,
          days: '18-25 天',
          features: ['稳定可靠', '环保']
        },
      ];

      // Adjust based on weight
      const weightFactor = form.weight > 10 ? 0.85 : form.weight > 5 ? 0.9 : 1;
      const adjustedRates = baseRates.map(rate => ({
        ...rate,
        price: Math.round(rate.price * form.weight * weightFactor)
      }));

      setRates(adjustedRates.sort((a, b) => a.price - b.price));
      setCalculating(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Package className="w-8 h-8 text-blue-500" />
            运费计算器
          </h1>
          <p className="text-gray-500 mt-2">比较多家物流商价格，找到最优运输方案</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-500" />
              包裹信息
            </h2>

            <div className="space-y-4">
              {/* Origin/Destination */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">始发地</label>
                  <select
                    value={form.origin}
                    onChange={(e) => setForm(prev => ({ ...prev, origin: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {countries.map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">目的地</label>
                  <select
                    value={form.destination}
                    onChange={(e) => setForm(prev => ({ ...prev, destination: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {countries.filter(c => c.code !== form.origin).map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Scale className="w-4 h-4 inline mr-1" />
                  重量
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(e) => setForm(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0.1"
                    step="0.1"
                  />
                  <select
                    value={form.weightUnit}
                    onChange={(e) => setForm(prev => ({ ...prev, weightUnit: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  >
                    <option value="kg">KG</option>
                    <option value="lb">LB</option>
                  </select>
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">尺寸 (可选)</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="长"
                    value={form.length || ''}
                    onChange={(e) => setForm(prev => ({ ...prev, length: parseFloat(e.target.value) || 0 }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="宽"
                    value={form.width || ''}
                    onChange={(e) => setForm(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="高"
                    value={form.height || ''}
                    onChange={(e) => setForm(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Globe className="w-4 h-4 inline mr-1" />
                  货物类型
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Calculate Button */}
              <button
                onClick={calculateRates}
                disabled={calculating || form.weight <= 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {calculating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    计算中...
                  </>
                ) : (
                  <>
                    <Calculator className="w-5 h-5" />
                    查询运费
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            {rates.length === 0 && !calculating && (
              <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500">输入包裹信息后点击查询</h3>
                <p className="text-gray-400 mt-2">支持 DHL、FedEx、UPS、海运、空运等多种渠道</p>
              </div>
            )}

            {calculating && (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="h-6 bg-gray-200 rounded w-32"></div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="mt-4 h-4 bg-gray-200 rounded w-48"></div>
                  </div>
                ))}
              </div>
            )}

            {rates.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    找到 {rates.length} 个报价方案
                  </h3>
                  <span className="text-sm text-gray-500">按价格从低到高排序</span>
                </div>

                <div className="space-y-3">
                  {rates.map((rate, i) => (
                    <div 
                      key={i} 
                      className={`bg-white rounded-xl p-5 shadow-sm border transition-all hover:shadow-md ${
                        i === 0 ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-semibold text-gray-900">{rate.carrier}</h4>
                            {i === 0 && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                                最优惠
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{rate.service} · {rate.days}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            ¥{rate.price}
                          </div>
                          <div className="text-sm text-gray-400">
                            ¥{(rate.price / form.weight).toFixed(2)}/{form.weightUnit}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                        {rate.features.map((feature, fi) => (
                          <span key={fi} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                            {feature}
                          </span>
                        ))}
                        <button className="ml-auto px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                          选择此方案
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">计费说明</h4>
              <ul className="mt-2 space-y-1 text-sm text-blue-800">
                <li>• 实际价格可能因燃油附加费、旺季附加费等因素有所变动</li>
                <li>• 体积重量 = 长 × 宽 × 高 / 5000 (cm³/kg)</li>
                <li>• 计费重量取实际重量与体积重量较大者</li>
                <li>• 建议联系物流商获取精确报价</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
