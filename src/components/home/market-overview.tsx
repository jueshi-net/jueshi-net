import { Globe, ChevronRight } from 'lucide-react';

// Region slugs that have actual DB data (will be verified at runtime)
const KNOWN_COUNTRY_SLUGS = new Set([
  'canada', 'malaysia', 'usa', 'uk', 'japan', 'australia',
  'thailand', 'germany', 'france', 'vietnam', 'indonesia',
  'philippines', 'south-korea', 'mexico', 'spain', 'brazil',
  'argentina', 'chile', 'uae', 'saudi-arabia', 'new-zealand',
]);

const REGIONS = [
  { id: 'na', name: '北美', countries: [{ name: '加拿大', slug: 'canada' }, { name: '美国', slug: 'usa' }, { name: '墨西哥', slug: 'mexico' }], href: '/destinations', topics: 8, hot: true },
  { id: 'eu', name: '欧洲', countries: [{ name: '英国', slug: 'uk' }, { name: '德国', slug: 'germany' }, { name: '法国', slug: 'france' }], href: '/destinations', topics: 6 },
  { id: 'sea', name: '东南亚', countries: [{ name: '马来西亚', slug: 'malaysia' }, { name: '泰国', slug: 'thailand' }, { name: '菲律宾', slug: 'philippines' }], href: '/destinations', topics: 12, hot: true },
  { id: 'ea', name: '日韩', countries: [{ name: '日本', slug: 'japan' }, { name: '韩国', slug: 'south-korea' }], href: '/destinations', topics: 5 },
  { id: 'latam', name: '拉美', countries: [{ name: '巴西', slug: 'brazil' }, { name: '智利', slug: 'chile' }, { name: '阿根廷', slug: 'argentina' }], href: '/destinations', topics: 4 },
  { id: 'me', name: '中东', countries: [{ name: '阿联酋', slug: 'uae' }, { name: '沙特', slug: 'saudi-arabia' }], href: '/destinations', topics: 3, isNew: true },
  { id: 'oc', name: '澳洲', countries: [{ name: '澳大利亚', slug: 'australia' }, { name: '新西兰', slug: 'new-zealand' }], href: '/destinations', topics: 4 },
];

export default function MarketOverview() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-teal-600" />
            🌍 全球目的地全景向导
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">按国家或地区，探索专属于您的政策指南、实用工具与服务</p>
        </div>
        <a href="/destinations" className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-0.5">
          全部目的地 <ChevronRight className="w-4 h-4" />
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
              {r.countries.map(c => {
                const slug = c.slug || '';
                const hasData = slug && KNOWN_COUNTRY_SLUGS.has(slug);
                if (hasData) {
                  return (
                    <a
                      key={c.name}
                      href={`/destinations/${slug}`}
                      className="text-[11px] bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full hover:bg-teal-50 hover:text-teal-700 transition-colors cursor-pointer"
                    >
                      {c.name}
                    </a>
                  );
                }
                return (
                  <span
                    key={c.name}
                    className="text-[11px] bg-gray-50 dark:bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded-full cursor-not-allowed"
                    title="即将上线"
                  >
                    {c.name}
                  </span>
                );
              })}
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
