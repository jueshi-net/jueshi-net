import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import TaskChainCta from "@/components/content/task-chain-cta";
import CountryHeroIntelligence from "@/components/countries/country-hero-intelligence";
import {
  getCountryBySlug,
  getAllCountries,
  type AllCountryConfig,
} from "@/lib/all-countries";
import {
  Home,
  ChevronRight,
  Wrench,
  BookOpen,
  HelpCircle,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Globe,
  MapPin,
  MessageCircle,
  ListChecks,
} from "lucide-react";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

// ─── Tool map ────────────────────────────────────────────────────────────
const TOOL_MAP: Record<string, { name: string; route: string; icon: string; desc: string }> = {
  tracking: { name: "运单号整理工具", route: "/tracking", icon: "📦", desc: "批量整理运单号" },
  "shipping-estimator": { name: "运费估算器", route: "/tools/shipping-calculator", icon: "🧮", desc: "计算体积重和费用参考" },
  "hs-code": { name: "HS编码查询", route: "/tools/hs-code", icon: "📋", desc: "常用商品HS编码参考" },
  "postal-code": { name: "邮编查询", route: "/tools/postal-code", icon: "📮", desc: "多国邮编数据库查询" },
  "commercial-invoice": { name: "发票生成器", route: "/tools/commercial-invoice", icon: "📄", desc: "商业发票和装箱单" },
  "packing-list": { name: "装箱单生成", route: "/tools/packing-list", icon: "📦", desc: "装箱单生成工具" },
  "address-formatter": { name: "地址格式化", route: "/tools/address-formatter", icon: "📝", desc: "多国地址格式一键生成" },
  cbm: { name: "CBM计算器", route: "/tools/shipping-calculator", icon: "📐", desc: "体积重计算" },
  "exchange-rate": { name: "汇率换算", route: "/tools/exchange-rate", icon: "💱", desc: "实时汇率参考" },
};

function getRelatedTools(relatedToolSlugs: string[]) {
  return relatedToolSlugs
    .map((slug) => TOOL_MAP[slug])
    .filter(Boolean) as Array<{ name: string; route: string; icon: string; desc: string }>;
}

interface Props {
  params: Promise<{ country: string }>;
}

// ─── Generate static params for all configured countries ─────────────────
export async function generateStaticParams() {
  return getAllCountries().map((c) => ({ country: c.slug }));
}

// ─── SEO Metadata ────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;
  const config = getCountryBySlug(country);
  if (!config) return { title: "国家页面未找到" };

  const canonical = `${SITE_URL}/countries/${country}`;
  const title = config.seoTitle || `${config.nameZh}地址邮编、发货工具与实用指南 - 绝世百宝箱`;
  const description = config.seoDescription || `${config.heroSubtitle}`;

  return {
    title,
    description,
    alternates: { canonical },
    robots: config.indexable ? "index,follow" : "noindex,nofollow",
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      locale: "zh_CN",
      siteName: "绝世百宝箱",
    },
  };
}

