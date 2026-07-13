'use client';

import Link from 'next/link';
import { AdSlot } from '@/components/ad-slot';
import { JueshiV4PublicShell } from '@/components/jueshi-v4-public-shell';
import {
  Globe,
  CreditCard,
  Mail,
  Server,
  Users,
  ExternalLink,
  AlertTriangle,
  Package,
  MapPin,
  Coins,
  FileText,
  Hash,
} from 'lucide-react';

interface ToolLink {
  name: string;
  href: string;
  external?: boolean;
}

interface CategoryCard {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  links: ToolLink[];
}

const categories: CategoryCard[] = [
  {
    title: '出海建站工具',
    icon: Globe,
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    links: [
      { name: 'Shopify', href: 'https://www.shopify.com', external: true },
      { name: 'WooCommerce', href: 'https://woocommerce.com', external: true },
      { name: 'WordPress', href: 'https://wordpress.org', external: true },
      { name: 'Wix', href: 'https://www.wix.com', external: true },
      { name: 'Squarespace', href: 'https://www.squarespace.com', external: true },
      { name: 'Webflow', href: 'https://webflow.com', external: true },
    ],
  },
  {
    title: '跨境收款',
    icon: CreditCard,
    iconColor: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    links: [
      { name: 'Stripe', href: 'https://stripe.com', external: true },
      { name: 'PayPal', href: 'https://www.paypal.com', external: true },
      { name: 'PingPong', href: 'https://www.pingpongx.com', external: true },
      { name: '空中云汇 Airwallex', href: 'https://www.airwallex.com', external: true },
      { name: 'Payoneer', href: 'https://www.payoneer.com', external: true },
      { name: 'LianLian 连连支付', href: 'https://www.lianlianpay.com', external: true },
      { name: '万里汇 WorldFirst', href: 'https://www.worldfirst.com.cn', external: true },
    ],
  },
  {
    title: '域名与服务器',
    icon: Server,
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    links: [
      { name: 'Cloudflare', href: 'https://www.cloudflare.com', external: true },
      { name: 'Namecheap', href: 'https://www.namecheap.com', external: true },
      { name: 'Vercel', href: 'https://vercel.com', external: true },
      { name: 'AWS', href: 'https://aws.amazon.com', external: true },
      { name: 'DigitalOcean', href: 'https://www.digitalocean.com', external: true },
      { name: 'RackNerd', href: 'https://www.racknerd.com', external: true },
    ],
  },
  {
    title: '公司邮箱',
    icon: Mail,
    iconColor: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    links: [
      { name: 'Google Workspace', href: 'https://workspace.google.com', external: true },
      { name: '腾讯企业邮', href: 'https://exmail.qq.com', external: true },
    ],
  },
  {
    title: '域名 / 服务器',
    icon: Server,
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    links: [
      { name: 'Cloudflare', href: 'https://www.cloudflare.com', external: true },
      { name: 'Namecheap', href: 'https://www.namecheap.com', external: true },
      { name: 'Vercel', href: 'https://vercel.com', external: true },
    ],
  },
  {
    title: '外贸获客',
    icon: Users,
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    links: [
      { name: '海关数据', href: '#' },
      { name: 'LinkedIn', href: 'https://www.linkedin.com', external: true },
      { name: 'Google Ads', href: 'https://ads.google.com', external: true },
    ],
  },
];

const relatedTools = [
  { name: '邮编地址查询', href: '/tools/postal-code', icon: MapPin, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { name: '汇率查询', href: '/tools/exchange-rate', icon: Coins, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
  { name: '运费计算器', href: '/tools/shipping-calculator', icon: Package, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  { name: 'HS编码查询', href: '/tools/hs-code', icon: Hash, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { name: '单据中心', href: '/tools/documents', icon: FileText, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
];

function ToolLinkItem({ link }: { link: ToolLink }) {
  const isExternal = link.external ?? false;
  const isPlaceholder = link.href === '#';

  if (isPlaceholder) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed min-w-[120px] justify-center">
        {link.name}
        <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded ml-1.5">
          即将上线
        </span>
      </span>
    );
  }

  if (isExternal) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors min-w-[120px] justify-center"
      >
        {link.name}
        <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
      </a>
    );
  }

  return (
    <Link
      href={link.href}
      className="group inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors min-w-[120px] justify-center"
    >
      {link.name}
      <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

export default function BusinessPage() {
  return (
    <JueshiV4PublicShell>
      <div className="max-w-6xl mx-auto px-4 pb-16 pt-8">
        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.title}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 ease-in-out"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-lg ${cat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${cat.iconColor}`} />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{cat.title}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cat.links.map((link) => (
                    <ToolLinkItem key={link.name + link.href} link={link} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Related Tools */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-xl">🔗</span> 相关工具
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {relatedTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group flex flex-col items-center text-center p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all min-h-[80px]"
                >
                  <div className={`w-12 h-12 rounded-lg ${tool.bg} flex items-center justify-center mb-2`}>
                    <Icon className={`w-5 h-5 ${tool.color}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tool.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Ad Slot */}
        <AdSlot placement="tool-bottom" variant="card" className="mb-8" />

        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <strong>免责声明：</strong>本站收录的工具和网站仅供信息参考，不构成任何推荐或担保。
            所有外部链接均指向第三方网站，本站不对其内容、安全性或可用性负责。
            请用户自行判断和选择适合的工具。部分工具标注「即将上线」，敬请期待。
          </div>
        </div>
      </div>
    </JueshiV4PublicShell>
  );
}
