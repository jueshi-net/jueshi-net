import { MessageSquare, ExternalLink, Clock, Flame } from 'lucide-react';

const MOCK_POSTS = [
  { title: '泰国 TikTok Shop 最新封店潮应对策略', author: '大卖A', replies: 42, time: '2小时前', tag: '卖家', hot: true },
  { title: '美国 FBA 入仓新规：2026 年 5 月起强制要求', author: '跨境小白', replies: 28, time: '4小时前', tag: '物流' },
  { title: '分享一个免费的海外公司注册渠道（非中介）', author: '出海老兵', replies: 67, time: '6小时前', tag: '签证', hot: true },
];

const TAG_COLORS: Record<string, string> = {
  '卖家': 'bg-blue-50 text-blue-600',
  '物流': 'bg-emerald-50 text-emerald-600',
  '签证': 'bg-violet-50 text-violet-600',
};

export default function CommunityFireworks() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8 pb-16">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-600" />
            社区烟火气
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">来自 bbs.jueshi.net 的最新讨论</p>
        </div>
        <a href="https://bbs.jueshi.net" target="_blank" rel="noopener" className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-0.5">
          去论坛逛逛 <ExternalLink className="w-4 h-4" />
        </a>
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm shadow-gray-100/30 divide-y divide-gray-100">
        {MOCK_POSTS.map((p, i) => (
          <a key={i} href="https://bbs.jueshi.net" target="_blank" rel="noopener" className="flex items-center justify-between p-4 hover:bg-teal-50/50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {p.hot && <Flame className="h-3.5 w-3.5 shrink-0 text-orange-500" />}
                <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium ${TAG_COLORS[p.tag] || 'bg-gray-100 text-gray-600'}`}>
                  {p.tag}
                </span>
                <h3 className="font-medium text-gray-900 dark:text-white truncate">{p.title}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                <span>{p.author}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.time}</span>
              </p>
            </div>
            <div className="flex items-center gap-4 ml-4 shrink-0">
              <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                p.replies >= 30
                  ? 'bg-orange-50 text-orange-600'
                  : 'bg-gray-50 text-gray-500'
              }`}>
                <MessageSquare className="h-3.5 w-3.5" />
                {p.replies}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