export default async function CountryPage({ params }: Props) {
  const { country } = await params;
  const config = getCountryBySlug(country);
  if (!config) notFound();

  // Also try to fetch DB LandingPage for additional data (FAQ, articles, etc.)
  const dbPage = await prisma.landingPage.findUnique({
    where: { slug: country, pageType: "country" },
  }).catch(() => null);

  // Merge: DB FAQ items override config if present
  const dbFaqItems = (dbPage?.faqItems as any[] | null) || [];
  const faqItems = dbFaqItems.length > 0 ? dbFaqItems : config.faqItems;

  // Fetch related articles/guides from DB if the LandingPage has relatedArticles
  const relatedArticleSlugs = dbPage?.relatedArticles || config.relatedGuideSlugs || [];
  const [articles, guides] = await Promise.all([
    relatedArticleSlugs.length > 0
      ? prisma.article.findMany({
          where: { slug: { in: relatedArticleSlugs }, status: "published" },
          select: { slug: true, title: true, excerpt: true, category: true },
        }).catch(() => [] as { slug: string; title: string; excerpt?: string | null; category?: string | null }[])
      : Promise.resolve([] as { slug: string; title: string; excerpt?: string | null; category?: string | null }[]),
    relatedArticleSlugs.length > 0
      ? prisma.guide.findMany({
          where: { slug: { in: relatedArticleSlugs }, status: "published" },
          select: { slug: true, title: true, summary: true, category: true },
        }).catch(() => [] as { slug: string; title: string; summary?: string | null; category?: string | null }[])
      : Promise.resolve([] as { slug: string; title: string; summary?: string | null; category?: string | null }[]),
  ]);

  // Build DB official links if present, otherwise use config
  const dbOfficialLinks = (dbPage?.officialLinks as any[] | null) || [];
  const officialLinks = dbOfficialLinks.length > 0
    ? dbOfficialLinks
    : [
        { label: `${config.nameZh}官方邮政`, url: config.officialPostalUrl },
        config.officialCustomsUrl ? { label: `${config.nameZh}海关`, url: config.officialCustomsUrl } : null,
        config.officialImmigrationUrl ? { label: `${config.nameZh}移民/签证`, url: config.officialImmigrationUrl } : null,
      ].filter(Boolean);

  const relatedTools = getRelatedTools(config.relatedToolSlugs);

  // Other countries for cross-linking
  const otherCountries = getAllCountries().filter((c) => c.slug !== config.slug).slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 overflow-x-hidden">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap" aria-label="面包屑导航">
          <Link href="/" className="flex items-center gap-1 hover:text-gray-900 transition-colors">
            <Home className="w-4 h-4" />
            <span>首页</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <Link href="/countries" className="hover:text-gray-900 transition-colors">
            国家
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-gray-900 font-medium truncate max-w-[200px]">
            {config.flagEmoji} {config.nameZh}
          </span>
        </nav>

        {/* ─── HERO with Intelligence (local time, info card) ─── */}
        <CountryHeroIntelligence config={config} />

        {/* ─── Country Tools ─── */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-teal-600" />
            🛠 {config.nameZh}常用工具
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Always show postal code tool first */}
            <Link
              href={`/tools/postal-code?country=${config.countryCode}`}
              className="group flex flex-col items-center gap-1 p-4 rounded-lg border border-gray-100 bg-white hover:shadow-md hover:border-teal-200 transition-all text-center"
            >
              <span className="text-2xl">📮</span>
              <span className="text-sm font-medium text-gray-700">{config.nameZh}邮编查询</span>
            </Link>
            {/* Config-defined tools */}
            {relatedTools.map((tool) => (
              <Link
                key={tool.route}
                href={tool.route}
                className="group flex flex-col items-center gap-1 p-4 rounded-lg border border-gray-100 bg-white hover:shadow-md hover:border-teal-200 transition-all text-center"
              >
                <span className="text-2xl">{tool.icon}</span>
                <span className="text-sm font-medium text-gray-700">{tool.name}</span>
              </Link>
            ))}
            {/* Always show task chain */}
            <Link
              href="/workspace/task-chains/shipping/new"
              className="group flex flex-col items-center gap-1 p-4 rounded-lg border border-gray-100 bg-white hover:shadow-md hover:border-teal-200 transition-all text-center"
            >
              <span className="text-2xl">🔗</span>
              <span className="text-sm font-medium text-gray-700">任务链</span>
            </Link>
          </div>
        </section>

        {/* ─── Task Chain Entry ─── */}
        <section className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 sm:p-8 text-white">
          <Sparkles className="w-8 h-8 mb-3 text-teal-100" />
          <h2 className="text-xl font-bold mb-2">中国寄{config.nameZh}任务链</h2>
          <p className="text-teal-100 mb-4 max-w-xl">
            商品信息 → HS编码 → 合规检查 → CBM → 地址邮编 → 商业发票 → 装箱单 → 成本估算 → 报价模板
          </p>
          <Link
            href="/workspace/task-chains/shipping/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-700 rounded-lg font-medium hover:bg-teal-50 transition-colors min-h-[44px]"
          >
            开始任务链 <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        {/* ─── Address Format ─── */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-600" />
            📍 {config.nameZh}地址格式
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">邮编叫法</h3>
              <p className="text-gray-900">{config.postalCodeName}（{config.postalCodeFormat}）</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">货币</h3>
              <p className="text-gray-900">{config.currencyCode} {config.currencyName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">电话区号</h3>
              <p className="text-gray-900">{config.dialingCode}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">官方语言</h3>
              <p className="text-gray-900">{config.languages.join("、")}</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-2">地址格式示例</h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{config.addressFormatExample}</pre>
          </div>
        </section>

        {/* ─── Popular Cities ─── */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-600" />
            🏙 {config.nameZh}热门城市
          </h2>
          <div className="flex flex-wrap gap-2">
            {config.majorCities.map((city) => (
              <Link
                key={city}
                href={`/tools/postal-code?country=${config.countryCode}&q=${encodeURIComponent(city)}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-teal-50 hover:border-teal-200 transition-colors"
              >
                {city}
              </Link>
            ))}
          </div>
        </section>

        {/* ─── Related Guides ─── */}
        {(articles.length > 0 || guides.length > 0) && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600" />
              📖 {config.nameZh}相关指南
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {guides.map((g) => (
                <Link key={`g-${g.slug}`} href={`/guides/${g.slug}`} className="group block p-4 rounded-lg border border-gray-100 bg-white hover:shadow-md hover:border-teal-200 transition-all">
                  {g.category && <span className="text-xs text-teal-600 font-medium">{g.category}</span>}
                  <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors mt-1 line-clamp-2">{g.title}</h3>
                  {g.summary && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{g.summary}</p>}
                </Link>
              ))}
              {articles.map((a) => (
                <Link key={`a-${a.slug}`} href={`/guides/${a.slug}`} className="group block p-4 rounded-lg border border-gray-100 bg-white hover:shadow-md hover:border-teal-200 transition-all">
                  {a.category && <span className="text-xs text-teal-600 font-medium">{a.category}</span>}
                  <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors mt-1 line-clamp-2">{a.title}</h3>
                  {a.excerpt && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{a.excerpt}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── Checklist ─── */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-teal-600" />
            ✅ {config.nameZh}寄送准备清单
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            {[
              { item: `${config.nameZh}发货前检查清单`, href: "/workspace/task-chains/shipping/new", icon: "📦" },
              { item: "商业发票检查", href: "/tools/commercial-invoice", icon: "📄" },
              { item: "装箱单检查", href: "/tools/packing-list", icon: "📋" },
              { item: "地址信息检查", href: `/tools/address-formatter?country=${config.countryCode}`, icon: "📝" },
              { item: "HS编码核实", href: "/tools/hs-code", icon: "🔖" },
            ].map((c) => (
              <Link key={c.href} href={c.href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <span className="text-xl">{c.icon}</span>
                <span className="text-gray-700 group-hover:text-teal-700 transition-colors">{c.item}</span>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 ml-auto transition-colors" />
              </Link>
            ))}
          </div>
        </section>

        {/* ─── Official Resources ─── */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-teal-600" />
            🔗 {config.nameZh}官方资源
          </h2>
          <div className="space-y-2">
            {officialLinks
              .filter((l: any) => l.url && l.url.trim())
              .map((link: any, i: number) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{link.label}</span>
                  <span className="text-xs text-gray-400 truncate flex-1 ml-auto">{link.url}</span>
                </a>
              ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">以上为官方资源链接，不含第三方广告。</p>
        </section>

        {/* ─── Community Discussion ─── */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-teal-600" />
            💬 {config.nameZh}相关社区讨论
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: `${config.nameZh}发货经验`, href: `/bbs?category=shipping` },
                { label: `${config.nameZh}地址邮编问题`, href: `/bbs?category=address-postal` },
                { label: `${config.nameZh}报关/HS问题`, href: `/bbs?category=customs` },
                { label: "工具使用问题", href: `/bbs?category=tools` },
              ].map((d) => (
                <Link key={d.href} href={d.href} className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-teal-50 transition-colors group">
                  <MessageCircle className="w-4 h-4 text-gray-400 group-hover:text-teal-500" />
                  <span className="text-sm text-gray-700 group-hover:text-teal-700">{d.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-teal-400 ml-auto" />
                </Link>
              ))}
            </div>
            <div className="mt-4">
              <Link
                href="/bbs"
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
              >
                进入社区讨论 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-teal-600" />
            ❓ {config.nameZh}常见问题
          </h2>
          <div className="space-y-3">
            {faqItems.map((faq: any, i: number) => (
              <details key={i} className="group bg-white border border-gray-200 rounded-lg">
                <summary className="cursor-pointer p-4 font-medium text-gray-900 flex items-center justify-between list-none">
                  {faq.question}
                  <span className="transition-transform group-open:rotate-180 text-gray-400">▼</span>
                </summary>
                <div className="px-4 pb-4 text-gray-600 leading-relaxed">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        {/* ─── Map Reference Note ─── */}
        <section className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            📍 地图参考说明
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            地图参考按城市/地区搜索，不代表精确邮编位置。邮编数据来源于公开数据源，结果仅供参考。正式发货前请以当地邮政或物流服务商信息为准。
          </p>
        </section>

        {/* ─── Data Status Notice (Tier 2/3) ─── */}
        {config.completenessTier >= 2 && (
          <section className="bg-blue-50 border border-blue-100 rounded-xl p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-2">📊 数据覆盖说明</h2>
            <div className="space-y-1 text-sm text-gray-600">
              <p>邮编数据库：{config.postalDataStatus === 'full' ? '✅ 可查' : config.postalDataStatus === 'partial' ? '⚠️ 部分可查' : '❌ 暂未接入可查询邮编数据库'}</p>
              <p>地址格式：{config.addressFormatExample && !config.addressFormatExample.includes('being collected') ? '✅ 已配置' : '⚠️ 基础参考，待补'}</p>
              <p>官方链接：{config.officialPostalUrl && config.officialPostalUrl.trim() ? '✅ 已确认' : '⚠️ 待确认'}</p>
              <p>指南/清单：{config.completenessTier === 1 ? '✅ 已有' : '⚠️ 正在补充'}</p>
            </div>
          </section>
        )}

        {/* ─── Related Countries ─── */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-teal-600" />
            🌍 其他国家指南
          </h2>
          <div className="flex flex-wrap gap-2">
            {otherCountries.map((c) => (
              <Link
                key={c.slug}
                href={`/countries/${c.slug}`}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-teal-50 hover:border-teal-200 transition-colors"
              >
                {c.flagEmoji} {c.nameZh}
              </Link>
            ))}
          </div>
        </section>

        {/* ─── TaskChain CTA ─── */}
        <TaskChainCta
          title={`开始中国寄${config.nameZh}任务链`}
          description="把本页工具和指南加入发货任务链，使用工具生成发票/装箱单草稿。"
        />

        {/* ─── Disclaimer ─── */}
        <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
          <p className="text-sm text-amber-800">
            <span className="font-medium">免责声明：</span>
            本页内容仅供参考，各国政策、海关规定及平台规则可能随时变化，请以官方最新信息为准。
          </p>
        </div>

        {/* ─── Back navigation ─── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/countries"
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all"
          >
            <Home className="w-4 h-4" />
            返回国家列表
          </Link>
        </div>
      </div>
    </div>
  );
}
