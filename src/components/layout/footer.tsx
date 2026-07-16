import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/tools/documents", label: "单据中心" },
  { href: "/tools/postal-code", label: "邮编查询" },
  { href: "/tools/hs-code", label: "HS编码" },
  { href: "/tools/shipping-calculator", label: "运费计算" },
  { href: "/tools/exchange-rate", label: "汇率换算" },
  { href: "/tools/container", label: "集装箱计算" },
  { href: "/tools", label: "工具中心" },
  { href: "/tracking", label: "物流追踪" },
  { href: "/ai-tools", label: "AI工具" },
  { href: "/resources", label: "资源导航" },
  { href: "/topics", label: "专题库" },
  { href: "/destinations", label: "目的地" },
  { href: "/bbs", label: "社区论坛" },
  { href: "/guides", label: "指南" },
  { href: "/starter", label: "新手入门" },
  { href: "/help", label: "帮助中心" },
  { href: "/login", label: "登录" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-[#f8fafc] border-t border-[#e5e7eb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img
                src="/brand/v2/logo-horizontal-inverse.svg"
                alt="绝世百宝箱 jueshi.net"
                className="h-10 w-auto object-contain"
                width={160}
                height={44}
              />
            </div>
            <p className="text-sm text-[#666666] leading-relaxed">
              全域出国基础设施平台，覆盖跨境电商、SOHO、留学生与数字游民。从物流追踪到合规运营，一站式解决。
            </p>
          </div>

          {/* Center: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-[#111111] mb-3">快速导航</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/", label: "首页" },
                { href: "/tools/documents", label: "单据模板" },
                { href: "/tools", label: "工具中心" },
                { href: "/bbs", label: "社区论坛" },
                { href: "/destinations", label: "目的地" },
                { href: "/topics", label: "专题库" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-sm text-[#666666] hover:text-[#1966f2] transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: All Tools */}
          <div>
            <h4 className="text-sm font-bold text-[#111111] mb-3">全部工具</h4>
            <div className="grid grid-cols-2 gap-2">
              {FOOTER_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="text-sm text-[#666666] hover:text-[#1966f2] transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#e5e7eb] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#666666]">
          <p>© {new Date().getFullYear()} 绝世百宝箱 · jueshi.net</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-[#1966f2]">服务条款</Link>
            <Link href="/privacy" className="hover:text-[#1966f2]">隐私政策</Link>
            <a href="mailto:contact@jueshi.net" className="hover:text-[#1966f2]">联系我们</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
