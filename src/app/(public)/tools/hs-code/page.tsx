'use client';

import { useState } from 'react';
import { Search, Package, Filter, Info, ExternalLink, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { RelatedGuidesSection } from '@/components/related-guides-section';
import { commonProducts } from '@/lib/data/product-declarations';
import type { ProductDecl } from '@/lib/data/product-declarations';

const labelMap: Record<string, string> = {
  'normal': '普通货参考',
  'needs-confirm': '需确认属性',
  'high-risk': '高风险合规确认',
  'restricted': '明显受限 / 高管制风险',
};

export default function HSCodePage() {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterRisk, setFilterRisk] = useState('all');

  const filtered = commonProducts.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q) || p.aliases.some(a => a.toLowerCase().includes(q));
    const matchRisk = filterRisk === 'all' || p.riskLevel === filterRisk;
    return matchSearch && matchRisk;
  });

  const getRiskColor = (risk: string) => {
    const map: Record<string, string> = {
      normal: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'needs-confirm': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      'high-risk': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      restricted: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    };
    return map[risk] || map.normal;
  };

  const getRiskEmoji = (risk: string) => {
    const map: Record<string, string> = { normal: '🟢', 'needs-confirm': '🟡', 'high-risk': '🟠', restricted: '🔴' };
    return map[risk] || '🟢';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">商品申报名称参考</h1>
          <p className="text-lg text-teal-100">常见商品英文申报名、HS编码候选、申报注意事项速查</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-16">
        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>HS编码仅供辅助查询，最终以海关、报关行或官方税则为准。</strong>
            本工具列出的编码为常见候选，实际归类需结合商品材质、用途、加工工艺等综合判断。
            各国可在6位HS编码基础上扩展至8-10位。
          </p>
        </div>

        {/* Risk level disclaimer */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 mb-4">
          <p className="text-xs text-blue-700 dark:text-blue-400">
            风险等级仅供跨境寄送和申报准备参考，不代表任何物流服务商、海关或报关行的最终判断。
          </p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input className="w-full pl-10 pr-4 py-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="搜索商品名称（中文/英文/别名）..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)}
              className="px-4 py-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="all">全部商品</option>
              <option value="normal">仅普通货参考</option>
              <option value="needs-confirm">仅需要确认属性</option>
              <option value="high-risk">仅高风险合规</option>
              <option value="restricted">仅受限/禁止风险</option>
            </select>
          </div>
          <p className="text-xs text-gray-400 mt-2">共 {commonProducts.length} 个常用商品，当前显示 {filtered.length} 个</p>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {filtered.map((p, i) => {
            const id = `product-${i}`;
            const isExpanded = expandedId === id;
            return (
              <div key={id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
                  onClick={() => setExpandedId(isExpanded ? null : id)}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg">{getRiskEmoji(p.riskLevel)}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white">{p.name}</p>
                      <p className="text-xs text-gray-400 truncate">{p.nameEn}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRiskColor(p.riskLevel)}`}>
                      {labelMap[p.riskLevel]}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-5 pb-5 border-t dark:border-gray-700 pt-4 space-y-3">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">别名</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{p.aliases.join(' / ')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">英文申报名</p>
                        <p className="text-sm font-mono text-blue-600 dark:text-blue-400">{p.nameEn}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">材质</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{p.material}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">用途</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{p.usage}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">HS 候选编码</p>
                      <div className="flex flex-wrap gap-2">
                        {p.hsCandidates.map((h, j) => (
                          <span key={j} className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-mono rounded-md">{h}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">申报注意事项</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">{p.notes}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <a href={p.officialUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 hover:text-green-700">
                        <ExternalLink className="w-3 h-3" /> 前往官方税则核验
                      </a>
                      {p.thirdPartyUrl && (
                        <a href={p.thirdPartyUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-600">
                          <ExternalLink className="w-3 h-3" /> 第三方参考入口
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">未找到匹配的商品，试试其他关键词</p>
          </div>
        )}

        {/* Government sources */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl border p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-green-600" />
            各国官方 HS 编码查询入口
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "中国海关总署", url: "https://www.customs.gov.cn", label: "中国税则查询" },
              { name: "中国国际贸易单一窗口", url: "https://www.singlewindow.cn", label: "报关查询" },
              { name: "美国 USITC HTS", url: "https://hts.usitc.gov/", label: "Harmonized Tariff Schedule" },
              { name: "加拿大 CBSA", url: "https://www.cbsa-asfc.gc.ca/trade-commerce/tariff-tarif/2024/html-eng.html", label: "Customs Tariff" },
              { name: "英国 Trade Tariff", url: "https://www.trade-tariff.service.gov.uk/", label: "UK Trade Tariff" },
              { name: "欧盟 TARIC", url: "https://ec.europa.eu/taxation_customs/dds2/taric/taric_consultation.jsp?Lang=en", label: "TARIC Database" },
            ].map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Source info */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">📚 数据来源与说明</h3>
          <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div><p className="font-medium">来源</p><p>常用商品申报经验汇总</p></div>
            <div><p className="font-medium">版本</p><p>2026 年 HS 编码体系</p></div>
            <div><p className="font-medium">更新</p><p>随海关税则调整持续更新</p></div>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
            第三方查询（如 hscode.net）仅供快速参考，最终以目的国海关、报关行或官方税则为准。
          </p>
        </div>

        <RelatedGuidesSection slugs={["hs-code-beginner-guide", "commercial-invoice-how-to-fill"]} />
      </div>
    </div>
  );
}
