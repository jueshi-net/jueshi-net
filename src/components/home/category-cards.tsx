import Link from "next/link";

const CATEGORIES = [
  { label: "国际物流", icon: "🚚", count: 12, hot: "运费估算", href: "/tools", bg: "from-blue-500 to-blue-600", ring: "ring-blue-200" },
  { label: "外贸单据", icon: "📄", count: 8, hot: "Commercial Invoice", href: "/tools/documents", bg: "from-amber-500 to-orange-500", ring: "ring-amber-200" },
  { label: "跨境电商", icon: "🛒", count: 10, hot: "利润计算器", href: "/tools", bg: "from-emerald-500 to-teal-600", ring: "ring-emerald-200" },
  { label: "内容创作", icon: "✍️", count: 6, hot: "短视频 SOP", href: "/tools", bg: "from-violet-500 to-purple-600", ring: "ring-violet-200" },
  { label: "AI 工具", icon: "🤖", count: 0, hot: "即将开放", href: "/ai-tools", bg: "from-rose-500 to-pink-600", ring: "ring-rose-200" },
  { label: "海外生活", icon: "🌎", count: 15, hot: "邮编查询 · 汇率", href: "/tools", bg: "from-cyan-500 to-teal-500", ring: "ring-cyan-200" },
];

export default function CategoryCards() {
  return (
    <section className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">核心工具分类</h2>
          <p className="mt-1.5 text-sm text-gray-500 max-w-lg mx-auto">覆盖跨境全场景，每个分类都是垂直深耕</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className={`group relative overflow-hidden rounded-[20px] bg-gradient-to-br ${cat.bg} p-4 text-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all ring-2 ${cat.ring} ring-offset-2 ring-offset-white`}
            >
              <div className="text-2xl mb-2">{cat.icon}</div>
              <div className="text-sm font-bold mb-0.5">{cat.label}</div>
              {cat.count > 0 ? (
                <div className="text-[11px] text-white/80">{cat.count} 个工具</div>
              ) : (
                <div className="text-[11px] text-white/80 italic">{cat.hot}</div>
              )}
              <div className="mt-1.5 text-[10px] text-white/70 truncate">🔥 {cat.hot}</div>
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
