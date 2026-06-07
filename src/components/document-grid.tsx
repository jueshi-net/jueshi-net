'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Crown } from 'lucide-react';

interface DocType {
  type: string;
  titleZh: string;
  titleEn: string;
  description: string;
  scenario: string;
  isFree: boolean;
  isOnline: boolean;
  icon: string;
  exportFileNamePrefix: string;
}

interface DocumentGridProps {
  coreDocs: DocType[];
  secondTierDocs: DocType[];
}

export default function DocumentGrid({ coreDocs, secondTierDocs }: DocumentGridProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'trade' | 'logistics' | 'customs' | 'consolidation' | 'other'>('all');

  const categoryMap: Record<string, string[]> = {
    trade: ['invoice', 'contract', 'quotation', 'sales', 'proforma', 'commercial', '报价', '发票', '合同'],
    logistics: ['packing', 'delivery', 'freight', 'booking', 'shipping', 'trucking', 'container', 'mark', '装', '运', '送', '柜', '唛头', '拖车', '补料'],
    customs: ['customs', 'declaration', 'express', 'certificate', 'origin', 'fumigation', '报关', '申报', '原产地', '熏蒸'],
    consolidation: ['consolidation', 'inbound', '合箱', '入库'],
  };

  function getCategory(type: string, title: string): string {
    const lower = `${type} ${title}`.toLowerCase();
    for (const [cat, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(kw => lower.includes(kw.toLowerCase()))) return cat;
    }
    return 'other';
  }

  function matches(doc: DocType): boolean {
    if (search) {
      const s = search.toLowerCase();
      if (!doc.titleZh.toLowerCase().includes(s) && !doc.titleEn.toLowerCase().includes(s) && !doc.description.toLowerCase().includes(s)) return false;
    }
    if (filter !== 'all') {
      const cat = getCategory(doc.type, doc.titleZh);
      if (cat !== filter) return false;
    }
    return true;
  }

  const filteredCore = coreDocs.filter(matches);
  const filteredSecond = secondTierDocs.filter(matches);

  return (
    <>
      {/* Search & Filter */}
      <div className="mb-8 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索单据名称、英文或描述..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: 'all' as const, label: '全部' },
            { key: 'trade' as const, label: '贸易/报价' },
            { key: 'logistics' as const, label: '物流/运输' },
            { key: 'customs' as const, label: '报关/申报' },
            { key: 'consolidation' as const, label: '集运/仓管' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors ${filter === f.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Core documents */}
      <div id="core-docs">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">核心基础单据</h2>
        <p className="text-gray-500 mb-6">{filteredCore.length} 套</p>

        {filteredCore.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Search className="w-8 h-8 mx-auto mb-2" />
            <p>未找到匹配的单据</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCore.map(doc => (
              <Link
                key={doc.type}
                href={`/tools/documents/${doc.type}`}
                className="group bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-blue-200 transition-all relative"
              >
                <div className="text-3xl mb-3">{doc.icon}</div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                  {doc.titleZh}
                </h3>
                <p className="text-xs text-gray-400 mb-2">{doc.titleEn}</p>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{doc.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">免费</span>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Second tier */}
      {filteredSecond.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">其他模板</h2>
          <p className="text-gray-500 mb-6">{filteredSecond.length} 套</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredSecond.map(doc => (
              <Link
                key={doc.type}
                href={`/tools/documents/${doc.type}`}
                className="group bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-blue-200 transition-all relative"
              >
                <div className="text-3xl mb-3">{doc.icon}</div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                  {doc.titleZh}
                </h3>
                <p className="text-xs text-gray-400 mb-2">{doc.titleEn}</p>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{doc.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">免费</span>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
