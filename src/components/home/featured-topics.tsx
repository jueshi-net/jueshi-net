import Link from "next/link";
import { ArrowRight } from "lucide-react";

const TOPICS = [
  { href: "/topics/canada-shipping", title: "加拿大专线集运指南", desc: "海运/空运全渠道攻略" },
  { href: "/topics/sea-cross-border", title: "大马/新加坡跨境电商", desc: "Shopee/Lazada/TikTok 运营" },
  { href: "/topics/uk-compliance", title: "英国本土店合规运营", desc: "VAT 注册·产品认证·税务" },
  { href: "/topics/ai-automation", title: "AI 自动化应用工具", desc: "跨境卖家 AI 提效指南" },
  { href: "/topics/digital-nomad", title: "数字游民签证合集", desc: "热门国家长居/工作签证" },
  { href: "/topics/overseas-bank", title: "海外开户攻略全解", desc: "多国银行开户条件与流程" },
];

export default function FeaturedTopics() {
  return (
    <section className="w-full px-4 md:px-8 py-6">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">推荐专题</h2>
          <Link href="/topics" className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
            全部 <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Compact list style — no large images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {TOPICS.map((topic) => (
            <Link
              key={topic.href}
              href={topic.href}
              className="group flex flex-col justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500/50 transition-colors min-h-[72px]"
            >
              <div>
                <div className="text-xs font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {topic.title}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5 truncate">{topic.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
