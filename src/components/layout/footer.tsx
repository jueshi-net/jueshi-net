import Link from "next/link";

const FOOTER_LINKS = {
  tools: {
    title: "核心工具",
    links: [
      { href: "/tools/postal-code", label: "邮编查询" },
      { href: "/tools/documents", label: "单据中心" },
      { href: "/tools/label-maker", label: "唛头标签" },
      { href: "/ai-tools/product-copy", label: "AI 商品文案" },
      { href: "/ai-tools/translate-polish", label: "AI 翻译润色" },
      { href: "/ai-tools/document-summary", label: "AI 文件摘要" },
    ],
  },
  content: {
    title: "内容资源",
    links: [
      { href: "/guides", label: "实用指南" },
      { href: "/resources", label: "资源库" },
      { href: "/topics", label: "专题合集" },
      { href: "/starter", label: "场景工具包" },
      { href: "/rankings", label: "工具排行榜" },
      { href: "/bbs", label: "社区论坛" },
    ],
  },
  user: {
    title: "用户中心",
    links: [
      { href: "/dashboard", label: "我的工作台" },
      { href: "/dashboard/points", label: "积分与会员" },
      { href: "/pricing", label: "价格方案" },
      { href: "/login", label: "登录" },
    ],
  },
  about: {
    title: "关于与规则",
    links: [
      { href: "/help", label: "帮助中心" },
      { href: "/terms", label: "服务条款" },
      { href: "/privacy", label: "隐私政策" },
      { href: "mailto:contact@jueshi.net", label: "contact@jueshi.net" },
    ],
  },
};

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* 4-Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column: Core Tools */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              {FOOTER_LINKS.tools.title}
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.tools.links.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("mailto:") ? (
                    <a
                      href={link.href}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors break-words"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column: Content & Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              {FOOTER_LINKS.content.title}
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.content.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column: User Center */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              {FOOTER_LINKS.user.title}
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.user.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column: About & Rules */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              {FOOTER_LINKS.about.title}
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.about.links.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("mailto:") ? (
                    <a
                      href={link.href}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors break-words"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 mb-6 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          <p>
            本站工具和内容仅供参考，不构成任何法律、财务或物流建议。政策、平台规则、价格以官方和服务商实际信息为准。
          </p>
          <p className="mt-1">
            部分推广内容以"推广"/"赞助"/"推荐"标签标注，海外百宝箱不对第三方服务结果作出承诺，请用户自行判断。
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400 dark:text-gray-500">
          <p>
            © {new Date().getFullYear()} 海外百宝箱 · jueshi.net
          </p>
          <Link href="/" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            返回首页
          </Link>
        </div>
      </div>
    </footer>
  );
}
