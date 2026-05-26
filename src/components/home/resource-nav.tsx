import { AdSlot } from '@/components/ads/AdSlot';
import { Library, ExternalLink, Store, Globe, Landmark } from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  '电商平台': <Store className="h-3.5 w-3.5" />,
  '跨境支付': <Landmark className="h-3.5 w-3.5" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  '电商平台': 'bg-blue-50 text-blue-600',
  '跨境支付': 'bg-violet-50 text-violet-600',
};

const RESOURCES = [
  { name: 'Amazon 全球开店', url: 'https://sell.amazon.com', cat: '电商平台', desc: '官方卖家入驻' },
  { name: 'Shopee 虾皮', url: 'https://shopee.com', cat: '电商平台', desc: '东南亚市场龙头' },
  { name: 'Lazada', url: 'https://www.lazada.com', cat: '电商平台', desc: '阿里系跨境电商' },
  { name: 'Payoneer 派安盈', url: 'https://www.payoneer.com', cat: '跨境支付', desc: '多币种收款账户' },
  { name: '连连支付', url: 'https://www.lianlianpay.com', cat: '跨境支付', desc: '合规收款通道' },
  { name: 'PingPong', url: 'https://www.pingpongx.com', cat: '跨境支付', desc: '低费率跨境收款' },
];

export default function ResourceNav() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Library className="w-5 h-5 text-teal-600" />
            严选资源导航
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">编辑筛选，只推荐真正好用的</p>
        </div>
        <a href="/resources" className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-0.5">
          查看资源库 <ExternalLink className="w-4 h-4" />
        </a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {RESOURCES.map(r => (
          <a key={r.name} href={r.url} target="_blank" rel="noopener" className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm shadow-gray-100/30 hover:shadow-md hover:border-teal-200 hover:-translate-y-0.5 transition-all duration-200 group">
            <div className="flex items-center gap-3">
              <div className={`inline-flex items-center justify-center rounded-lg p-2 ${CATEGORY_COLORS[r.cat]}`}>
                {CATEGORY_ICONS[r.cat]}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-teal-700 text-sm">
                  {r.name}
                </h3>
                <span className="text-[11px] text-gray-400">{r.desc}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${CATEGORY_COLORS[r.cat]}`}>
                {r.cat}
              </span>
              <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-teal-600 transition-colors" />
            </div>
          </a>
        ))}
        {/* Resource Native Ad (dynamic from Ad System) */}
        <AdSlot placement="resource-nav-native" />
      </div>
    </div>
  );
}
