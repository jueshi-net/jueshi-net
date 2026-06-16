import Link from "next/link";

const COLUMNS = [
  {
    title: "关于平台",
    links: [
      { label: "关于我们", href: "/about" },
      { label: "使用帮助", href: "/help" },
      { label: "反馈建议", href: "/feedback" },
      { label: "更新日志", href: "/changelog" },
      { label: "API 文档", href: "/api-docs" },
    ],
  },
  {
    title: "出海服务",
    links: [
      { label: "物流查询", href: "/tracking" },
      { label: "运费计算", href: "/tools/shipping-calculator" },
      { label: "HS 编码", href: "/tools/hs-code" },
      { label: "邮编查询", href: "/tools/postal-code" },
      { label: "汇率换算", href: "/tools/exchange-rate" },
    ],
  },
  {
    title: "运营工具",
    links: [
      { label: "单据模板", href: "/tools/documents" },
      { label: "集装箱规格", href: "/tools/container" },
      { label: "敏感货指南", href: "/tools/sensitive-goods" },
      { label: "AI 工具集", href: "/ai-tools" },
      { label: "报价单", href: "/tools/documents/quotation" },
    ],
  },
  {
    title: "专题资源",
    links: [
      { label: "指南", href: "/guides" },
      { label: "出海博客", href: "/blog" },
      { label: "数据看板", href: "/analytics" },
      { label: "行业排行", href: "/rankings" },
      { label: "网址导航", href: "/resources" },
    ],
  },
  {
    title: "合作与条款",
    links: [
      { label: "API 合作", href: "/api-docs" },
      { label: "商务联系", href: "/feedback" },
      { label: "隐私政策", href: "/privacy" },
      { label: "服务条款", href: "/terms" },
      { label: "免责声明", href: "/terms#disclaimer" },
    ],
  },
];

export default function MegaFooter() {
  return (
    <footer className="bg-[#061b31] text-white">
      {/* ── Main Footer ── */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[13px] font-medium text-white/80 mb-4 tracking-wide uppercase">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-white/50 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-[#0d253d]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[16px]">🌐</span>
            <span className="text-[14px] font-medium text-white/80">出海百宝箱</span>
            <span className="text-[12px] text-white/40 ml-1">jueshi.net</span>
          </div>
          <p className="text-[12px] text-white/40">
            © {new Date().getFullYear()} 出海百宝箱 · 全域出国基础设施平台 · All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
