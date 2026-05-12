import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface RelatedTool {
  name: string;
  href: string;
  emoji: string;
  desc: string;
}

const TOOL_RELATIONSHIPS: Record<string, RelatedTool[]> = {
  tracking: [
    { name: '运费计算器', href: '/tools/shipping-calculator', emoji: '📐', desc: '计算包裹体积重和运费' },
    { name: 'HS编码', href: '/tools/hs-code', emoji: '🔍', desc: '查询海关商品编码' },
  ],
  'shipping-calculator': [
    { name: '物流追踪', href: '/tracking', emoji: '📦', desc: '批量查询物流单号' },
    { name: '敏感货参考', href: '/tools/sensitive-goods', emoji: '⚠️', desc: '查询物品是否敏感货' },
  ],
  'hs-code': [
    { name: '发票生成', href: '/tools/invoice', emoji: '🧾', desc: '生成商业发票和装箱单' },
    { name: '敏感货参考', href: '/tools/sensitive-goods', emoji: '⚠️', desc: '查询物品是否敏感货' },
  ],
  'postal-code': [
    { name: '地址格式化', href: '/tools/address-formatter', emoji: '📮', desc: '格式化国际收件地址' },
    { name: '汇率查询', href: '/tools/exchange-rate', emoji: '💱', desc: '查询实时汇率' },
  ],
  'exchange-rate': [
    { name: '报价单', href: '/tools/quote', emoji: '💵', desc: '生成报价单和收据' },
    { name: '发票生成', href: '/tools/invoice', emoji: '🧾', desc: '生成商业发票' },
  ],
  memo: [
    { name: '外网新手', href: '/starter', emoji: '🛠️', desc: '新手必备工具清单' },
    { name: '资源库', href: '/resources', emoji: '📚', desc: '海外生活和学习资源' },
  ],
  invoice: [
    { name: 'HS编码', href: '/tools/hs-code', emoji: '🔍', desc: '查询海关编码' },
    { name: '唛头面单', href: '/tools/label-maker', emoji: '🏷️', desc: '生成外箱唛头标签' },
  ],
  quote: [
    { name: '汇率查询', href: '/tools/exchange-rate', emoji: '💱', desc: '查询实时汇率' },
    { name: '运费计算器', href: '/tools/shipping-calculator', emoji: '📐', desc: '计算运费参考' },
  ],
  'sensitive-goods': [
    { name: '运费计算器', href: '/tools/shipping-calculator', emoji: '📐', desc: '计算运费和体积重' },
    { name: '物流追踪', href: '/tracking', emoji: '📦', desc: '查询包裹物流' },
  ],
  'label-maker': [
    { name: '发票生成', href: '/tools/invoice', emoji: '🧾', desc: '生成商业发票' },
    { name: '单据中心', href: '/tools/documents', emoji: '📄', desc: '20+ 单据模板' },
  ],
  documents: [
    { name: '发票生成', href: '/tools/invoice', emoji: '🧾', desc: '快速生成发票' },
    { name: '唛头面单', href: '/tools/label-maker', emoji: '🏷️', desc: '生成外箱标签' },
  ],
};

interface RelatedToolsWidgetProps {
  currentTool: string;
}

export function RelatedToolsWidget({ currentTool }: RelatedToolsWidgetProps) {
  const related = TOOL_RELATIONSHIPS[currentTool] || [];
  
  if (related.length === 0) return null;
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">相关工具推荐</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {related.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-100 hover:shadow-md hover:border-blue-200 transition-all group"
          >
            <span className="text-2xl">{tool.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {tool.name}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{tool.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
