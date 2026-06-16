import Link from "next/link";
import Image from "next/image";

const TOPICS = [
  { href: "/topics/canada-shipping", title: "加拿大专线集运指南", desc: "从中国到多伦多/温哥华，海运/空运全渠道攻略", image: "https://images.unsplash.com/photo-1517940310602-26535839fe84?q=80&w=800&auto=format&fit=crop", tag: "集运专线" },
  { href: "/topics/sea-cross-border", title: "东南亚跨境电商实战", desc: "Shopee/Lazada/TikTok 全链路运营", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=800&auto=format&fit=crop", tag: "东南亚" },
  { href: "/topics/uk-compliance", title: "英国本土店合规运营", desc: "VAT 注册·产品认证·平台规则·税务申报", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop", tag: "欧洲合规" },
  // 4th position: Ad card
  { href: null, isAd: true, title: "国际集运指南", desc: "中美/中欧专线集运，首重低至 ¥28/kg", tag: "赞助" },
  { href: "/topics/ai-automation", title: "AI 自动化应用工具", desc: "跨境卖家如何用 AI 提升效率", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop", tag: "AI 工具" },
  { href: "/topics/digital-nomad", title: "数字游民签证合集", desc: "热门国家长居/工作签证指南", image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop", tag: "签证" },
];

export default function TopicsSection() {
  return (
    <section className="w-full bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">精选专题</h2>
          <p className="mt-1.5 text-sm text-gray-500">场景化解决方案，一站式指南</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOPICS.map((topic, idx) => {
            if ((topic as any).isAd) {
              return (
                <div key={`ad-${idx}`} className="bg-white rounded-[20px] overflow-hidden border-2 border-dashed border-gray-200">
                  <div className="relative h-48 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
                    <span className="text-5xl">📦</span>
                    <span className="absolute top-3 right-3 text-[10px] font-bold text-orange-500 bg-orange-100 px-2 py-0.5 rounded-md">赞助</span>
                  </div>
                  <div className="p-5">
                    <div className="text-base font-bold text-gray-900">{topic.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{topic.desc}</div>
                    <a href="#" className="mt-3 inline-flex items-center text-sm font-semibold text-orange-600 hover:text-orange-700">
                      了解详情 →
                    </a>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={topic.href!}
                href={topic.href!}
                className="group bg-white rounded-[20px] overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="relative h-48 bg-gray-100">
                  <Image src={topic.image!} alt={topic.title} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                  <span className="absolute top-3 left-3 text-[11px] font-semibold text-white bg-teal-600 px-2.5 py-1 rounded-lg">
                    {topic.tag}
                  </span>
                </div>
                <div className="p-5">
                  <div className="text-base font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                    {topic.title}
                  </div>
                  <div className="text-sm text-gray-500 mt-1.5 line-clamp-2">{topic.desc}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
