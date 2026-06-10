import Link from "next/link";
import { PackageSearch, Mail } from "lucide-react";

const COLUMNS = [
  {
    title: "工具中心",
    links: [
      { label: "全部工具", href: "/tools" },
      { label: "单据模板", href: "/tools/documents" },
      { label: "运费计算", href: "/tools/shipping-calculator" },
      { label: "HS编码", href: "/tools/hs-code" },
      { label: "邮编查询", href: "/tools/postal-code" },
      { label: "汇率换算", href: "/tools/exchange-rate" },
    ],
  },
  {
    title: "社区",
    links: [
      { label: "社区论坛", href: "/bbs" },
      { label: "专题内容", href: "/topics" },
      { label: "资源导航", href: "/resources" },
      { label: "目的地", href: "/destinations" },
      { label: "指南", href: "/guides" },
    ],
  },
  {
    title: "帮助中心",
    links: [
      { label: "新手入门", href: "/starter" },
      { label: "价格方案", href: "/pricing" },
      { label: "常见问题", href: "/help" },
      { label: "服务条款", href: "/terms" },
      { label: "隐私政策", href: "/privacy" },
    ],
  },
  {
    title: "联系方式",
    links: [
      { label: "联系我们", href: "/cdn-cgi/l/email-protection#4d2e2223392c2e390d2738283e252463232839" },
      { label: "Telegram", href: "https://t.me/jueshi" },
      { label: "微信客服", href: "/help" },
      { label: "合作洽谈", href: "/help" },
    ],
  },
];

export default function FooterNew() {
  return (
    <footer className="w-full bg-[#0f172a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-teal-500 rounded-[12px] flex items-center justify-center">
                <PackageSearch className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold">绝世百宝箱</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              绝世百宝箱提供集运、物流、外贸单据、跨境电商、留学生活等实用工具，覆盖跨境电商、SOHO、留学生与数字游民。
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Mail className="w-4 h-4" />
              <span>contact@jueshi.net</span>
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold text-white mb-4">{col.title}</h4>
              <div className="space-y-2.5">
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-sm text-gray-400 hover:text-teal-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© 2026 绝世百宝箱 · jueshi.net</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-teal-400 transition-colors">服务条款</Link>
            <Link href="/privacy" className="hover:text-teal-400 transition-colors">隐私政策</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
