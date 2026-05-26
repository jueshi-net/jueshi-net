'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Package, Filter, Info, ExternalLink, ChevronDown, ChevronUp, AlertCircle, Download, ListOrdered, FileText } from 'lucide-react';
import { RelatedGuidesSection } from '@/components/related-guides-section';
import { FAQSection } from '@/components/faq-section';
import { AdSlot } from '@/components/ad-slot';
import { Breadcrumb } from '@/components/breadcrumb';
import { buttonVariants, inputStyles, cardStyles, labelStyles } from "@/lib/ui-styles";
import { trackEvent } from '@/lib/analytics';
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
  const [batchMode, setBatchMode] = useState(false);
  const [batchInput, setBatchInput] = useState('');

  // Auto-trigger from URL param (e.g. ?q=手机壳 from homepage search)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      setSearch(q);
    }
  }, []);

  // CSV export: download filtered results as CSV
  const exportCSV = () => {
    const headers = '中文品名,英文申报名,HS候选编码,风险等级,材质,用途,申报注意\n';
    const rows = filtered.map(p =>
      `"${p.name}","${p.nameEn}","${p.hsCandidates.join('; ')}","${labelMap[p.riskLevel]}","${p.material}","${p.usage}","${p.notes.replace(/"/g, '""')}"`
    ).join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hs-codes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    trackEvent.custom('hs-code', 'export_csv');
  };

  // Batch query: split input by lines/newlines, find matches for each
  const batchResults = useMemo(() => {
    if (!batchMode || !batchInput.trim()) return [];
    const queries = batchInput.split(/[\n,，;；]+/).map(s => s.trim()).filter(Boolean);
    return queries.map(q => {
      const ql = q.toLowerCase();
      const matches = commonProducts.filter(p =>
        p.name.toLowerCase().includes(ql) ||
        p.nameEn.toLowerCase().includes(ql) ||
        p.aliases.some(a => a.toLowerCase().includes(ql))
      );
      return { query: q, matches, count: matches.length };
    });
  }, [batchMode, batchInput]);

  const batchTotal = batchResults.reduce((sum, r) => sum + r.count, 0);

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
          <h1 className="text-3xl md:text-4xl font-bold mb-4">全球海关HS编码查询系统</h1>
          <p className="text-lg text-teal-100">常见商品英文申报名、HS编码候选、申报注意事项速查</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-16">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb />
        </div>
        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4">
          <p className="text-sm text-amber-800 dark:text-amber-300">
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
        <div className={cardStyles.base + " mb-6"}>
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input className={inputStyles + " pl-10"}
                placeholder="搜索商品名称（中文/英文/别名）..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)}
              className={inputStyles}>
              <option value="all">全部商品</option>
              <option value="normal">仅普通货参考</option>
              <option value="needs-confirm">仅需要确认属性</option>
              <option value="high-risk">仅高风险合规</option>
              <option value="restricted">仅受限/禁止风险</option>
            </select>
            <button onClick={() => { setBatchMode(!batchMode); trackEvent.custom('hs-code', 'toggle_batch'); }}
              className={`flex items-center gap-2 transition-colors rounded-lg ${batchMode ? buttonVariants.primary : buttonVariants.secondary}`}>
              <ListOrdered className="w-4 h-4" /> 批量查询
            </button>
            <button onClick={exportCSV}
              className={buttonVariants.secondary}>
              <Download className="w-4 h-4" /> 导出 CSV
            </button>
          </div>
          <p className="text-xs text-gray-400">共 {commonProducts.length} 个常用商品，当前显示 {filtered.length} 个</p>

          {/* Batch Query Area */}
          {batchMode && (
            <div className="mt-4 pt-4 border-t dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                批量查询 — 每行输入一个品名（支持中文/英文），或逗号/分号分隔
              </p>
              <textarea
                value={batchInput}
                onChange={e => setBatchInput(e.target.value)}
                placeholder={"示例：\n手机壳\n充电宝\n茶叶\n沙发"}
                rows={5}
                className={inputStyles + " font-mono text-sm resize-y"}
              />
              {batchInput.trim() && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    共 {batchResults.length} 个查询，匹配 {batchTotal} 条结果
                  </p>
                  {batchResults.map((r, i) => (
                    <div key={i} className={`p-3 rounded-lg border ${r.count > 0 ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'}`}>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {r.count > 0 ? '✅' : '❌'} {r.query}
                        <span className="text-xs text-gray-500 ml-2">({r.count} 条匹配)</span>
                      </p>
                      {r.matches.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {r.matches.slice(0, 3).map((m, j) => (
                            <span key={j} className="px-2 py-0.5 bg-white dark:bg-gray-700 rounded text-xs font-mono border">
                              {m.hsCandidates[0]} — {m.nameEn}
                            </span>
                          ))}
                          {r.matches.length > 3 && (
                            <span className="text-xs text-gray-500">+{r.matches.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-3">
          {filtered.map((p, i) => {
            const id = `product-${i}`;
            const isExpanded = expandedId === id;
            return (
              <div key={id} className={`${cardStyles.base.replace("p-5", "")} overflow-hidden`}>
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
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono text-blue-600 dark:text-blue-400">{p.nameEn}</p>
                        <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(p.nameEn); trackEvent.hsCopyName(); }}
                          className="text-xs text-blue-500 hover:text-blue-700 transition-colors" title="复制">
                          📋
                        </button>
                      </div>
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
                      <p className={`text-sm text-gray-600 dark:text-gray-300 ${labelStyles.item}`}>{p.notes}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <a href={p.officialUrl} target="_blank" rel="noopener noreferrer"
                        onClick={() => trackEvent.hsClickVerify()}
                        className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 hover:text-green-700">
                        <ExternalLink className="w-3 h-3" /> 前往官方税则核验
                      </a>
                      {p.thirdPartyUrl && (
                        <a href={p.thirdPartyUrl} target="_blank" rel="noopener noreferrer"
                          onClick={() => trackEvent.custom('hs-code', 'click_third_party')}
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
        <div className={`mt-8 ${cardStyles.base}`}>
          <h3 className={cardStyles.header}>
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
        <div className={`mt-6 ${cardStyles.base}`}>
          <h3 className={cardStyles.header}>📚 数据来源与说明</h3>
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

        {/* FAQ */}
        <FAQSection title="HS编码常见问题" items={[
          {
            question: "HS编码是什么？为什么需要它？",
            answer: "HS编码（Harmonized System Code）是国际通用的商品分类编码体系，由世界海关组织（WCO）制定。国际贸易中，海关用 HS 编码来确定商品的关税税率、监管条件和统计数据。寄国际快递或做商业发票时，都需要填写商品 HS 编码。",
          },
          {
            question: "本工具列出的 HS 编码能直接用吗？",
            answer: "本工具列出的是候选编码，基于常见商品申报经验汇总。实际归类需要结合商品的具体材质、用途、加工工艺等因素综合判断。对于高价值货物或特殊商品，建议咨询报关行或查阅目的国官方税则。",
          },
          {
            question: "为什么同一个商品有多个 HS 编码？",
            answer: "HS 编码前 6 位是全球统一的，但各国可以在此基础上扩展至 8-10 位。同一商品因材质、规格不同可能归入不同编码。例如 T恤 按棉制和化纤制分别对应不同编码。本工具列出的是常见候选，具体适用需根据实际情况判断。",
          },
          {
            question: "'需确认属性'和'高风险'是什么意思？",
            answer: "风险等级仅供跨境寄送参考。普通货参考表示一般可作为普通货物寄送；需确认属性表示该商品可能涉及特殊材质（如木制、电池、液体）需要额外确认；高风险合规确认表示该商品受严格监管（如含锂电池、易燃品），运输前务必与承运商确认。",
          },
          {
            question: "如何查询官方的 HS 编码？",
            answer: "可以通过页面下方各国官方查询入口（中国海关总署、美国 USITC、英国 Trade Tariff 等）进行查询。也可以使用第三方参考网站如 hscode.net 进行快速检索。最终归类请以海关或报关行的判断为准。",
          },
          {
            question: "能批量查询多个品名吗？",
            answer: "可以。点击「批量查询」按钮，在文本框中输入多个品名（每行一个，或逗号/分号分隔），系统会同时搜索所有品名并显示匹配结果。适合需要同时查询多种商品的场景。",
          },
          {
            question: "能导出 HS 编码数据吗？",
            answer: "可以。点击「导出 CSV」按钮，会将当前筛选结果导出为 CSV 文件，包含中文品名、英文申报名、HS 候选编码、风险等级、材质、用途、申报注意等字段。方便在 Excel 中查看或发给报关行。",
          },
        ]} />

        {/* Tool-specific ads */}
        <AdSlot placement="tool-hs-code-bottom" className="mb-4" />
        <AdSlot placement="tool-bottom" className="mb-8" />
      </div>
    </div>
  );
}
