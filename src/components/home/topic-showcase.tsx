import { Target, ChevronRight, Star } from 'lucide-react';

const MOCK_TOPICS = [
  { id: '1', title: '跨境电商 S 级工具避坑指南', desc: '从选品到收款，覆盖跨境卖家全链路的高频工具与避坑经验', rating: 'S', items: 15, subItems: ['选品分析', '物流比价', 'VAT申报', 'ERP对接'], href: '/topics' },
  { id: '2', title: '东南亚 TikTok 小店新手包', desc: '从开店到爆单，东南亚电商运营全流程工具合集', rating: 'A', items: 12, subItems: ['开店流程', '选品工具', '物流方案', '支付接入'], href: '/topics' },
  { id: '3', title: '欧美留学必备生活应用', desc: '落地第一周必须搞定的 8 件事，附模板和清单', rating: 'A', items: 8, subItems: ['租房合同', '银行卡开户', '手机卡', '选课指南'], href: '/topics' },
];

const RATING_COLORS: Record<string, string> = {
  S: 'from-amber-500 to-orange-500',
  A: 'from-blue-500 to-indigo-500',
};

export default function TopicShowcase() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-teal-600" />
            专题精选
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">编辑精选，一站式解决方案</p>
        </div>
        <a href="/topics" className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-0.5">
          浏览全部 <ChevronRight className="w-4 h-4" />
        </a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {MOCK_TOPICS.map(t => (
          <a key={t.id} href={t.href} className="flex flex-col bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm shadow-gray-100/30 hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5 hover:border-teal-200 transition-all duration-200 group">
            {/* Rating + meta */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex items-center justify-center rounded-lg bg-gradient-to-br ${RATING_COLORS[t.rating]} px-2 py-0.5 text-xs font-bold text-white shadow-sm`}>
                {t.rating}
              </span>
              <span className="text-xs text-gray-400">{t.items} 个精选资源</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-teal-700 transition-colors">{t.title}</h3>
            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{t.desc}</p>

            {/* Sub-items */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {t.subItems.map((sub) => (
                <span key={sub} className="rounded-md bg-gray-50 dark:bg-gray-700 px-2 py-1 text-[11px] text-gray-600 dark:text-gray-300 transition group-hover:bg-teal-50 group-hover:text-teal-700 group-hover:dark:bg-teal-900/30 group-hover:dark:text-teal-300">
                  {sub}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
