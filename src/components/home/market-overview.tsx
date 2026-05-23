import { Globe, MapPin, ChevronRight } from 'lucide-react';

const REGIONS = [
  { id: 'na', name: '北美', countries: ['美国', '加拿大', '墨西哥'], href: '/starter/na', topics: 8, hot: true },
  { id: 'eu', name: '欧洲', countries: ['英国', '德国', '法国'], href: '/starter/eu', topics: 6 },
  { id: 'sea', name: '东南亚', countries: ['泰国', '马来', '菲律宾'], href: '/starter/sea', topics: 12, hot: true },
  { id: 'ea', name: '日韩', countries: ['日本', '韩国'], href: '/starter/ea', topics: 5 },
  { id: 'latam', name: '拉美', countries: ['巴西', '智利', '阿根廷'], href: '/starter/latam', topics: 4 },
  { id: 'me', name: '中东', countries: ['阿联酋', '沙特'], href: '/starter/me', topics: 3, isNew: true },
  { id: 'oc', name: '澳洲', countries: ['澳大利亚', '新西兰'], href: '/starter/oc', topics: 4 },
];

export default function MarketOverview() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-teal-600" />
            全球出海市场大盘
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">按地区浏览专题与工具</p>
        </div>
        <a href="/topics" className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-0.5">
          全部专题 <ChevronRight className="w-4 h-4" />
        </a>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {REGIONS.map(r => (
          <a key={r.id} href={r.href} className="relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 text-center shadow-sm shadow-gray-100/50 hover:border-teal-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
            {/* Hot / New badge */}
            {r.hot && (
              <span className="absolute -right-1 -top-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                🔥
              </span>
            )}
            {r.isNew && (
              <span className="absolute -right-1 -top-1 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                NEW
              </span>
            )}
            <div className="mb-1.5 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{r.name}</h3>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-teal-600 transition-colors" />
            </div>
            <div className="flex flex-wrap justify-center gap-1 mb-1.5">
              {r.countries.map(c => (
                <span key={c} className="text-[11px] bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full">{c}</span>
              ))}
            </div>
            <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] text-gray-500">
              {r.topics} 个专题
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
