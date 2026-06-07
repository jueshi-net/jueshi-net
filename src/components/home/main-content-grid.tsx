import Link from "next/link";
import {
  PackageSearch,
  Sparkles,
  Target,
  Library,
  MapPin,
  Hash,
  FileText,
  Wrench,
  Flame,
  LogIn,
  ArrowRight,
  Eye,
  ThumbsUp,
  Globe,
  Ship,
  Clock,
  Warehouse,
  Scale,
  Shield,
  Phone,
  BarChart3,
  QrCode,
  Plane,
  Building2,
  BookOpen,
  Users,
  Calculator,
  ArrowLeftRight,
  Container,
  Package,
  Monitor,
  Rocket,
  Receipt,
  ShoppingBag,
  CreditCard,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

/* ─── Icon map for Tool model ─── */
const ICON_MAP: Record<string, React.ElementType> = {
  MapPin, Hash, FileText, Library, Target, Sparkles, PackageSearch,
  Wrench, Plane, Building2, BookOpen, Users, Globe, Ship, Clock,
  Warehouse, Scale, Shield, Phone, BarChart3, QrCode, Calculator,
  ArrowLeftRight, Container, Package, Monitor, Rocket, Receipt,
  ShoppingBag, CreditCard,
};

/* ─── Category → tag color mapping ─── */
const TAG_COLORS: Record<string, string> = {
  logistics: "bg-[#fffbeb] text-[#d97706]",
  ecommerce: "bg-[#f0f4ff] text-[#2563eb]",
  tax: "bg-[#fff1f2] text-[#e11d48]",
  ai: "bg-[#f5f3ff] text-[#7c3aed]",
  life: "bg-[#ecfdf5] text-[#059669]",
  business: "bg-[#ecfeff] text-[#0891b2]",
  templates: "bg-[#f8fafc] text-[#475569]",
  general: "bg-[#f6f9fc] text-[#64748d]",
};

const RESOURCE_COLORS: Record<string, string> = {
  logistics: "from-[#f59e0b] to-[#d97706]",
  ecommerce: "from-[#3b82f6] to-[#2563eb]",
  tax: "from-[#f43f5e] to-[#e11d48]",
  ai: "from-[#8b5cf6] to-[#7c3aed]",
  life: "from-[#10b981] to-[#059669]",
  business: "from-[#06b6d4] to-[#0891b2]",
  templates: "from-[#64748b] to-[#475569]",
  general: "from-[#64748b] to-[#475569]",
};

const CATEGORY_LABELS: Record<string, string> = {
  logistics: "物流",
  ecommerce: "电商",
  tax: "税务",
  ai: "AI",
  life: "生活",
  business: "商业",
  templates: "模板",
  general: "综合",
};

/* ─── Fallback data ─── */
const FALLBACK_NAV = [
  { label: "邮编查询", desc: "支持 200+ 国家", route: "/tools/postal-code", icon: "MapPin" },
  { label: "HS 编码", desc: "海关商品编码", route: "/tools/hs-code", icon: "Hash" },
  { label: "运费计算器", desc: "多渠道比价", route: "/tools/shipping-calculator", icon: "Calculator" },
  { label: "单据中心", desc: "发票·唛头·报价单", route: "/tools/documents", icon: "FileText" },
  { label: "网址导航", desc: "出海工具集合", route: "/resources", icon: "Library" },
  { label: "专题库", desc: "跨境电商运营指南", route: "/topics", icon: "Target" },
  { label: "AI 工具集", desc: "翻译·摘要·文案", route: "/ai-tools", icon: "Sparkles" },
  { label: "物流追踪", desc: "多承运商跟踪", route: "/tracking", icon: "PackageSearch" },
];

const FALLBACK_RESOURCES = [
  { name: "Shopify 开店指南", url: "/resources/shopify", description: "从零搭建独立站全流程", category: "ecommerce", tags: [] as string[] },
  { name: "Stripe 收款教程", url: "/resources/stripe", description: "跨境支付合规与费率", category: "tax", tags: [] as string[] },
  { name: "跨境 ERP 选型对比", url: "/resources/erp", description: "主流 ERP 功能与价格分析", category: "business", tags: [] as string[] },
  { name: "TikTok Shop 运营", url: "/resources/tiktok", description: "短视频电商从 0 到 1", category: "ecommerce", tags: [] as string[] },
  { name: "各国清关政策汇总", url: "/resources/customs", description: "重点国家清关流程详解", category: "logistics", tags: [] as string[] },
  { name: "美国销售税合规", url: "/resources/tax", description: "各州税率与申报指南", category: "tax", tags: [] as string[] },
  { name: "Amazon 全球开店", url: "/resources/amazon", description: "各站点入驻条件与费用", category: "ecommerce", tags: [] as string[] },
  { name: "国际快递渠道对比", url: "/resources/logistics", description: "DHL/FedEx/UPS 价格分析", category: "logistics", tags: [] as string[] },
];

const FALLBACK_TOPICS = [
  { title: "海外开户攻略全解", slug: "overseas-bank", coverEmoji: null },
  { title: "外贸 SOHO 起步", slug: "soho-guide", coverEmoji: null },
  { title: "数字游民签证合集", slug: "digital-nomad", coverEmoji: null },
  { title: "各国免税额度", slug: "tax-free", coverEmoji: null },
  { title: "东南亚长居签证", slug: "visa-guide", coverEmoji: null },
  { title: "加拿大专线集运", slug: "canada-shipping", coverEmoji: null },
];

/* ─── Types ─── */
type ToolData = {
  name: string;
  description: string | null;
  slug: string;
  route: string | null;
  url: string | null;
  isInternal: boolean;
  icon: string | null;
};

type ResourceData = {
  name: string;
  url: string;
  description: string | null;
  category: string;
  tags: string[];
  favicon: string | null;
  iconUrl: string | null;
};

type TopicData = {
  title: string;
  slug: string;
  coverEmoji: string | null;
  coverImage: string | null;
  tags: unknown;
};

interface MainContentGridProps {
  hotNav: ToolData[];
  latestResources: ResourceData[];
  hotTopics: TopicData[];
}

const itemClasses = "group flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent transition-all duration-300 hover:-translate-y-[2px] hover:bg-white hover:shadow-[0_8px_30px_rgba(83,58,253,0.08)] hover:border-gray-200/80";
const resourceClasses = "group flex items-center gap-4 px-3 py-3 rounded-xl border border-transparent transition-all duration-300 hover:-translate-y-[2px] hover:bg-white hover:shadow-[0_8px_30px_rgba(83,58,253,0.08)] hover:border-gray-200/80";
const topicClasses = "group flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent transition-all duration-300 hover:-translate-y-[2px] hover:bg-white hover:shadow-[0_8px_30px_rgba(83,58,253,0.08)] hover:border-gray-200/80";

export default function MainContentGrid({ hotNav, latestResources, hotTopics }: MainContentGridProps) {
  /* ─── Resolve data with fallbacks ─── */
  const navItems = hotNav.length > 0 ? hotNav : null;
  const resourceItems = latestResources.length > 0 ? latestResources : null;
  const topicItems = hotTopics.length > 0 ? hotTopics : null;

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10">

      {/* Section headers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-3">
          <h2 className="text-[22px] font-light tracking-tight text-[#061b31] leading-tight" style={{ letterSpacing: "-0.22px" }}>
            热门导航
          </h2>
        </div>
        <div className="lg:col-span-6">
          <h2 className="text-[22px] font-light tracking-tight text-[#061b31] leading-tight" style={{ letterSpacing: "-0.22px" }}>
            最新资源
          </h2>
        </div>
        <div className="lg:col-span-3">
          <h2 className="text-[22px] font-light tracking-tight text-[#061b31] leading-tight" style={{ letterSpacing: "-0.22px" }}>
            热门话题
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ─── Left: Hot Nav ─── */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200/60 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.06)] p-4">
            <div className="space-y-1">
              {navItems
                ? navItems.map((item) => {
                    const Icon = ICON_MAP[item.icon || "Globe"] || Globe;
                    const href = item.isInternal && item.route ? item.route : (item.url || "#");
                    const isExternal = !item.isInternal && item.url;
                    return (
                      <Link
                        key={item.slug}
                        href={href}
                        className={itemClasses}
                        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        <div className="w-8 h-8 flex items-center justify-center rounded-[4px] bg-[#f6f9fc] group-hover:bg-[#f5f3ff] transition-all flex-shrink-0">
                          <Icon className="w-4 h-4 text-[#94a3b8] group-hover:text-[#533afd] transition-colors" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[14px] font-medium text-[#061b31] truncate group-hover:text-[#533afd] transition-colors">
                            {item.name}
                          </div>
                          <div className="text-[12px] text-gray-400 truncate mt-0.5">
                            {item.description || ""}
                          </div>
                        </div>
                      </Link>
                    );
                  })
                : FALLBACK_NAV.map((item) => {
                    const Icon = ICON_MAP[item.icon] || Globe;
                    return (
                      <Link
                        key={item.route}
                        href={item.route}
                        className={itemClasses}
                      >
                        <div className="w-8 h-8 flex items-center justify-center rounded-[4px] bg-[#f6f9fc] group-hover:bg-[#f5f3ff] transition-all flex-shrink-0">
                          <Icon className="w-4 h-4 text-[#94a3b8] group-hover:text-[#533afd] transition-colors" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[14px] font-medium text-[#061b31] truncate group-hover:text-[#533afd] transition-colors">
                            {item.label}
                          </div>
                          <div className="text-[12px] text-gray-400 truncate mt-0.5">
                            {item.desc}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
            </div>
          </div>
        </div>

        {/* ─── Center: Latest Resources ─── */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-xl border border-gray-200/60 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.06)] p-4">
            <div className="space-y-1">
              {resourceItems
                ? resourceItems.map((item, idx) => {
                    const colorClass = RESOURCE_COLORS[item.category] || "from-[#64748b] to-[#475569]";
                    const tagColor = TAG_COLORS[item.category] || "bg-[#f6f9fc] text-[#64748d]";
                    const tagLabel = CATEGORY_LABELS[item.category] || item.category;
                    const firstTag = item.tags[0] || tagLabel;
                    return (
                      <Link
                        key={item.url}
                        href={item.url}
                        className={resourceClasses}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className={`w-10 h-10 flex items-center justify-center rounded-[6px] bg-gradient-to-br ${colorClass} flex-shrink-0 shadow-[0px_2px_5px_rgba(0,0,0,0.08)]`}>
                          <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[14px] font-medium text-[#061b31] group-hover:text-[#533afd] transition-colors truncate">
                              {item.name}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-medium flex-shrink-0 ${tagColor}`}>
                              {firstTag}
                            </span>
                          </div>
                          <p className="text-[12px] text-gray-400 truncate">{item.description || ""}</p>
                        </div>
                      </Link>
                    );
                  })
                : FALLBACK_RESOURCES.map((item) => {
                    const colorClass = RESOURCE_COLORS[item.category] || "from-[#64748b] to-[#475569]";
                    const tagColor = TAG_COLORS[item.category] || "bg-[#f6f9fc] text-[#64748d]";
                    const tagLabel = CATEGORY_LABELS[item.category] || item.category;
                    return (
                      <Link
                        key={item.url}
                        href={item.url}
                        className={resourceClasses}
                      >
                        <div className={`w-10 h-10 flex items-center justify-center rounded-[6px] bg-gradient-to-br ${colorClass} flex-shrink-0 shadow-[0px_2px_5px_rgba(0,0,0,0.08)]`}>
                          <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[14px] font-medium text-[#061b31] group-hover:text-[#533afd] transition-colors truncate">
                              {item.name}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-medium flex-shrink-0 ${tagColor}`}>
                              {tagLabel}
                            </span>
                          </div>
                          <p className="text-[12px] text-gray-400 truncate">{item.description || ""}</p>
                        </div>
                      </Link>
                    );
                  })}
            </div>
          </div>
        </div>

        {/* ─── Right: Hot Topics ─── */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-gray-200/60 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.06)] p-4 flex-1">
            <div className="space-y-1">
              {topicItems
                ? topicItems.map((topic, i) => (
                    <Link
                      key={topic.slug}
                      href={`/topics/${topic.slug}`}
                      className={topicClasses}
                    >
                      <span
                        className={`w-5 h-5 flex items-center justify-center rounded-[4px] text-[10px] flex-shrink-0 ${
                          i === 0
                            ? "bg-[#fff7ed] text-[#ea580c] font-semibold"
                            : "bg-[#f6f9fc] text-gray-400"
                        }`}
                      >
                        {i === 0 ? <Flame className="w-3 h-3" /> : topic.coverEmoji || (i + 1)}
                      </span>
                      <span className="text-[14px] text-[#273951] group-hover:text-[#061b31] transition-colors truncate">
                        {topic.title}
                      </span>
                    </Link>
                  ))
                : FALLBACK_TOPICS.map((topic, i) => (
                    <Link
                      key={topic.slug}
                      href={`/topics/${topic.slug}`}
                      className={topicClasses}
                    >
                      <span
                        className={`w-5 h-5 flex items-center justify-center rounded-[4px] text-[10px] flex-shrink-0 ${
                          i === 0
                            ? "bg-[#fff7ed] text-[#ea580c] font-semibold"
                            : "bg-[#f6f9fc] text-gray-400"
                        }`}
                      >
                        {i === 0 ? <Flame className="w-3 h-3" /> : i + 1}
                      </span>
                      <span className="text-[14px] text-[#273951] group-hover:text-[#061b31] transition-colors truncate">
                        {topic.title}
                      </span>
                    </Link>
                  ))}
            </div>
          </div>

          {/* Login CTA */}
          <div className="bg-white rounded-xl border border-gray-200/60 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.06)] p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-[6px] bg-[#f6f9fc] flex items-center justify-center flex-shrink-0">
                <LogIn className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <div className="text-[14px] font-medium text-[#061b31]">登录后查看</div>
                <div className="text-[12px] text-gray-400">收藏 · 历史 · 个性化推荐</div>
              </div>
            </div>
            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 w-full h-10 bg-[#061b31] text-white text-[14px] font-medium rounded-[4px] hover:bg-[#0d253d] transition-colors"
            >
              登录 / 注册
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Unified "See More" ghost button ─── */}
      <div className="flex justify-center mt-12">
        <Link
          href="/resources"
          className="group flex items-center gap-2 px-6 py-2.5 text-[14px] font-medium text-[#533afd] border border-[#b9b9f9] rounded-[4px] hover:bg-[rgba(83,58,253,0.05)] hover:border-[#533afd] transition-all"
        >
          查看更多全站资源
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
